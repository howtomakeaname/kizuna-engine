
# Kizuna Engine - Moteur Kizuna (Visual Novel Infini)

![Écran titre](images/startScreen.png)

Un générateur de Visual Novel en temps réel et infini, propulsé par l'IA générative. Vivez une histoire unique où chaque choix compte, avec des ressources générées dynamiquement et un support multilingue.

[Documentation en Anglais](../README.md)

## Configuration

Ce projet prend en charge plusieurs fournisseurs d'IA pour la génération de texte et d'images.

### Variables d'Environnement

Configurez les variables suivantes dans votre environnement (ex: fichier `.env`) :

| Variable | Description | Défaut |
|----------|-------------|---------|
| `AI_PROVIDER` | Choisir entre `gemini`, `siliconflow`, ou `custom`. | `gemini` |
| `API_KEY` | **Requis pour Gemini.** Votre clé API Google GenAI. | - |
| `SILICONFLOW_API_KEY` | **Requis pour SiliconFlow.** Votre clé API SiliconFlow. | - |
| `GEMINI_API_KEY` | Nom alternatif pour `API_KEY`. | - |
| `CUSTOM_API_URL` | **Requis pour Custom.** URL pour la génération de texte (Chat Completions). | - |
| `CUSTOM_API_KEY` | Clé optionnelle pour l'API Custom. | - |
| `CUSTOM_MODEL_NAME` | ID du modèle pour l'API Custom (ex: `llama3`, `gpt-4o`). | `gpt-3.5-turbo` |
| `CUSTOM_IMAGE_API_URL`| URL optionnelle pour la génération d'images. | - |

### Détails des Fournisseurs

#### 1. Google Gemini (Par Défaut)
- **Modèle Texte**: `gemini-2.5-flash`
- **Modèle Image**: `imagen-4.0-generate-001`
- **Caractéristiques**: Support natif des schémas JSON, haute vitesse, multimodal.

#### 2. SiliconFlow
- **Modèle Texte**: `deepseek-ai/DeepSeek-V3`
- **Modèle Image**: `Qwen/Qwen-Image`
- **Caractéristiques**: Utilise les capacités de raisonnement de DeepSeek et la génération d'images de Qwen.

#### 3. Custom / API Utilisateur (Auto-Hébergé)
Connectez-vous à votre propre API compatible avec le **Standard OpenAI**.
Cela fonctionne avec des outils comme :
- **Ollama** (local)
- **LM Studio** (local)
- **vLLM** (serveur)
- **LocalAI** (serveur)
- **Tout fournisseur cloud compatible OpenAI** (Groq, Together, etc.)

**Exemple .env pour Ollama (Local) :**
```env
AI_PROVIDER=custom
CUSTOM_API_URL=http://localhost:11434/v1/chat/completions
CUSTOM_MODEL_NAME=llama3
CUSTOM_IMAGE_API_URL= # Laissez vide si vous n'avez pas de générateur d'images local
```

**Exemple .env pour vLLM / Serveur :**
```env
AI_PROVIDER=custom
CUSTOM_API_URL=http://192.168.1.50:8000/v1/chat/completions
CUSTOM_API_KEY=my-secret-token
CUSTOM_MODEL_NAME=meta-llama/Meta-Llama-3-70B-Instruct
```

**Prérequis pour les API Custom :**
- Doit supporter `response_format: { type: "json_object" }` ou être suffisamment intelligent pour retourner du JSON strictement valide sur demande.
- Le point de terminaison doit correspondre à la signature `/v1/chat/completions`.

## Installation

1. Créez un fichier `.env` dans le répertoire racine.
2. Ajoutez vos configurations en vous basant sur les exemples ci-dessus.
3. Redémarrez le serveur de développement (`npm run dev`) pour appliquer les changements.

## Fonctionnalités
- **Thèmes**: Choisissez parmi Lycée, Académie de Magie, Maid Café, Isekai, ou créez votre propre scénario.
- **Histoire Infinie**: L'intrigue est générée à la volée.
- **Multilingue**: Support complet pour l'anglais, le chinois, le japonais, le russe et le français.
- **Galerie**: Sauvegardez vos scènes préférées et les souvenirs débloqués.
- **Sauvegarde/Chargement**: Support de la sauvegarde automatique et des emplacements manuels.
