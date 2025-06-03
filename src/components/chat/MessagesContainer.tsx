
import React from 'react';
import { Message, CanvasTrigger } from './types';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';

interface MessagesContainerProps {
  messages: Message[];
  isLoading: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  scrollRef: React.RefObject<HTMLDivElement>;
  onTriggerCanvas?: (trigger: CanvasTrigger) => void;
}

export const MessagesContainer: React.FC<MessagesContainerProps> = ({
  messages,
  isLoading,
  messagesContainerRef,
  scrollRef,
  onTriggerCanvas,
}) => {
  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
      id="chat-messages"
      style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db #f3f4f6'
      }}
    >
      {messages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          onTriggerCanvas={onTriggerCanvas}
        />
      ))}

      {isLoading && <LoadingIndicator />}

      <div ref={scrollRef} />
    </div>
  );
};
