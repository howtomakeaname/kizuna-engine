# Kizuna Engine - Infinite Galgame

A real-time, infinite visual novel generator powered by Generative AI.

## Configuration

This project supports multiple AI providers for text and image generation.

### Environment Variables

Configure the following variables in your environment (e.g., `.env` file):

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_PROVIDER` | Choose between `gemini` or `siliconflow`. | `gemini` |
| `API_KEY` | **Required for Gemini.** Your Google GenAI API Key. | - |
| `SILICONFLOW_API_KEY` | **Required for SiliconFlow.** Your SiliconFlow API Key. | - |
| `GEMINI_API_KEY` | Alternate name for `API_KEY`. | - |

### Provider Details

#### Google Gemini (Default)
- **Text Model**: `gemini-2.5-flash`
- **Image Model**: `imagen-4.0-generate-001`
- **Features**: Native JSON schema enforcement, high speed.

#### SiliconFlow
- **Text Model**: `deepseek-ai/DeepSeek-V3`
- **Image Model**: `Qwen/Qwen-Image`
- **Features**: Uses DeepSeek's reasoning capabilities and Qwen's image generation.
- **Note**: Ensure your SiliconFlow account has sufficient credits.

## Setup

1. Create a `.env` file in the root directory.
2. Add your API keys:
   ```env
   AI_PROVIDER=siliconflow 
   SILICONFLOW_API_KEY=sk-your-key-here
   ```
3. Restart the dev server to apply changes.

## Features
- **Themes**: Choose from High School, Magic, Maid Cafe, Isekai, or create your own.
- **Infinite Story**: The plot is generated on the fly.
- **Gallery**: Save your favorite scenes and unlocked memories.
- **Save/Load**: Auto-save support and manual slots.
