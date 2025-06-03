
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
</rav-write>

<lov-write file_path="src/components/chat/ChatInput.tsx">
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading
}) => {
  return (
    <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="What challenge are you looking to crack?"
            className="border-[#6EFFC6]/30 focus:border-[#6EFFC6] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={onSend}
          className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white px-4 py-2 h-10"
          disabled={!value.trim() || isLoading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
};
