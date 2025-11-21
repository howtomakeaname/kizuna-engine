# Kizuna Engine - Configuration

This project supports multiple AI providers for text and image generation.

## Environment Variables

Configure the following variables in your environment (e.g., `.env` file):

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_PROVIDER` | Choose between `gemini` or `siliconflow`. | `gemini` |
| `API_KEY` | **Required for Gemini.** Your Google GenAI API Key. | - |
| `SILICONFLOW_API_KEY` | **Required for SiliconFlow.** Your SiliconFlow API Key. | - |

## Provider Details

### Google Gemini (Default)
- **Text Model**: `gemini-2.5-flash`
- **Image Model**: `imagen-4.0-generate-001`
- **Features**: Native JSON schema enforcement, high speed.

### SiliconFlow
- **Text Model**: `deepseek-ai/DeepSeek-V3`
- **Image Model**: `Qwen/Qwen-Image`
- **Features**: Uses DeepSeek's reasoning capabilities and Qwen's image generation.
- **Note**: Ensure your SiliconFlow account has sufficient credits.

## Setup

1. Copy `.env.example` to `.env` (if available) or set variables in your deployment platform.
2. Set `AI_PROVIDER=siliconflow` to switch to DeepSeek/Qwen.
