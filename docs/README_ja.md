# Kizuna Engine - 絆エンジン (Infinite Galgame)

![スタート画面](https://img.cdn1.vip/i/692009020938d_1763707138.webp)

生成AIによって駆動されるリアルタイム、無限のビジュアルノベルジェネレーターです。すべての選択が重要となるユニークなストーリーを、動的なアセットと多言語サポートで体験してください。

[英語](../README.md)

## 設定

このプロジェクトは、テキストおよび画像生成のために複数のAIプロバイダーをサポートしています。

### 環境変数

環境（例：`.env`ファイル）で以下の変数を設定してください：

| 変数名 | 説明 | デフォルト |
|----------|-------------|---------|
| `AI_PROVIDER` | `gemini`、`siliconflow`、または `custom` から選択。 | `gemini` |
| `API_KEY` | **Geminiを使用する場合必須**。Google GenAI APIキー。 | - |
| `SILICONFLOW_API_KEY` | **SiliconFlowを使用する場合必須**。SiliconFlow APIキー。 | - |
| `GEMINI_API_KEY` | `API_KEY` の別名。 | - |
| `CUSTOM_API_URL` | **Customを使用する場合必須**。テキスト生成用URL (Chat Completions)。 | - |
| `CUSTOM_API_KEY` | Custom API用のキー（任意）。 | - |
| `CUSTOM_MODEL_NAME` | Custom APIのモデルID（例：`llama3`、`gpt-4o`）。 | `gpt-3.5-turbo` |
| `CUSTOM_IMAGE_API_URL`| 画像生成用URL（任意）。 | - |

### プロバイダー詳細

#### 1. Google Gemini (デフォルト)
- **テキストモデル**: `gemini-2.5-flash`
- **画像モデル**: `imagen-4.0-generate-001`
- **特徴**: ネイティブJSONスキーマ強制、高速、マルチモーダル。

#### 2. SiliconFlow
- **テキストモデル**: `deepseek-ai/DeepSeek-V3`
- **画像モデル**: `Qwen/Qwen-Image`
- **特徴**: DeepSeekの推論能力とQwenの画像生成を使用。

#### 3. Custom / 自作API (セルフホスト)
**OpenAI標準**と互換性のある独自のAPIに接続します。
以下のツールで動作します：
- **Ollama** (ローカル)
- **LM Studio** (ローカル)
- **vLLM** (サーバー)
- **LocalAI** (サーバー)
- **OpenAI互換のクラウドプロバイダー** (Groq, Togetherなど)

**Ollama (ローカル) の .env 設定例:**
```env
AI_PROVIDER=custom
CUSTOM_API_URL=http://localhost:11434/v1/chat/completions
CUSTOM_MODEL_NAME=llama3
CUSTOM_IMAGE_API_URL= # ローカル画像生成がない場合は空欄
```

**vLLM / サーバー の .env 設定例:**
```env
AI_PROVIDER=custom
CUSTOM_API_URL=http://192.168.1.50:8000/v1/chat/completions
CUSTOM_API_KEY=my-secret-token
CUSTOM_MODEL_NAME=meta-llama/Meta-Llama-3-70B-Instruct
```

**カスタムAPIの要件:**
- `response_format: { type: "json_object" }` をサポートしているか、プロンプトに従って厳密に有効なJSONを返すことができる必要があります。
- エンドポイントは `/v1/chat/completions` のシグネチャと一致する必要があります。

## セットアップ

1. ルートディレクトリに `.env` ファイルを作成します。
2. 上記の例に基づいて設定を追加します。
3. 変更を適用するために開発サーバーを再起動します (`npm run dev`)。

## 特徴
- **テーマ**: 学園、魔法、メイドカフェ、異世界、または独自のシナリオを作成できます。
- **無限のストーリー**: プロットはその場で生成されます。
- **多言語対応**: 英語、中国語、日本語、ロシア語を完全にサポート。
- **ギャラリー**: お気に入りのシーンや解放された思い出を保存できます。
- **セーブ/ロード**: オートセーブと手動スロットをサポート。
