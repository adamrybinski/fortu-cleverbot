
import React, { forwardRef } from 'react';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { LoadingIndicator } from './LoadingIndicator';

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  onScroll: () => void;
}

export const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  ({ messages, isLoading, onScroll }, ref) => {
    return (
      <div 
        ref={ref}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-3"
        onScroll={onScroll}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && <LoadingIndicator />}
        
        {/* Scroll anchor at bottom */}
        <div id="scroll-anchor" />
      </div>
    );
  }
);

MessagesList.displayName = 'MessagesList';
