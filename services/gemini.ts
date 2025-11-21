

import { GoogleGenAI, Schema, Type } from "@google/genai";
import { GameState, SceneResponse, Heroine, UnlockableCG } from "../types";
import { getStoredConfig } from "./config";

// --- Schemas ---

// Gemini SDK Schema
const sceneSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: "STRICTLY 1-2 sentences maximum. Dialogue or action only. No long descriptions.",
    },
    choices: {
      type: Type.ARRAY,
      description: "Array of choices. If it is a conversation turn, provide exactly 1 choice 'Next'. If it is a decision point, provide 3 distinct choices.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING, description: "Short choice text." },
        },
        required: ["id", "text"],
      },
    },
    heroines: {
      type: Type.ARRAY,
      description: "The list of heroines with updated stats.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          archetype: { type: Type.STRING },
          affection: { type: Type.NUMBER, description: "0 to 100" },
          status: { type: Type.STRING, description: "Current relationship status label" },
          description: { type: Type.STRING, description: "Visual description of appearance" },
        },
        required: ["id", "name", "archetype", "affection", "status", "description"],
      },
    },
    inventory: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Current items held by the player.",
    },
    currentQuest: {
      type: Type.STRING,
      description: "The immediate objective.",
    },
    location: {
      type: Type.STRING,
      description: "Current location name.",
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A highly detailed prompt for an image generator. Return NULL if the scene background has not changed significantly from the previous turn.",
      nullable: true
    },
    unlockCg: {
      type: Type.OBJECT,
      description: "Only provide this if the scene is a major romantic event (Affection > 80).",
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["id", "title", "description"],
      nullable: true
    },
    bgm: {
      type: Type.STRING,
      description: "The mood of the music. Options: 'SliceOfLife', 'Sentimental', 'Tension', 'Action', 'Mystery', 'Romantic', 'Comical', 'Magical'.",
    },
    soundEffect: {
      type: Type.STRING,
      description: "Optional sound effect. Options: 'SchoolBell', 'DoorOpen', 'Footsteps', 'Heartbeat', 'Explosion', 'MagicChime', 'None'.",
      nullable: true
    }
  },
  required: ["narrative", "choices", "heroines", "inventory", "currentQuest", "location", "imagePrompt"],
};

const secretMemorySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    imagePrompt: { type: Type.STRING }
  },
  required: ["id", "title", "description", "imagePrompt"]
};

// Standard JSON Schema Instruction for non-Gemini providers
const getJsonSchemaInstruction = () => `
  You must output strictly valid JSON. 
  Follow this schema structure exactly:
  {
    "narrative": "string (1-2 sentences max, dialogue/action only)",
    "choices": [{ "id": "string", "text": "string" }],
    "heroines": [{ "id": "string", "name": "string", "archetype": "string", "affection": number, "status": "string", "description": "string" }],
    "inventory": ["string"],
    "currentQuest": "string",
    "location": "string",
    "imagePrompt": "string (OR null if scene/bg has NOT changed)",
    "unlockCg": { "id": "string", "title": "string", "description": "string" } (optional, use null),
    "bgm": "string (SliceOfLife, Sentimental, Tension, Action, Mystery, Romantic, Comical, Magical)",
    "soundEffect": "string (SchoolBell, DoorOpen, Footsteps, Heartbeat, Explosion, MagicChime, None)"
  }
`;

const getSecretMemorySchemaInstruction = () => `
  You must output strictly valid JSON.
  Follow this schema structure exactly:
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "imagePrompt": "string"
  }
`;

const SYSTEM_INSTRUCTION = `
You are 'Kizuna Engine', a game master for an Infinite Visual Novel.
**CRITICAL STYLE RULES**:
1. **EXTREME CONCISENESS**: Output must be 1-2 sentences MAX.
2. **Dialogue-First**: Prioritize what characters say. Format: "Name: 'Dialogue'".
3. **No Prose**: Do not write long descriptions. Show, don't tell.
4. **Anime Tropes**: Lean into tropes appropriate for the theme.
5. **Audio Direction**: Always suggest a BGM mood and sound effects to match the scene.
6. **Language**: You MUST output the narrative, choices, quest, location, and heroine details in the requested target language.
7. **Player Name**: Refer to the main character as the provided Player Name if needed, but prefer first-person perspective or "You".

**Game Rules**:
1. Track affection (0-100).
2. Update 'unlockCg' ONLY for major milestones (Affection > 80 events).
3. Optimize resources: Do NOT generate a new 'imagePrompt' if the visual background has not changed. Use null.
4. Return JSON only.
`;

