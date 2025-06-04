
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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const previousMessagesLength = useRef(messages.length);
  const storedScrollPosition = useRef<number>(0);
  const isCanvasOpenRef = useRef(isCanvasOpen);

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
    setHasCanvasBeenTriggered,
    onTriggerCanvas
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

  // Store scroll position before canvas state changes
  useEffect(() => {
    const previousCanvasState = isCanvasOpenRef.current;
    
    if (previousCanvasState !== isCanvasOpen && messagesContainerRef.current) {
      // Store current scroll position before canvas state changes
      storedScrollPosition.current = messagesContainerRef.current.scrollTop;
      console.log('Storing scroll position:', storedScrollPosition.current);
    }
    
    isCanvasOpenRef.current = isCanvasOpen;
  }, [isCanvasOpen]);

  // Restore scroll position after canvas transition
  useEffect(() => {
    if (messagesContainerRef.current && storedScrollPosition.current > 0) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = storedScrollPosition.current;
          console.log('Restored scroll position:', storedScrollPosition.current);
        }
      });
    }
  }, [isCanvasOpen]);

  // Only auto-scroll when new messages are added, not when canvas state changes
  useEffect(() => {
    const hasNewMessages = messages.length > previousMessagesLength.current;
    previousMessagesLength.current = messages.length;

    if (hasNewMessages && shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // Disable auto-scroll when canvas state changes to prevent jumping
  useEffect(() => {
    setShouldAutoScroll(false);
    // Re-enable auto-scroll after a brief delay to allow for canvas transition
    const timer = setTimeout(() => {
      setShouldAutoScroll(true);
    }, 300); // Increased delay to ensure transition completes

    return () => clearTimeout(timer);
  }, [isCanvasOpen]);

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
