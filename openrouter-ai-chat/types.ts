export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id:string;
  title: string;
  messages: Message[];
  createdAt: number;
  model: string; // Model used for THIS session's messages
  apiKeyId?: string; // ID of the ApiKeyEntry used for this session
}

export type ApiKeyStatus = 'unchecked' | 'checking' | 'valid' | 'invalid';

// Renamed from ApiConfigEntry, modelName removed
export interface ApiKeyEntry {
  id: string;
  name: string; // User-defined name for this API key
  apiKey: string;
  status: ApiKeyStatus;
}

// For OpenRouter API request
export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Renamed from ApiConfigBulkUploadEntry, modelName removed
export interface ApiKeyBulkUploadEntry {
  name: string;
  apiKey: string;
}