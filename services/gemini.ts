import { GoogleGenAI, Schema, Type } from "@google/genai";
import { GameState, SceneResponse, Heroine, UnlockableCG } from "../types";

// Initialize the client.
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the JSON output from the model
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
      description: "A highly detailed prompt for an image generator. Visual novel style background.",
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
  },
  required: ["narrative", "choices", "heroines", "inventory", "currentQuest", "location", "imagePrompt"],
};

const SYSTEM_INSTRUCTION = `
You are 'Kizuna Engine', a game master for a Japanese High School Visual Novel.
**CRITICAL STYLE RULES**:
1. **EXTREME CONCISENESS**: Output must be 1-2 sentences MAX.
2. **Dialogue-First**: Prioritize what characters say. Format: "Name: 'Dialogue'".
3. **No Prose**: Do not write long descriptions of the wind or feelings. Show, don't tell.
4. **Anime Tropes**: Lean into tropes (Tsundere blushing, childhood friend pouting).

**Game Rules**:
1. Track affection (0-100).
2. Update 'unlockCg' ONLY for major milestones (Affection > 80 events).
3. Return JSON only.
`;

export const generateInitialScene = async (): Promise<SceneResponse> => {
  const ai = getClient();
  
  const prompt = `
    Start a new game.
    1. Create 3 heroines (Osananajimi, Tsundere, Kouhai).
    2. Scene: School entrance, cherry blossoms.
    3. Intro text: 1 sentence greeting from the childhood friend.
    4. 3 Choices.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: sceneSchema,
      temperature: 1.0,
    },
  });

  if (!response.text) throw new Error("No response from Kizuna Engine");
  return JSON.parse(response.text) as SceneResponse;
};

export const generateNextScene = async (
  currentState: GameState,
  choiceId: string
): Promise<SceneResponse> => {
  const ai = getClient();

  const prompt = `
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
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: sceneSchema,
      temperature: 0.9,
    },
  });

  if (!response.text) throw new Error("No response from Kizuna Engine");
  return JSON.parse(response.text) as SceneResponse;
};

export const generateSceneImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  const enhancedPrompt = `Anime art style, visual novel background, Makoto Shinkai style, high quality, 4k. ${prompt}`;

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
    console.error("Image gen failed", e);
    return `https://placehold.co/1280x720/pink/white?text=${encodeURIComponent("Visualizing...")}`;
  }
};

export const generateSecretMemory = async (heroine: Heroine): Promise<UnlockableCG & { imagePrompt: string }> => {
  const ai = getClient();
  const prompt = `
    Generate a 'Secret Memory' (Bonus CG) for ${heroine.name} (Archetype: ${heroine.archetype}).
    Scene: A romantic, hypothetical future date or secret moment.
    Return JSON: { id, title, description, imagePrompt }.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      imagePrompt: { type: Type.STRING }
    },
    required: ["id", "title", "description", "imagePrompt"]
  };

  const response = await ai.models.generateContent({
     model: "gemini-2.5-flash",
     contents: prompt,
     config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 1.0
     }
  });
  
  if (!response.text) throw new Error("Failed to generate secret memory");
  return JSON.parse(response.text);
};