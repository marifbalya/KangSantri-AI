export const LOCAL_STORAGE_KEYS = {
  API_KEYS_LIST: 'openrouter_api_keys_list', // Changed from API_CONFIGS_LIST
  ACTIVE_API_KEY_ID: 'openrouter_active_api_key_id', // Changed from ACTIVE_API_CONFIG_ID
  SELECTED_MODEL_NAME: 'openrouter_selected_model_name', // New key for the globally selected model
  CHAT_SESSIONS: 'openrouter_chat_sessions',
};

export const DEFAULT_MODEL_SUGGESTIONS: { name: string; value: string; group: string }[] = [
  { name: 'Gemini 2.0 Flash Exp (Free)', value: 'google/gemini-2.0-flash-exp:free', group: 'Google (Free Tier)' },
  { name: 'Deepseek V3 Base (Free)', value: 'deepseek/deepseek-v3-base:free', group: 'Deepseek (Free Tier)' },
  { name: 'Qwen3 32B (Free)', value: 'qwen/qwen3-32b:free', group: 'Qwen (Free Tier)' },
  { name: 'Deepseek R1 0528 (Free)', value: 'deepseek/deepseek-r1-0528:free', group: 'Deepseek (Free Tier)' },
  // Add other common models
  { name: 'GPT-3.5 Turbo (OpenAI)', value: 'openai/gpt-3.5-turbo', group: 'OpenAI' },
  { name: 'GPT-4o (OpenAI)', value: 'openai/gpt-4o', group: 'OpenAI' },
  { name: 'Mistral Large (Mistral)', value: 'mistralai/mistral-large-latest', group: 'Mistral' },
  { name: 'Claude 3 Opus (Anthropic)', value: 'anthropic/claude-3-opus', group: 'Anthropic' },
];

export const FALLBACK_DEFAULT_MODEL = 'openai/gpt-3.5-turbo';
export const API_KEY_TEST_MODEL = 'google/gemini-2.0-flash-exp:free'; // Model used for testing API key validity

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const APP_HTTP_REFERER = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
export const APP_X_TITLE = 'OpenRouter React Chat V2';