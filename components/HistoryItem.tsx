
import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../types';
import IconButton from './IconButton';

interface HistoryItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.24.032 3.287.098L11.8 3.75M3.25 5.79c.117-.18.256-.35.412-.507M20.75 5.79c-.117-.18-.256-.35-.412-.507m0 0L19.5 3.75M5.084 5.283A48.09 48.09 0 0 1 8.583 5.03m1.022.252L10.4 3.75m-1.32.75H9.82l-.287-.332" />
  </svg>
);


const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);


const HistoryItem: React.FC<HistoryItemProps> = ({ session, isActive, onSelect, onRename, onDelete }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(session.title);
  }, [session.title]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    if (title.trim() === '') {
      setTitle(session.title); // Reset if empty
    } else if (title.trim() !== session.title) {
      onRename(title.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setTitle(session.title);
      setIsRenaming(false);
    }
  };

  return (
    <div
      className={`group flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors duration-150
                  ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/[0.5] hover:text-white'}`}
    >
      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent text-sm p-0 border-0 focus:ring-0 mr-2"
        />
      ) : (
        <span onClick={onSelect} className="flex-grow truncate text-sm" title={session.title}>
          {session.title}
        </span>
      )}

      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        {isRenaming ? (
           <IconButton onClick={handleRename} ariaLabel="Save title" className="text-green-400 hover:text-green-300">
             <CheckIcon className="w-4 h-4" />
           </IconButton>
        ) : (
          <IconButton onClick={() => setIsRenaming(true)} ariaLabel="Rename chat" className="hover:text-gray-100">
            <EditIcon className="w-4 h-4" />
          </IconButton>
        )}
        <IconButton onClick={onDelete} ariaLabel="Delete chat" className="hover:text-red-400">
          <TrashIcon className="w-4 h-4" />
        </IconButton>
      </div>
    </div>
  );
};

export default HistoryItem;
    