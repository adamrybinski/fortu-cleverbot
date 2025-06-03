
import React from 'react';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
    >
      {message.role === 'bot' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full shadow-sm overflow-hidden bg-white p-1">
            <img
              src="/lovable-uploads/7fabe412-0da9-4efc-a1d8-ee6ee3349e4d.png"
              alt="CleverBot"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      )}
      <div
        className={`max-w-[80%] md:max-w-[70%] p-3 rounded-lg shadow-sm ${
          message.role === 'user'
            ? 'bg-[#EEFFF3] text-[#1D253A] rounded-br-sm'
            : 'bg-white text-[#1D253A] rounded-bl-sm dark:bg-gray-700 dark:text-white'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
