
import { getLatestPrompt, savePromptVersion, getPromptHistory, SavedPrompt } from "./db";

export type PromptType = 'initial' | 'next' | 'secret' | 'image';

export const DEFAULT_PROMPTS: Record<PromptType, string> = {
  initial: `Start a new visual novel game.
Theme: "{{theme}}"
Player Name: "{{playerName}}"
Language: "{{language}}" (Output all narrative/text in this language)

1. Create 3 heroines fitting this theme (Archetypes, Names, Visuals).
2. Scene: Introductory scene fitting the theme.
3. Intro text: 1 sentence greeting or action from a main heroine.
4. 3 Choices for the player to start the story.
5. Suggest BGM (SliceOfLife, Sentimental, Tension, Action, Mystery, Romantic, Comical, Magical, Melancholy, Upbeat, Battle, Horror, LateNight) and Sound Effect (SchoolBell, DoorOpen, Footsteps, Heartbeat, Explosion, MagicChime, Rain, Crowd, PhoneRing, Cheer).
6. IMPORTANT: "imagePrompt" MUST be provided (cannot be null) for the first scene.`,
  
  next: `Theme: "{{theme}}"
Player Name: "{{playerName}}"
Language: "{{language}}" (Output all narrative/text in this language)
Context:
- Location: {{location}}
- Quest: {{currentQuest}}
- Heroines: {{heroinesList}}
- History: {{historySummary}}
- Current BGM: {{currentBgm}}

Action: Player chose "{{choiceText}}".

Task:
1. Write 1-2 sentences of reaction/dialogue based on the action. Use the player's name if appropriate.
2. Update stats.
3. **Choices Generation**:
   {{choiceInstruction}}
4. **Image Generation**: If the scene location or visual atmosphere changes significantly, provide a new 'imagePrompt'. 
   - **CRITICAL**: You MUST explicitly describe the physical appearance (hair, eyes, clothes) of any heroine present in the prompt, using the descriptions from the Heroines list.
   - If the background is the same, strictly return NULL for imagePrompt to save costs.
5. Suggest BGM. 
   - Options: SliceOfLife, Sentimental, Tension, Action, Mystery, Romantic, Comical, Magical, Melancholy, Upbeat, Battle, Horror, LateNight, Cyberpunk, Historical.
   - Keep the current BGM ({{currentBgm}}) if the mood hasn't changed. Change it only if necessary.
6. Suggest SFX (SchoolBell, DoorOpen, Footsteps, Heartbeat, Explosion, MagicChime, Rain, Crowd, PhoneRing, Cheer, Scream, Whistle, None) only if a specific sound occurs.`,

  secret: `Generate a 'Secret Memory' (Bonus CG) for {{heroineName}} (Archetype: {{heroineArchetype}}).
Theme: "{{theme}}"
Language: "{{language}}" (Output titles/descriptions in this language)
Scene: A romantic, hypothetical future date or secret moment.
Return JSON: { id, title, description, imagePrompt }.`,

  image: `Japanese anime art style, masterpiece, best quality, ultra detailed, 4k, vibrant, bright colors, soft lighting, beautiful composition, detailed background, visual novel CG. {{prompt}}`
};

export const getActivePromptTemplate = async (type: PromptType): Promise<string> => {
  try {
    const custom = await getLatestPrompt(type);
    if (custom) return custom;
  } catch (e) {
    console.warn("Failed to fetch custom prompt, using default", e);
  }
  return DEFAULT_PROMPTS[type];
};

export const renderPrompt = (template: string, variables: Record<string, string>): string => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
};

export const saveCustomPrompt = async (type: PromptType, content: string) => {
  await savePromptVersion(type, content);
};

export const getPromptHistoryList = async (type: PromptType): Promise<SavedPrompt[]> => {
    return await getPromptHistory(type);
};
