import React, { useState, useEffect, useCallback } from 'react';
import { ApiKeyEntry, ChatSession, Message, ApiKeyStatus } from './types';
import { LOCAL_STORAGE_KEYS, FALLBACK_DEFAULT_MODEL, DEFAULT_MODEL_SUGGESTIONS, API_KEY_TEST_MODEL } from './constants';
import HistoryPanel from './components/HistoryPanel';
import ChatView from './components/ChatView';
import ApiSettingsModal from './components/ApiSettingsModal';
import { fetchChatCompletion, testChatCompletion } from './services/OpenRouterService';

const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);

const App: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [activeApiKeyId, setActiveApiKeyId] = useState<string | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string>(
    () => localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_MODEL_NAME) || DEFAULT_MODEL_SUGGESTIONS[0]?.value || FALLBACK_DEFAULT_MODEL
  );
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiSettingsModal, setShowApiSettingsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeApiKey = apiKeys.find(key => key.id === activeApiKeyId);
  const currentChatSession = chatSessions.find(session => session.id === currentSessionId);
  const currentMessages = currentChatSession?.messages || [];

  // Load initial data from localStorage
  useEffect(() => {
    const storedApiKeys = localStorage.getItem(LOCAL_STORAGE_KEYS.API_KEYS_LIST);
    if (storedApiKeys) {
      setApiKeys(JSON.parse(storedApiKeys));
    }

    const storedActiveKeyId = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVE_API_KEY_ID);
    if (storedActiveKeyId) {
      setActiveApiKeyId(storedActiveKeyId);
    }
    
    const storedModelName = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_MODEL_NAME);
    if (storedModelName) {
        setSelectedModelName(storedModelName);
    }


    if (!storedApiKeys || !storedActiveKeyId) {
      setShowApiSettingsModal(true); // Prompt for API key if not set
    }

    const storedSessions = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAT_SESSIONS);
    if (storedSessions) {
      const parsedSessions = JSON.parse(storedSessions) as ChatSession[];
      setChatSessions(parsedSessions);
      if (parsedSessions.length > 0 && !currentSessionId) {
        const sortedSessions = [...parsedSessions].sort((a, b) => b.createdAt - a.createdAt);
        setCurrentSessionId(sortedSessions[0].id);
      }
    }
  }, []);

  // Save API keys, active ID, and selected model to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.API_KEYS_LIST, JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    if (activeApiKeyId) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_API_KEY_ID, activeApiKeyId);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ACTIVE_API_KEY_ID);
    }
  }, [activeApiKeyId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_MODEL_NAME, selectedModelName);
  }, [selectedModelName]);

  useEffect(() => {
    if (chatSessions.length > 0 || localStorage.getItem(LOCAL_STORAGE_KEYS.CHAT_SESSIONS)) {
       localStorage.setItem(LOCAL_STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  const handleUpdateApiKeys = useCallback((updatedKeys: ApiKeyEntry[]) => {
    setApiKeys(updatedKeys);
  }, []);

  const handleSetActiveApiKey = useCallback((keyId: string | null) => {
    const newActiveKey = apiKeys.find(k => k.id === keyId);
    if (newActiveKey && newActiveKey.status !== 'valid' && newActiveKey.status !== 'unchecked') {
         setError(`Cannot set active: API Key "${newActiveKey.name}" has status "${newActiveKey.status}". Please check or update.`);
         return;
    }
    setActiveApiKeyId(keyId);
    setShowApiSettingsModal(false);
    setError(null);
    if (keyId && chatSessions.length === 0) {
        handleCreateNewChat();
    }
  }, [apiKeys, chatSessions.length]);

  const handleCheckApiKeyStatus = useCallback(async (keyId: string) => {
    const keyToCheck = apiKeys.find(k => k.id === keyId);
    if (!keyToCheck) return;

    setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, status: 'checking' } : k));
    try {
      // Use API_KEY_TEST_MODEL for checking key validity
      const isValid = await testChatCompletion(keyToCheck.apiKey, API_KEY_TEST_MODEL);
      setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, status: isValid ? 'valid' : 'invalid' } : k));
      if (keyId === activeApiKeyId && !isValid) {
        setError(`Active API Key "${keyToCheck.name}" is invalid. Please select a valid one.`);
      }
    } catch (err) {
      console.error("Error checking API key status:", err);
      setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, status: 'invalid' } : k));
       if (keyId === activeApiKeyId) {
        setError(`Error checking active API Key "${keyToCheck.name}". It may be invalid.`);
      }
    }
  }, [apiKeys, activeApiKeyId]);

  const handleSelectModelName = useCallback((newModelName: string) => {
    setSelectedModelName(newModelName);
  }, []);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!activeApiKey || activeApiKey.status === 'invalid' || activeApiKey.status === 'checking') {
      setError("Active API Key is not set, invalid, or being checked. Please configure in Settings.");
      setShowApiSettingsModal(true);
      return;
    }
    if (!currentSessionId) {
      setError("No active chat session. Please create or select a chat.");
      return;
    }
    if (!selectedModelName) {
        setError("No AI Model selected. Please choose a model.");
        // Potentially open a model selector UI or guide user
        return;
    }
    setError(null);
    setIsLoading(true);

    const newUserMessage: Message = { id: generateId(), role: 'user', content: userInput, timestamp: Date.now() };

    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === currentSessionId
          ? { ...session, messages: [...session.messages, newUserMessage] }
          : session
      )
    );
    
    const currentChatSessionForApi = chatSessions.find(s => s.id === currentSessionId);
    const messagesForApi = currentChatSessionForApi
        ? [...currentChatSessionForApi.messages, newUserMessage].map(m => ({ role: m.role, content: m.content }))
        : [{ role: 'user' as 'user', content: userInput }];

    try {
      const assistantResponseContent = await fetchChatCompletion(
        activeApiKey.apiKey,
        selectedModelName, // Use globally selected model for new message
        messagesForApi
      );

      const assistantMessage: Message = { id: generateId(), role: 'assistant', content: assistantResponseContent, timestamp: Date.now() };

      setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, assistantMessage] }
            : session
        )
      );
    } catch (err) {
      console.error("Error fetching chat completion:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to get response: ${errorMessage}`);
      setChatSessions(prevSessions => // Revert optimistic update
        prevSessions.map(session =>
          session.id === currentSessionId
            ? { ...session, messages: session.messages.slice(0, -1) } // Remove optimistic user message
            : session
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeApiKey, currentSessionId, chatSessions, selectedModelName]);

  const handleCreateNewChat = useCallback(() => {
    if (!activeApiKey) {
        setShowApiSettingsModal(true);
        setError("Please set an active API Key first.");
        return;
    }
     if (activeApiKey.status === 'invalid' || activeApiKey.status === 'checking') {
      setShowApiSettingsModal(true);
      setError(`Active API Key "${activeApiKey.name}" is ${activeApiKey.status}. Please select a valid one or check its status.`);
      return;
    }
    if (!selectedModelName) {
        setError("Please select an AI model before starting a new chat.");
        // Potentially highlight model selector
        return;
    }

    const newSession: ChatSession = {
      id: generateId(),
      title: `Chat ${chatSessions.length + 1} (${new Date().toLocaleTimeString()})`,
      messages: [],
      createdAt: Date.now(),
      model: selectedModelName, // Use globally selected model for the new session
      apiKeyId: activeApiKey.id,
    };
    setChatSessions(prevSessions => [newSession, ...prevSessions]);
    setCurrentSessionId(newSession.id);
    setError(null);
  }, [activeApiKey, chatSessions.length, selectedModelName]);

  const handleSelectChat = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setError(null);
  }, []);

  const handleRenameChat = useCallback((sessionId: string, newTitle: string) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId ? { ...session, title: newTitle } : session
      )
    );
  }, []);

  const handleDeleteChat = useCallback((sessionId: string) => {
    const updatedSessions = chatSessions.filter(session => session.id !== sessionId);
    setChatSessions(updatedSessions);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(updatedSessions.length > 0 ? updatedSessions.sort((a,b) => b.createdAt - a.createdAt)[0].id : null);
    }
  }, [currentSessionId, chatSessions]);

  return (
    <div className="flex h-screen w-screen bg-gray-100 text-gray-800">
      {showApiSettingsModal && (
        <ApiSettingsModal
          isOpen={showApiSettingsModal}
          onClose={() => {
            if (activeApiKey && (activeApiKey.status === 'valid' || activeApiKey.status === 'unchecked')) setShowApiSettingsModal(false);
            else setError("An active and valid API Key is required.");
          }}
          apiKeys={apiKeys} // Changed from apiConfigs
          activeApiKeyId={activeApiKeyId} // Changed from activeApiConfigId
          onUpdateApiKeys={handleUpdateApiKeys} // Changed from onUpdateConfigs
          onSetActiveApiKey={handleSetActiveApiKey} // Changed from onSetActiveConfig
          onCheckApiKeyStatus={handleCheckApiKeyStatus} // Changed from onCheckConfigStatus
        />
      )}
      
      <HistoryPanel
        sessions={chatSessions}
        activeSessionId={currentSessionId}
        onSelectSession={handleSelectChat}
        onNewChat={handleCreateNewChat}
        onRenameSession={handleRenameChat}
        onDeleteSession={handleDeleteChat}
        onOpenSettings={() => setShowApiSettingsModal(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {error && (
            <div className="p-3 bg-red-100 text-red-700 border-b border-red-300 text-sm flex justify-between items-center">
                <p><strong>Error:</strong> {error}</p>
                <button onClick={() => setError(null)} className="ml-2 text-xs font-semibold hover:text-red-900 p-1 rounded hover:bg-red-200">[Dismiss]</button>
            </div>
        )}
        {currentSessionId && activeApiKey ? (
          <ChatView
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            activeApiKeyName={activeApiKey.name}
            sessionModelName={currentChatSession?.model}
            selectedModelForNewMessages={selectedModelName}
            onSelectModelForNewMessages={handleSelectModelName}
            modelSuggestions={DEFAULT_MODEL_SUGGESTIONS}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            {!activeApiKey && <button onClick={() => setShowApiSettingsModal(true)} className="mb-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">Set API Key</button>}
            <h2 className="text-2xl font-semibold text-gray-600">Welcome to OpenRouter Chat</h2>
            {activeApiKey ? (
                <p className="mt-2 text-gray-500">Select a chat from the history or <button onClick={handleCreateNewChat} className="text-blue-500 hover:underline">start a new one</button>.</p>
            ): (
                 <p className="mt-2 text-gray-500">Please set up an API Key to begin.</p>
            )}
            {!selectedModelName && activeApiKey && (
                 <p className="mt-2 text-yellow-600">Please select an AI Model from the top bar to start chatting.</p>
            )}
             <img src="https://picsum.photos/seed/aiwelcome/300/200" alt="AI Welcome" className="mt-6 rounded-lg shadow-md opacity-80" />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;