
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
    </svg>
);

const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
        <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.125 2.625.224q.468.056.918.113c1.018.125 1.954.3 2.802.534a6.002 6.002 0 0 1 1.637 4.137V15.75A6.002 6.002 0 0 1 18 19.948c-.042.02-.085.038-.128.056q-.173.076-.352.143a49.034 49.034 0 0 1-2.918.465c-.29.03-.57.052-.84.068a49.19 49.19 0 0 1-5.312 0c-.967-.052-1.83-.125-2.625-.224q-.468-.056-.918-.113c-1.018-.125-1.954-.3-2.802-.534A6.002 6.002 0 0 1 3.75 15.75V8.137a6.002 6.002 0 0 1 1.637-4.137c.848-.233 1.784-.408 2.802-.533q.36-.05.71-.097c.307-.033.62-.058.936-.076ZM12 6.75a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
);


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Basic markdown-like link detection and conversion
  const formatContent = (content: string): React.ReactNode => {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(linkRegex);
    return parts.map((part, index) => {
      if (part.match(linkRegex)) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">{part}</a>;
      }
      // Handle newlines: replace \n with <br />
      const lines = part.split('\n');
      return lines.map((line, lineIndex) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };


  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex items-end max-w-xs md:max-w-md lg:max-w-lg ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {isUser ? (
          <UserIcon className="w-8 h-8 rounded-full ml-2 text-blue-500 flex-shrink-0" />
        ) : (
          <BotIcon className="w-8 h-8 rounded-full mr-2 text-teal-500 flex-shrink-0" />
        )}
        <div
          className={`px-4 py-3 rounded-xl shadow ${
            isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{formatContent(message.content)}</p>
          <p className={`text-xs mt-1 ${isUser ? 'text-blue-200 text-right' : 'text-gray-500 text-left'}`}>
            {messageTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
    