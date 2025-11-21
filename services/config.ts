import { AppConfig } from "../types";

const STORAGE_KEY = "ke_config_v1";

export const getStoredConfig = (): AppConfig => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new fields in future
      return {
        ...getDefaultConfig(),
        ...parsed
      };
    } catch (e) {
      console.error("Failed to parse stored config", e);
    }
  }
  return getDefaultConfig();
};

export const getDefaultConfig = (): AppConfig => {
  return {
    aiProvider: (process.env.AI_PROVIDER as any) || 'gemini',
    geminiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
    siliconFlowKey: process.env.SILICONFLOW_API_KEY || '',
    siliconFlowModel: 'deepseek-ai/DeepSeek-V3',
    siliconFlowImageModel: 'Qwen/Qwen-Image',
    customApiUrl: process.env.CUSTOM_API_URL || '',
    customApiKey: process.env.CUSTOM_API_KEY || '',
    customModelName: process.env.CUSTOM_MODEL_NAME || 'gpt-3.5-turbo',
    customImageApiUrl: process.env.CUSTOM_IMAGE_API_URL || '',
    customImageModelName: process.env.CUSTOM_IMAGE_MODEL_NAME || '',
  };
};

export const saveConfig = (config: AppConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const clearConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const hasValidConfig = (): boolean => {
  const config = getStoredConfig();
  if (config.aiProvider === 'gemini') return !!config.geminiKey;
  if (config.aiProvider === 'siliconflow') return !!config.siliconFlowKey;
  if (config.aiProvider === 'custom') return !!config.customApiUrl;
  return false;
};
