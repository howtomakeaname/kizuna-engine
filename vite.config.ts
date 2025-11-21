import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.AI_PROVIDER': JSON.stringify(env.AI_PROVIDER),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.SILICONFLOW_API_KEY': JSON.stringify(env.SILICONFLOW_API_KEY),
        'process.env.CUSTOM_API_URL': JSON.stringify(env.CUSTOM_API_URL),
        'process.env.CUSTOM_API_KEY': JSON.stringify(env.CUSTOM_API_KEY),
        'process.env.CUSTOM_MODEL_NAME': JSON.stringify(env.CUSTOM_MODEL_NAME),
        'process.env.CUSTOM_IMAGE_API_URL': JSON.stringify(env.CUSTOM_IMAGE_API_URL),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});