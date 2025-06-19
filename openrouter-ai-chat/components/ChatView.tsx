import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { DEFAULT_MODEL_SUGGESTIONS } from '../constants'; // For type
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  activeApiKeyName?: string;
  sessionModelName?: string; // Model of the current chat session, if any
  selectedModelForNewMessages: string; // The model chosen in the dropdown
  onSelectModelForNewMessages: (modelName: string) => void;
  modelSuggestions: typeof DEFAULT_MODEL_SUGGESTIONS;
}

const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  activeApiKeyName,
  sessionModelName,
  selectedModelForNewMessages,
  onSelectModelForNewMessages,
  modelSuggestions
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const displayModelName = sessionModelName || selectedModelForNewMessages;
  
  const groupedModelSuggestions = modelSuggestions.reduce((acc, model) => {
    (acc[model.group] = acc[model.group] || []).push(model);
    return acc;
  }, {} as Record<string, typeof modelSuggestions>);


  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-grow min-w-0">
                <h2 className="text-md font-semibold text-gray-700 truncate">
                {activeApiKeyName && (
                    <>
                    API Key: <span className="font-mono text-xs sm:text-sm bg-gray-200 px-1.5 py-0.5 rounded mr-2">{activeApiKeyName}</span>
                    </>
                )}
                Model: <span className="font-mono text-xs sm:text-sm bg-gray-200 px-1.5 py-0.5 rounded">{displayModelName}</span>
                </h2>
            </div>
            <div className="flex-shrink-0">
                <select
                    id="model-selector"
                    value={selectedModelForNewMessages}
                    onChange={(e) => onSelectModelForNewMessages(e.target.value)}
                    className="text-xs sm:text-sm p-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 w-full sm:w-auto max-w-[200px] sm:max-w-xs truncate"
                    aria-label="Select AI Model"
                    title={selectedModelForNewMessages}
                >
                    {Object.entries(groupedModelSuggestions).map(([groupName, models]) => (
                      <optgroup label={groupName} key={groupName}>
                        {models.map(model => (
                          <option key={model.value} value={model.value} title={model.value}>{model.name}</option>
                        ))}
                      </optgroup>
                    ))}
                    {/* Add option for custom model if selectedModel is not in suggestions */}
                    {!modelSuggestions.some(m => m.value === selectedModelForNewMessages) && (
                        <optgroup label="Custom">
                            <option value={selectedModelForNewMessages} title={selectedModelForNewMessages}>{selectedModelForNewMessages}</option>
                        </optgroup>
                    )}
                </select>
            </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={msg.id} className="message-enter" style={{ animationDelay: `${Math.min(index * 60, 600)}ms`}}>
             <ChatMessage message={msg} />
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
          <div className="flex justify-start mb-3">
             <div className="flex items-end max-w-xs md:max-w-md lg:max-w-lg flex-row">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 rounded-full mr-2 text-teal-500 flex-shrink-0"><path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" /><path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.125 2.625.224q.468.056.918.113c1.018.125 1.954.3 2.802.534a6.002 6.002 0 0 1 1.637 4.137V15.75A6.002 6.002 0 0 1 18 19.948c-.042.02-.085.038-.128.056q-.173.076-.352.143a49.034 49.034 0 0 1-2.918.465c-.29.03-.57.052-.84.068a49.19 49.19 0 0 1-5.312 0c-.967-.052-1.83-.125-2.625-.224q-.468-.056-.918-.113c-1.018-.125-1.954-.3-2.802-.534A6.002 6.002 0 0 1 3.75 15.75V8.137a6.002 6.002 0 0 1 1.637-4.137c.848-.233 1.784-.408 2.802-.533q.36-.05.71-.097c.307-.033.62-.058.936-.076ZM12 6.75a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>
                <div className="px-4 py-3 rounded-xl shadow bg-gray-200 text-gray-800 rounded-bl-none">
                    <div className="flex space-x-1 items-center">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-200"></div>
                    </div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatView;