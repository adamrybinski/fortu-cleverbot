
import React, { useState } from 'react';
import { ChatUIProps } from '@/types/chat';
import { MessagesList } from './chat/MessagesList';
import { ChatInput } from './chat/ChatInput';
import { useScrollManager } from '@/hooks/useScrollManager';
import { useMessageHandler } from '@/hooks/useMessageHandler';

export const ChatUI: React.FC<ChatUIProps> = ({ onOpenCanvas, onTriggerCanvas }) => {
  const [inputValue, setInputValue] = useState('');
  
  const { isAtBottom, messagesRef, handleScroll, scrollToBottom } = useScrollManager();
  const { messages, isLoading, sendMessage } = useMessageHandler({
    onOpenCanvas,
    onTriggerCanvas,
    scrollToBottom,
    isAtBottom
  });

  const handleSendMessage = async () => {
    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#F1EDFF] to-white dark:from-gray-900 dark:to-gray-800">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <h1 className="text-xl font-semibold text-[#003079] dark:text-white">CleverBot</h1>
        <span className="text-xs text-[#1D253A]/60 bg-white/50 px-2 py-1 rounded-md">
          ICS Consultant
        </span>
      </div>

      {/* Scrollable Messages Container */}
      <MessagesList
        ref={messagesRef}
        messages={messages}
        isLoading={isLoading}
        onScroll={handleScroll}
      />

      {/* Fixed Input Area */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        isLoading={isLoading}
      />
    </div>
  );
};
