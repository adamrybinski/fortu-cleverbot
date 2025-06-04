
import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatUIProps, Question } from './chat/types';
import { ChatHeader } from './chat/ChatHeader';
import { MessagesContainer } from './chat/MessagesContainer';
import { ChatInput } from './chat/ChatInput';
import { useCanvasPreview } from '@/hooks/useCanvasPreview';
import { useSelectedQuestions } from '@/hooks/useSelectedQuestions';
import { useMessageHandler } from '@/hooks/useMessageHandler';

interface ExtendedChatUIProps extends ChatUIProps {
  isCanvasOpen?: boolean;
  selectedQuestionsFromCanvas?: Question[];
  selectedAction?: 'refine' | 'instance' | 'both';
  onClearSelectedQuestions?: () => void;
}

export const ChatUI: React.FC<ExtendedChatUIProps> = ({ 
  onOpenCanvas, 
  onTriggerCanvas, 
  isCanvasOpen,
  selectedQuestionsFromCanvas = [],
  selectedAction = 'refine',
  onClearSelectedQuestions
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: 'Right, let\'s get started. What\'s the challenge you\'re looking to crack? Don\'t worry about having it perfectly formed — I\'ll help sharpen it.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    hasCanvasBeenTriggered,
    setHasCanvasBeenTriggered,
    pendingCanvasGuidance,
    setPendingCanvasGuidance,
    shouldCreateCanvasPreview
  } = useCanvasPreview();

  const { isLoading, handleSendMessage } = useMessageHandler({
    messages,
    setMessages,
    selectedQuestionsFromCanvas,
    selectedAction,
    onClearSelectedQuestions,
    shouldCreateCanvasPreview,
    setHasCanvasBeenTriggered
  });

  // Handle selected questions from canvas with different actions
  useSelectedQuestions({
    selectedQuestionsFromCanvas,
    selectedAction,
    onSendMessage: handleSendMessage
  });

  // Handle canvas guidance when canvas opens
  useEffect(() => {
    if (isCanvasOpen && pendingCanvasGuidance) {
      const guidanceMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: pendingCanvasGuidance,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, guidanceMessage]);
      setPendingCanvasGuidance(null);
    }
  }, [isCanvasOpen, pendingCanvasGuidance, setPendingCanvasGuidance]);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 bg-white min-h-0">
      <ChatHeader 
        onOpenCanvas={onOpenCanvas}
        isCanvasOpen={isCanvasOpen}
        hasCanvasBeenTriggered={hasCanvasBeenTriggered}
      />
      
      <MessagesContainer
        messages={messages}
        isLoading={isLoading}
        messagesContainerRef={messagesContainerRef}
        scrollRef={scrollRef}
        onTriggerCanvas={onTriggerCanvas}
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
