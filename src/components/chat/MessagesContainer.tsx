
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
  isTransitioning?: boolean;
}

export const MessagesContainer: React.FC<MessagesContainerProps> = ({
  messages,
  isLoading,
  messagesContainerRef,
  scrollRef,
  onTriggerCanvas,
  isTransitioning = false,
}) => {
  return (
    <div className="flex-1 min-h-0 relative">
      <div 
        ref={messagesContainerRef}
        className={`h-full overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-opacity duration-300 touch-auto ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        id="chat-messages"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6',
          WebkitOverflowScrolling: 'touch'
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

        {/* Scroll target with proper bottom padding to ensure consistent bottom spacing */}
        <div ref={scrollRef} className="h-16 sm:h-20" />
      </div>

      {/* White overlay during transitions */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-[#753BBD] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
