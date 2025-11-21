
# Kizuna Engine - Infinite Galgame

![Start Screen](https://img.cdn1.vip/i/692009020938d_1763707138.webp)

![Game View 1](https://img.cdn1.vip/i/6920247671265_1763714166.webp)

![Game View 2](https://img.cdn1.vip/i/69202476375bb_1763714166.webp)

A real-time, infinite visual novel generator powered by Generative AI. Experience a unique story where every choice matters, with dynamic assets and multilingual support.

[中文文档 (Chinese)](../docs/README_zh.md) | [Документация на русском (Russian)](../docs/README_ru.md) | [日本語ドキュメント (Japanese)](../docs/README_ja.md) | [Documentation en Français (French)](../docs/README_fr.md)

## Configuration

This project supports multiple AI providers for text and image generation.

### Environment Variables

Configure the following variables in your environment (e.g., `.env` file):

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_PROVIDER` | Choose between `gemini`, `siliconflow`, or `custom`. | `gemini` |
| `API_KEY` | **Required for Gemini.** Your Google GenAI API Key. | - |
| `SILICONFLOW_API_KEY` | **Required for SiliconFlow.** Your SiliconFlow API Key. | - |
| `GEMINI_API_KEY` | Alternate name for `API_KEY`. | - |
| `CUSTOM_API_URL` | **Required for Custom.** URL for text generation (Chat Completions). | - |
| `CUSTOM_API_KEY` | Optional key for Custom API. | - |
| `CUSTOM_MODEL_NAME` | Model ID for Custom API (e.g., `llama3`, `gpt-4o`). | `gpt-3.5-turbo` |
| `CUSTOM_IMAGE_API_URL`| Optional URL for image generation. | - |

### Provider Details

#### 1. Google Gemini (Default)
- **Text Model**: `gemini-2.5-flash`
- **Image Model**: `imagen-4.0-generate-001`
- **Features**: Native JSON schema enforcement, high speed, multimodal.

#### 2. SiliconFlow
- **Text Model**: `deepseek-ai/DeepSeek-V3`
- **Image Model**: `Qwen/Qwen-Image`
- **Features**: Uses DeepSeek's reasoning capabilities and Qwen's image generation.

#### 3. Custom / User-Built APIs (Self-Hosted)
Connect to your own API compatible with the **OpenAI Standard**.
This works with tools like:
- **Ollama** (local)
- **LM Studio** (local)
- **vLLM** (server)
- **LocalAI** (server)
- **Any OpenAI-compatible cloud provider** (Groq, Together, etc.)

**Example .env for Ollama (Local):**
```env
AI_PROVIDER=custom
CUSTOM_API_URL=http://localhost:11434/v1/chat/completions
CUSTOM_MODEL_NAME=llama3
CUSTOM_IMAGE_API_URL= # Leave empty if you don't have a local image generator
```

**Example .env for vLLM / Server:**
```env
AI_PROVIDER=custom
CUSTOM_API_URL=http://192.168.1.50:8000/v1/chat/completions
CUSTOM_API_KEY=my-secret-token
CUSTOM_MODEL_NAME=meta-llama/Meta-Llama-3-70B-Instruct
```

**Requirements for Custom APIs:**
- Must support `response_format: { type: "json_object" }` or be smart enough to return strictly valid JSON when prompted.
- The endpoint should match the `/v1/chat/completions` signature.

## Setup

1. Create a `.env` file in the root directory.
2. Add your configurations based on the examples above.
3. Restart the dev server (`npm run dev`) to apply changes.

## Features
- **Themes**: Choose from High School, Magic, Maid Cafe, Isekai, or create your own.
- **Infinite Story**: The plot is generated on the fly.
- **Multilingual**: Full support for English, Chinese, Russian, French, Japanese.
- **Gallery**: Save your favorite scenes and unlocked memories.
- **Save/Load**: Auto-save support and manual slots.
