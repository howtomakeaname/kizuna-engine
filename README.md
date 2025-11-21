
# Kizuna Engine - 羁绊引擎 (Infinite Galgame)

![开始画面](https://img.cdn1.vip/i/692009020938d_1763707138.webp)

![Game View 1](https://img.cdn1.vip/i/692051d06f083_1763725776.webp)

![Game View 2](https://img.cdn1.vip/i/692051d03f98b_1763725776.webp)

由生成式 AI 驱动的实时、无限视觉小说生成器。体验独特的故事情节，每一次选择都至关重要，支持动态素材生成与多语言环境。

## 文档语言 / Languages

- [中文文档 (Chinese)](docs/README_zh.md)
- [English Documentation](docs/README_en.md)
- [Документация на русском (Russian)](docs/README_ru.md)
- [Documentation en Français (French)](docs/README_fr.md)
- [日本語ドキュメント (Japanese)](docs/README_ja.md)

## 配置说明

本项目支持多种 AI 提供商用于文本和图像生成。

### 环境变量

请在您的环境（例如 `.env` 文件）中配置以下变量：

| 变量名 | 描述 | 默认值 |
|----------|-------------|---------|
| `AI_PROVIDER` | 选择 `gemini`, `siliconflow` (硅基流动), 或 `custom` (自定义)。 | `gemini` |
| `API_KEY` | **Gemini 必填**。您的 Google GenAI API Key。 | - |
| `SILICONFLOW_API_KEY` | **SiliconFlow 必填**。您的 SiliconFlow API Key。 | - |
| `GEMINI_API_KEY` | `API_KEY` 的别名。 | - |
| `CUSTOM_API_URL` | **Custom 必填**。文本生成的 URL (Chat Completions)。 | - |
| `CUSTOM_API_KEY` | Custom API 的密钥（可选）。 | - |
| `CUSTOM_MODEL_NAME` | Custom API 的模型 ID (例如 `llama3`, `gpt-4o`)。 | `gpt-3.5-turbo` |
| `CUSTOM_IMAGE_API_URL`| 图像生成的 URL（可选）。 | - |

### 提供商详情

#### 1. Google Gemini (默认)
- **文本模型**: `gemini-2.5-flash`
- **图像模型**: `imagen-4.0-generate-001`
- **特点**: 原生 JSON Schema 强制支持，速度快，多模态。

#### 2. SiliconFlow (硅基流动)
- **文本模型**: `deepseek-ai/DeepSeek-V3`
- **图像模型**: `Qwen/Qwen-Image`
- **特点**: 利用 DeepSeek 的推理能力和 Qwen 的图像生成能力。

#### 3. Custom / 用户自建 API (私有部署)
连接到任何兼容 **OpenAI 标准格式** 的 API。
适用于以下工具：
- **Ollama** (本地)
- **LM Studio** (本地)
- **vLLM** (服务器)
- **LocalAI** (服务器)
- **任何兼容 OpenAI 格式的云服务商** (Groq, Together 等)

**Ollama (本地) .env 配置示例:**
```env
AI_PROVIDER=custom
CUSTOM_API_URL=http://localhost:11434/v1/chat/completions
CUSTOM_MODEL_NAME=llama3
CUSTOM_IMAGE_API_URL= # 如果没有本地生图模型，请留空
```

**vLLM / 服务器 .env 配置示例:**
```env
AI_PROVIDER=custom
CUSTOM_API_URL=http://192.168.1.50:8000/v1/chat/completions
CUSTOM_API_KEY=my-secret-token
CUSTOM_MODEL_NAME=meta-llama/Meta-Llama-3-70B-Instruct
```

**自定义 API 要求:**
- 必须支持 `response_format: { type: "json_object" }`，或者模型足够智能，能在提示下返回严格合法的 JSON。
- 接口端点应符合 `/v1/chat/completions` 签名。

## 安装与运行

1. 在根目录下创建一个 `.env` 文件。
2. 根据上述示例添加您的配置。
3. 重启开发服务器 (`npm run dev`) 以应用更改。

## 功能特性
- **多主题**: 选择日式高中、魔法学院、女仆咖啡厅、异世界，或自定义您的剧本。
- **无限剧情**: 剧情实时生成，永不重复。
- **多语言支持**: 完整支持英语、中文、日语和俄语。
- **画廊系统**: 保存您最喜欢的场景和解锁的特殊回忆。
- **存档/读档**: 支持自动存档和手动存档槽位。
