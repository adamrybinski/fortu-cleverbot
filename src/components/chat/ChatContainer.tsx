
import React, { useEffect } from 'react';
import { Message } from './types';
import { MessagesContainer } from './MessagesContainer';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { CanvasTrigger } from '../canvas/CanvasContainer';
import { useChatHistory, ChatMessage } from '@/hooks/useChatHistory';

interface ChatContainerProps {
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  handleSendMessage: (message: string) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  scrollRef: React.RefObject<HTMLDivElement>;
  isTransitioning: boolean;
  shouldAutoScroll: boolean;
  previousMessagesLength: React.MutableRefObject<number>;
  onOpenCanvas?: (type?: string, payload?: Record<string, any>) => void;
  onTriggerCanvas?: (trigger: CanvasTrigger) => void;
  isCanvasOpen?: boolean;
  hasCanvasBeenTriggered?: boolean;
  currentTrigger?: CanvasTrigger | null;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isCanvasOpenProp?: boolean;
  pendingCanvasGuidance: string | null;
  setPendingCanvasGuidance: (value: string | null) => void;
  activeSession: any;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  hasVisibleSessions?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  inputValue,
  setInputValue,
  isLoading,
  handleSendMessage,
  messagesContainerRef,
  scrollRef,
  isTransitioning,
  shouldAutoScroll,
  previousMessagesLength,
  onOpenCanvas,
  onTriggerCanvas,
  isCanvasOpen,
  hasCanvasBeenTriggered,
  currentTrigger,
  isSidebarOpen,
  onToggleSidebar,
  isCanvasOpenProp,
  pendingCanvasGuidance,
  setPendingCanvasGuidance,
  activeSession,
  addMessageToSession,
  hasVisibleSessions = false,
}) => {
  // Handle canvas guidance when canvas opens
  useEffect(() => {
    if (isCanvasOpenProp && pendingCanvasGuidance && activeSession) {
      const guidanceMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: pendingCanvasGuidance,
        timestamp: new Date(),
      };

      addMessageToSession(activeSession.id, guidanceMessage);
      setPendingCanvasGuidance(null);
    }
  }, [isCanvasOpenProp, pendingCanvasGuidance, setPendingCanvasGuidance, activeSession, addMessageToSession]);

  // Only auto-scroll when new messages are added, not when canvas state changes
  useEffect(() => {
    const hasNewMessages = messages.length > previousMessagesLength.current;
    previousMessagesLength.current = messages.length;

    if (hasNewMessages && shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleSendClick = () => {
    handleSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-white min-h-0">
      <ChatHeader
        onOpenCanvas={onOpenCanvas}
        isCanvasOpen={isCanvasOpen}
        hasCanvasBeenTriggered={hasCanvasBeenTriggered}
        currentTrigger={currentTrigger}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
        hasVisibleSessions={hasVisibleSessions}
      />

      <MessagesContainer
        messages={messages}
        isLoading={isLoading}
        messagesContainerRef={messagesContainerRef}
        scrollRef={scrollRef}
        onTriggerCanvas={onTriggerCanvas}
        isTransitioning={isTransitioning}
      />

      <ChatInput
        inputValue={inputValue}
        isLoading={isLoading}
        onInputChange={setInputValue}
        onSendMessage={handleSendClick}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
};
