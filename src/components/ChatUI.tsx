
import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatUIProps, Question } from './chat/types';
import { ChatHeader } from './chat/ChatHeader';
import { MessagesContainer } from './chat/MessagesContainer';
import { ChatInput } from './chat/ChatInput';
import { useCanvasPreview } from '@/hooks/useCanvasPreview';
import { useSelectedQuestions } from '@/hooks/useSelectedQuestions';
import { useMessageHandler } from '@/hooks/useMessageHandler';
import { QuestionSession } from '@/hooks/useQuestionSessions';
import { CanvasTrigger } from './canvas/CanvasContainer';
import { useChatHistory, ChatMessage } from '@/hooks/useChatHistory';

interface QuestionSessionsHook {
  questionSessions: QuestionSession[];
  activeSessionId: string | null;
  getActiveSession: () => QuestionSession | null;
  createNewSession: (question: string) => string;
  updateSession: (sessionId: string, updates: Partial<QuestionSession>) => void;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

interface ExtendedChatUIProps extends ChatUIProps {
  isCanvasOpen?: boolean;
  selectedQuestionsFromCanvas?: Question[];
  selectedAction?: 'refine' | 'instance' | 'both';
  onClearSelectedQuestions?: () => void;
  questionSessions?: QuestionSessionsHook;
  onSendMessageToChat?: (message: string) => void;
  currentTrigger?: CanvasTrigger | null;
  activeSessionId?: string | null;
  onSessionChange?: (sessionId: string | null) => void;
}

export const ChatUI: React.FC<ExtendedChatUIProps> = ({ 
  onOpenCanvas, 
  onTriggerCanvas, 
  isCanvasOpen,
  selectedQuestionsFromCanvas = [],
  selectedAction = 'refine',
  onClearSelectedQuestions,
  questionSessions,
  onSendMessageToChat,
  currentTrigger,
  activeSessionId,
  onSessionChange
}) => {
  const { 
    getActiveSession, 
    addMessageToSession, 
    updateSessionMessages,
    switchToSession 
  } = useChatHistory();

  // Get messages from active session or use default
  const activeSession = getActiveSession();
  const messages = activeSession?.messages || [
    {
      id: '1',
      role: 'bot' as const,
      text: 'Right, let\'s get started. What\'s the challenge you\'re looking to crack? Don\'t worry about having it perfectly formed — I\'ll help sharpen it.',
      timestamp: new Date(),
    },
  ];

  const setMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    if (!activeSession) return;
    
    const updatedMessages = typeof newMessages === 'function' 
      ? newMessages(messages)
      : newMessages;
    
    updateSessionMessages(activeSession.id, updatedMessages as ChatMessage[]);
  };

  const [inputValue, setInputValue] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const previousMessagesLength = useRef(messages.length);
  const savedScrollPosition = useRef<number>(0);

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
    onTriggerCanvas,
    questionSessions
  });

  // Handle selected questions from canvas with different actions
  useSelectedQuestions({
    selectedQuestionsFromCanvas,
    selectedAction,
    onSendMessage: handleSendMessage
  });

  // Handle canvas guidance when canvas opens
  useEffect(() => {
    if (isCanvasOpen && pendingCanvasGuidance && activeSession) {
      const guidanceMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: pendingCanvasGuidance,
        timestamp: new Date(),
      };

      addMessageToSession(activeSession.id, guidanceMessage);
      setPendingCanvasGuidance(null);
    }
  }, [isCanvasOpen, pendingCanvasGuidance, setPendingCanvasGuidance, activeSession, addMessageToSession]);

  // Handle external message sending (from canvas)
  useEffect(() => {
    if (onSendMessageToChat) {
      // This allows external components to send messages through this chat
      // The function is available for canvas components to use
    }
  }, [onSendMessageToChat]);

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

  // Only auto-scroll when new messages are added, not when canvas state changes
  useEffect(() => {
    const hasNewMessages = messages.length > previousMessagesLength.current;
    previousMessagesLength.current = messages.length;

    if (hasNewMessages && shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // Handle canvas transition with scroll position preservation
  useEffect(() => {
    if (isTransitioning) return; // Prevent multiple simultaneous transitions

    // Capture current scroll position
    if (messagesContainerRef.current) {
      savedScrollPosition.current = messagesContainerRef.current.scrollTop;
    }

    // Start transition
    setIsTransitioning(true);
    setShouldAutoScroll(false);

    // Phase 1: Show overlay (100ms)
    const phase1Timer = setTimeout(() => {
      // Canvas transition happens here (handled by CSS)
    }, 100);

    // Phase 2: Restore scroll position and hide overlay (500ms total)
    const phase2Timer = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = savedScrollPosition.current;
      }
      setIsTransitioning(false);
      setShouldAutoScroll(true);
    }, 500);

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
    };
  }, [isCanvasOpen]);

  return (
    <div className="flex flex-col h-full bg-white min-h-0">
      <ChatHeader 
        onOpenCanvas={onOpenCanvas}
        isCanvasOpen={isCanvasOpen}
        hasCanvasBeenTriggered={hasCanvasBeenTriggered}
        currentTrigger={currentTrigger}
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
