
import React, { useEffect } from 'react';
import { Message, ChatUIProps, Question } from './chat/types';
import { useCanvasPreview } from '@/hooks/useCanvasPreview';
import { useSelectedQuestions } from '@/hooks/useSelectedQuestions';
import { useMessageHandler } from '@/hooks/useMessageHandler';
import { QuestionSession } from '@/hooks/useQuestionSessions';
import { CanvasTrigger } from './canvas/CanvasContainer';
import { ChatSession, ChatMessage } from '@/hooks/useChatHistory';
import { useChatUIState } from '@/hooks/useChatUIState';
import { useChatTransitions } from '@/hooks/useChatTransitions';
import { ChatContainer } from './chat/ChatContainer';

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
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  // Session management functions passed from ChatInterface
  getActiveSession: () => ChatSession | null;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  createNewSession: () => string;
}

// Helper function to convert ChatMessage to Message
const convertChatMessageToMessage = (chatMessage: any): Message => {
  return {
    id: chatMessage.id,
    role: chatMessage.role,
    text: chatMessage.text,
    timestamp: chatMessage.timestamp,
    selectedQuestions: chatMessage.selectedQuestions,
    selectedAction: chatMessage.selectedAction,
    canvasData: chatMessage.canvasData,
  };
};

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
  onSessionChange,
  isSidebarOpen,
  onToggleSidebar,
  // Session management functions
  getActiveSession,
  addMessageToSession,
  createNewSession
}) => {
  const {
    inputValue,
    setInputValue,
    isTransitioning,
    setIsTransitioning,
    shouldAutoScroll,
    setShouldAutoScroll,
    scrollRef,
    messagesContainerRef,
    previousMessagesLength,
    savedScrollPosition,
  } = useChatUIState();

  const {
    hasCanvasBeenTriggered,
    setHasCanvasBeenTriggered,
    pendingCanvasGuidance,
    setPendingCanvasGuidance,
    shouldCreateCanvasPreview
  } = useCanvasPreview();

  // Handle canvas transitions
  useChatTransitions({
    isCanvasOpen,
    isTransitioning,
    setIsTransitioning,
    setShouldAutoScroll,
    messagesContainerRef,
    savedScrollPosition,
  });

  const { isLoading, handleSendMessage } = useMessageHandler({
    selectedQuestionsFromCanvas,
    selectedAction,
    onClearSelectedQuestions,
    shouldCreateCanvasPreview,
    setHasCanvasBeenTriggered,
    onTriggerCanvas,
    questionSessions,
    addMessageToSession,
    getActiveSession,
    createNewSession
  });

  // Handle selected questions from canvas with different actions
  useSelectedQuestions({
    selectedQuestionsFromCanvas,
    selectedAction,
    onSendMessage: handleSendMessage
  });

  // Handle external message sending (from canvas)
  useEffect(() => {
    if (onSendMessageToChat) {
      // This allows external components to send messages through this chat
      // The function is available for canvas components to use
    }
  }, [onSendMessageToChat]);

  // Get messages from active session or use default
  const activeSession = getActiveSession();
  const defaultMessages: Message[] = [
    {
      id: '1',
      role: 'bot' as const,
      text: 'Right, let\'s get started. What\'s the challenge you\'re looking to crack? Don\'t worry about having it perfectly formed — I\'ll help sharpen it.',
      timestamp: new Date(),
    },
  ];
  
  // Show default messages if no session exists or if session has no messages
  const messages: Message[] = activeSession?.messages && activeSession.messages.length > 0
    ? activeSession.messages.map(convertChatMessageToMessage)
    : defaultMessages;

  return (
    <ChatContainer
      messages={messages}
      inputValue={inputValue}
      setInputValue={setInputValue}
      isLoading={isLoading}
      handleSendMessage={handleSendMessage}
      messagesContainerRef={messagesContainerRef}
      scrollRef={scrollRef}
      isTransitioning={isTransitioning}
      shouldAutoScroll={shouldAutoScroll}
      previousMessagesLength={previousMessagesLength}
      onOpenCanvas={onOpenCanvas}
      onTriggerCanvas={onTriggerCanvas}
      isCanvasOpen={isCanvasOpen}
      hasCanvasBeenTriggered={hasCanvasBeenTriggered}
      currentTrigger={currentTrigger}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={onToggleSidebar}
      isCanvasOpenProp={isCanvasOpen}
      pendingCanvasGuidance={pendingCanvasGuidance}
      setPendingCanvasGuidance={setPendingCanvasGuidance}
      activeSession={activeSession}
      addMessageToSession={addMessageToSession}
    />
  );
};