// --- Core Generation Logic ---

const generateText = async (
  prompt: string, 
  schemaInstruction: string, 
  geminiSchema: Schema
): Promise<any> => {
  
  const config = getStoredConfig();

  // === CUSTOM API (User Built / Self-Hosted) ===
  if (config.aiProvider === 'custom') {
    if (!config.customApiUrl) throw new Error("CUSTOM_API_URL is missing. Please configure settings.");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (config.customApiKey) {
        headers["Authorization"] = `Bearer ${config.customApiKey}`;
      }

      const response = await fetch(config.customApiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.customModelName || "gpt-3.5-turbo", 
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION + "\n\n" + schemaInstruction },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 4096,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Custom API Error:", errText);
        throw new Error(`Custom API Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) throw new Error("No content received from Custom API");
      
      // Attempt to clean code blocks if the model wraps JSON in markdown
      const cleanContent = content.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(cleanContent);
    } catch (e) {
      console.error("Custom API Text Gen Failed", e);
      throw e;
    }
  }

  // === SILICONFLOW (DeepSeek) ===
  else if (config.aiProvider === 'siliconflow') {
    if (!config.siliconFlowKey) throw new Error("SiliconFlow Key is missing. Please configure settings.");

    try {
      const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.siliconFlowKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: config.siliconFlowModel || "deepseek-ai/DeepSeek-V3", 
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION + "\n\n" + schemaInstruction },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 4096,
          temperature: 1.0
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("SiliconFlow Error Details:", errText);
        throw new Error(`SiliconFlow API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) throw new Error("No content received from SiliconFlow");
      
      const cleanContent = content.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(cleanContent);
    } catch (e) {
      console.error("SiliconFlow Text Gen Failed", e);
      throw e;
    }
  } 
  
  // === GEMINI (Default) ===
  else {
    if (!config.geminiKey) throw new Error("Gemini API Key is missing. Please configure settings.");
    const ai = new GoogleGenAI({ apiKey: config.geminiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: geminiSchema,
        temperature: 1.0,
      },
    });

    if (!response.text) throw new Error("No response from Kizuna Engine");
    return JSON.parse(response.text);
  }
};

// --- Exported Functions ---

export const generateInitialScene = async (theme: string, language: string, playerName: string): Promise<SceneResponse> => {
  const prompt = `
    Start a new visual novel game.
    Theme: "${theme}"
    Player Name: "${playerName}"
    Language: "${language}" (Output all narrative/text in this language)
    
    1. Create 3 heroines fitting this theme (Archetypes, Names, Visuals).
    2. Scene: Introductory scene fitting the theme.
    3. Intro text: 1 sentence greeting or action from a main heroine.
    4. 3 Choices for the player to start the story.
    5. Suggest BGM and Sound Effect.
    6. IMPORTANT: "imagePrompt" MUST be provided (cannot be null) for the first scene.
  `;
  return generateText(prompt, getJsonSchemaInstruction(), sceneSchema);
};

export const generateNextScene = async (
  currentState: GameState,
  choiceId: string
): Promise<SceneResponse> => {
  
  // Pacing Logic: Every 4th turn is a major decision (Turns 4, 8, 12...)
  // Otherwise, it's a conversation continuation.
  const nextTurn = currentState.turnCount + 1;
  const isDecisionTurn = nextTurn % 4 === 0;

  const prompt = `
    Theme: "${currentState.theme}"
    Player Name: "${currentState.playerName}"
    Language: "${currentState.language}" (Output all narrative/text in this language)
    Context:
    - Location: ${currentState.location}
    - Quest: ${currentState.currentQuest}
    - Heroines: ${currentState.heroines.map(h => `${h.name} (${h.affection})`).join(", ")}
    - History: ${currentState.history.slice(-3).join(" | ")}

    Action: Player chose "${currentState.choices.find(c => c.id === choiceId)?.text}".

    Task:
    1. Write 1-2 sentences of reaction/dialogue based on the action. Use the player's name if appropriate.
    2. Update stats.
    3. **Choices Generation**:
       ${isDecisionTurn 
         ? "This is a MAJOR DECISION point. Provide 3 distinct, diverging choices that affect the plot or relationships." 
         : "This is a CONVERSATION step. Provide exactly 1 linear choice: [{ 'id': 'continue', 'text': 'Next' }] to advance the dialogue naturally."}
    4. **Image Generation**: If the scene location or visual atmosphere changes significantly, provide a new 'imagePrompt'. **If the background is the same, strictly return NULL for imagePrompt to save costs.**
    5. Suggest BGM (mood) and SFX.
  `;
  return generateText(prompt, getJsonSchemaInstruction(), sceneSchema);
};

