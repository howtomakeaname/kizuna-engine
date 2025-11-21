
export interface Heroine {
  id: string;
  name: string;
  archetype: string;
  affection: number;
  status: string; // e.g., "Friendly", "Neutral", "Crushing"
  description: string; // Visual description for consistency
}

export interface Choice {
  id: string;
  text: string;
}

export interface UnlockableCG {
  id: string;
  title: string;
  description: string;
}

export interface SavedCG extends UnlockableCG {
  imageData: string; // Base64 image string
  timestamp: number;
  type?: 'event' | 'scene'; // To distinguish between special CGs and regular backgrounds
}

export interface GameState {
  playerName: string; // Name of the protagonist
  narrative: string;
  choices: Choice[];
  heroines: Heroine[];
  inventory: string[];
  currentQuest: string;
  location: string;
  imagePrompt: string;
  turnCount: number;
  history: string[]; // Summary of past events to feed back to context
  unlockCg?: UnlockableCG; // If present, the current scene is a special CG event
  currentBgImage?: string; // Used for saving the game state with the image
  theme: string; // The current active theme of the story
  bgm?: string; // Current background music mood
  soundEffect?: string; // Immediate sound effect to play
  language: string; // Language code (en, zh, ja, ru)
}

export interface SceneResponse {
  narrative: string;
  choices: Choice[];
  heroines: Heroine[]; // Full updated list
  inventory: string[];
  currentQuest: string;
  location: string;
  imagePrompt: string | null; // Nullable to save generation costs
  unlockCg?: UnlockableCG; // Optional CG unlock data
  bgm?: string; // Suggested BGM mood
  soundEffect?: string; // One-shot SFX
}

export interface SaveSlot {
  id: string;
  timestamp: number;
  location: string;
  turnCount: number;
  previewImage: string; // Small thumbnail or the full bg
  gameState: GameState;
}

export enum GameStatus {
  START_SCREEN,
  LOADING_SCENE,
  PLAYING,
  GAME_OVER,
  ERROR
}

export type AiProvider = 'gemini' | 'siliconflow' | 'custom';

export interface AppConfig {
  aiProvider: AiProvider;
  geminiKey: string;
  siliconFlowKey: string;
  siliconFlowModel: string;
  siliconFlowImageModel: string;
  customApiUrl: string;
  customApiKey: string;
  customModelName: string;
  customImageApiUrl: string;
  customImageModelName: string;
}
