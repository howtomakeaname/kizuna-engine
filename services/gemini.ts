
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { GameState, SceneResponse, Heroine, UnlockableCG } from "../types";

// --- Configuration ---
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const SILICONFLOW_KEY = process.env.SILICONFLOW_API_KEY;

// Custom API Configuration
const CUSTOM_API_URL = process.env.CUSTOM_API_URL; // e.g., "http://localhost:11434/v1/chat/completions"
const CUSTOM_API_KEY = process.env.CUSTOM_API_KEY;
const CUSTOM_MODEL_NAME = process.env.CUSTOM_MODEL_NAME;
const CUSTOM_IMAGE_API_URL = process.env.CUSTOM_IMAGE_API_URL; // e.g., "http://localhost:11434/v1/images/generations"

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
      description: "3 distinct choices for the player.",
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
      description: "A highly detailed prompt for an image generator. Matches the visual style of the theme.",
    },
    unlockCg: {
      type: Type.OBJECT,
      description: "Only provide this if the scene is a major romantic event (Confession, Kiss, Date).",
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
    "imagePrompt": "string",
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

**Game Rules**:
1. Track affection (0-100).
2. Update 'unlockCg' ONLY for major milestones (Affection > 80 events).
3. Return JSON only.
`;

// --- Core Generation Logic ---

const generateText = async (
  prompt: string, 
  schemaInstruction: string, 
  geminiSchema: Schema
): Promise<any> => {
  
  // === CUSTOM API (User Built / Self-Hosted) ===
  if (AI_PROVIDER === 'custom') {
    if (!CUSTOM_API_URL) throw new Error("CUSTOM_API_URL is missing. Please check your .env file.");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (CUSTOM_API_KEY) {
        headers["Authorization"] = `Bearer ${CUSTOM_API_KEY}`;
      }

      const response = await fetch(CUSTOM_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: CUSTOM_MODEL_NAME || "gpt-3.5-turbo", // Default to common alias if not provided
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
  else if (AI_PROVIDER === 'siliconflow') {
    if (!SILICONFLOW_KEY) throw new Error("SILICONFLOW_API_KEY is missing in environment variables.");

    try {
      const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SILICONFLOW_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V3", 
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
    if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY is missing.");
    const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
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

export const generateInitialScene = async (theme: string, language: string): Promise<SceneResponse> => {
  const prompt = `
    Start a new visual novel game.
    Theme: "${theme}"
    Language: "${language}" (Output all narrative/text in this language)
    
    1. Create 3 heroines fitting this theme (Archetypes, Names, Visuals).
    2. Scene: Introductory scene fitting the theme.
    3. Intro text: 1 sentence greeting or action from a main heroine.
    4. 3 Choices for the player to start the story.
    5. Suggest BGM and Sound Effect.
  `;
  return generateText(prompt, getJsonSchemaInstruction(), sceneSchema);
};

export const generateNextScene = async (
  currentState: GameState,
  choiceId: string
): Promise<SceneResponse> => {
  const prompt = `
    Theme: "${currentState.theme}"
    Language: "${currentState.language}" (Output all narrative/text in this language)
    Context:
    - Location: ${currentState.location}
    - Quest: ${currentState.currentQuest}
    - Heroines: ${currentState.heroines.map(h => `${h.name} (${h.affection})`).join(", ")}
    - History: ${currentState.history.slice(-3).join(" | ")}

    Action: Player chose "${currentState.choices.find(c => c.id === choiceId)?.text}".

    Task:
    1. Write 1-2 sentences of reaction/dialogue.
    2. Update stats.
    3. Provide 3 choices.
    4. New image prompt.
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
  const enhancedPrompt = `Anime art style, masterpiece, high quality, 4k, cinematic lighting, detailed background. ${prompt}`;

  // === CUSTOM IMAGE API ===
  if (AI_PROVIDER === 'custom') {
    if (CUSTOM_IMAGE_API_URL) {
       try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json"
          };
          if (CUSTOM_API_KEY) {
            headers["Authorization"] = `Bearer ${CUSTOM_API_KEY}`;
          }

          // Expecting OpenAI-compatible Image Generation Endpoint (e.g., /v1/images/generations)
          const response = await fetch(CUSTOM_IMAGE_API_URL, {
            method: "POST",
            headers,
            body: JSON.stringify({
              prompt: enhancedPrompt,
              n: 1,
              size: "1024x1024", // Standard size
              response_format: "b64_json" // Prefer base64 for immediate display
            })
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
  else if (AI_PROVIDER === 'siliconflow') {
    if (!SILICONFLOW_KEY) throw new Error("SILICONFLOW_API_KEY is missing");

    try {
      const response = await fetch("https://api.siliconflow.cn/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SILICONFLOW_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Qwen/Qwen-Image",
          prompt: enhancedPrompt,
          image_size: "1664x928",
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
    if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY is missing.");
    const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
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