export const generateSecretMemory = async (heroine: Heroine, theme: string, language: string): Promise<UnlockableCG & { imagePrompt: string }> => {
  const prompt = `
    Generate a 'Secret Memory' (Bonus CG) for ${heroine.name} (Archetype: ${heroine.archetype}).
    Theme: "${theme}"
    Language: "${language}" (Output titles/descriptions in this language)
    Scene: A romantic, hypothetical future date or secret moment.
    Return JSON: { id, title, description, imagePrompt }.
  `;
  return generateText(prompt, getSecretMemorySchemaInstruction(), secretMemorySchema);
};

export const generateSceneImage = async (prompt: string): Promise<string> => {
  // Optimized prompt for Japanese anime style with high quality and bright colors
  const enhancedPrompt = `Japanese anime art style, masterpiece, best quality, ultra detailed, 4k, vibrant, bright colors, soft lighting, beautiful composition, detailed background, visual novel CG. ${prompt}`;
  const config = getStoredConfig();

  // === CUSTOM IMAGE API ===
  if (config.aiProvider === 'custom') {
    if (config.customImageApiUrl) {
       try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json"
          };
          if (config.customApiKey) {
            headers["Authorization"] = `Bearer ${config.customApiKey}`;
          }

          const body: any = {
              prompt: enhancedPrompt,
              n: 1,
              size: "1024x1024", 
              response_format: "b64_json" 
          };
          
          // Inject model if configured
          if (config.customImageModelName) {
              body.model = config.customImageModelName;
          }

          const response = await fetch(config.customImageApiUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
          });

          if (!response.ok) throw new Error("Custom Image API Error");
          
          const data = await response.json();
          
          // Handle Base64 or URL response
          if (data.data?.[0]?.b64_json) {
            return `data:image/jpeg;base64,${data.data[0].b64_json}`;
          } else if (data.data?.[0]?.url) {
             // Proxy URL through fetch to convert to base64 to avoid CORS if necessary, or just return URL
             return data.data[0].url; 
          }
          throw new Error("Unknown response format from Custom Image API");
       } catch (e) {
         console.error("Custom Image Gen Error:", e);
         return `https://placehold.co/1280x720/333/white?text=${encodeURIComponent("Custom API Error")}`;
       }
    } else {
      // If no image API is provided, return a placeholder without erroring
      return `https://placehold.co/1280x720/222/white?text=${encodeURIComponent("No Image API Configured")}`;
    }
  }

  // === SILICONFLOW IMAGE ===
  else if (config.aiProvider === 'siliconflow') {
    if (!config.siliconFlowKey) throw new Error("SiliconFlow Key is missing");

    try {
      const response = await fetch("https://api.siliconflow.cn/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.siliconFlowKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: config.siliconFlowImageModel || "Qwen/Qwen-Image", 
          prompt: enhancedPrompt,
          image_size: "1024x1024", // Updated from 1664x928 as Qwen-Image often prefers square or specific standard sizes
          seed: Math.floor(Math.random() * 999999999)
        })
      });

      if (!response.ok) {
        throw new Error("SiliconFlow Image Gen failed");
      }
      
      const data = await response.json();
      const imageUrl = data.images?.[0]?.url;
      if (!imageUrl) throw new Error("No image URL returned");

      // Fetch and convert to base64 to avoid hotlinking/CORS issues
      const imageRes = await fetch(imageUrl);
      const blob = await imageRes.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("SF Image Gen Error:", e);
      return `https://placehold.co/1280x720/pink/white?text=${encodeURIComponent("SiliconFlow Error")}`;
    }
  } 
  
  // === GEMINI IMAGE (Default) ===
  else {
    if (!config.geminiKey) throw new Error("Gemini Key is missing");
    const ai = new GoogleGenAI({ apiKey: config.geminiKey });
    try {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: enhancedPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "16:9",
          outputMimeType: "image/jpeg"
        }
      });
      return `data:image/jpeg;base64,${response.generatedImages?.[0]?.image?.imageBytes}`;
    } catch (e) {
      console.error("Gemini Image Gen Error", e);
      return `https://placehold.co/1280x720/pink/white?text=${encodeURIComponent("Visualizing...")}`;
    }
  }
};
