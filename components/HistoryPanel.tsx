import React from 'react';
import { ChatSession } from '../types';
import HistoryItem from './HistoryItem';
import IconButton from './IconButton';

interface HistoryPanelProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenSettings: () => void;
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15.356-6.354l-1.06-1.06M20.56 6.44l-1.06 1.06M6.44 20.56l1.06-1.06M18.627 17.56l1.06 1.06M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm0-3.75a.375.375 0 1 1 0-.75.375.375 0 0 1 0 .75Z" />
    </svg>
);


const HistoryPanel: React.FC<HistoryPanelProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  onOpenSettings
}) => {
  return (
    <div className="w-64 md:w-72 bg-gray-800 text-gray-100 flex flex-col h-full shadow-lg shrink-0">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-semibold tracking-tight">OpenRouter Chat</h1>
      </div>

      <div className="p-3">
        <button
          onClick={onNewChat}
          aria-label="Start a new chat session"
          className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {sessions.length === 0 && (
          <p className="px-2 py-4 text-sm text-gray-400 text-center">No chat history yet. Start a new chat!</p>
        )}
        {sessions.sort((a,b) => b.createdAt - a.createdAt).map((session) => (
          <HistoryItem
            key={session.id}
            session={session}
            isActive={session.id === activeSessionId}
            onSelect={() => onSelectSession(session.id)}
            onRename={(newTitle) => onRenameSession(session.id, newTitle)}
            onDelete={() => onDeleteSession(session.id)}
          />
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-700">
        <IconButton
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center text-gray-300 hover:bg-gray-700 hover:text-white py-2"
          ariaLabel="Open API Settings"
        >
          <CogIcon className="w-5 h-5 mr-2" />
          API Settings
        </IconButton>
      </div>
    </div>
  );
};

export default HistoryPanel;
