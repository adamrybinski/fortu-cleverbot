
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, Question, CanvasPreviewData } from '@/components/chat/types';
import { QuestionSession } from './useQuestionSessions';
import { createUserMessage, createAssistantMessage, createErrorMessage } from './utils/messageUtils';
import { handleSessionManagement } from './utils/sessionUtils';
import { enhanceAssistantText, processApiResponse } from './utils/responseUtils';
import { ChatSession, ChatMessage } from './useChatHistory';

interface QuestionSessionsHook {
  questionSessions: QuestionSession[];
  activeSessionId: string | null;
  getActiveSession: () => QuestionSession | null;
  createNewSession: (question: string) => string;
  updateSession: (sessionId: string, updates: Partial<QuestionSession>) => void;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

interface UseMessageHandlerProps {
  selectedQuestionsFromCanvas: Question[];
  selectedAction: 'refine' | 'instance' | 'both';
  onClearSelectedQuestions?: () => void;
  shouldCreateCanvasPreview: (
    message: string, 
    agentUsed?: string, 
    readyForFortu?: boolean, 
    readyForMultiChallenge?: boolean,
    refinedChallenge?: string,
    onTriggerCanvas?: (trigger: any) => void
  ) => CanvasPreviewData | null;
  setHasCanvasBeenTriggered: (value: boolean) => void;
  onTriggerCanvas?: (trigger: any) => void;
  questionSessions?: QuestionSessionsHook;
  activeSession?: ChatSession | null;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  getActiveSession: () => ChatSession | null;
}

// Helper function to convert Message to ChatMessage
const convertMessageToChatMessage = (message: Message): ChatMessage => {
  return {
    id: message.id,
    role: message.role,
    text: message.text,
    timestamp: message.timestamp,
    selectedQuestions: message.selectedQuestions,
    selectedAction: message.selectedAction,
    canvasData: message.canvasData,
  };
};

export const useMessageHandler = ({
  selectedQuestionsFromCanvas,
  selectedAction,
  onClearSelectedQuestions,
  shouldCreateCanvasPreview,
  setHasCanvasBeenTriggered,
  onTriggerCanvas,
  questionSessions,
  activeSession,
  addMessageToSession,
  getActiveSession
}: UseMessageHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastProcessedQuestions, setLastProcessedQuestions] = useState<string>('');

  const handleSendMessage = async (messageText: string, isAutoMessage = false) => {
    if (!messageText.trim() || isLoading || !activeSession) {
      console.log('⚠️ Message sending blocked:', {
        hasText: !!messageText.trim(),
        isLoading,
        hasActiveSession: !!activeSession
      });
      return;
    }

    console.log('📤 Starting message send:', {
      messageText: messageText.substring(0, 50) + '...',
      isAutoMessage,
      activeSessionId: activeSession.id
    });

    // Prevent duplicate processing of the same selected questions
    if (isAutoMessage && selectedQuestionsFromCanvas.length > 0) {
      const questionsKey = selectedQuestionsFromCanvas.map(q => q.id).join(',');
      if (questionsKey === lastProcessedQuestions) {
        console.log('Skipping duplicate question processing');
        return;
      }
      setLastProcessedQuestions(questionsKey);
    }

    const newMessage = createUserMessage(
      messageText,
      selectedQuestionsFromCanvas,
      selectedAction,
      isAutoMessage
    );

    console.log('💬 Created user message:', { id: newMessage.id, text: newMessage.text.substring(0, 50) + '...' });

    // Add user message to session immediately
    const userChatMessage = convertMessageToChatMessage(newMessage);
    addMessageToSession(activeSession.id, userChatMessage);

    setIsLoading(true);

    // Clear selected questions after sending (only for manual messages)
    if (!isAutoMessage && onClearSelectedQuestions && selectedQuestionsFromCanvas.length > 0) {
      onClearSelectedQuestions();
    }

    try {
      // Get the current session with the newly added message
      const currentSession = getActiveSession();
      if (!currentSession) {
        throw new Error('Active session not found');
      }

      // Build conversation history from session messages
      const conversationHistory = currentSession.messages.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        text: msg.text
      }));

      console.log('🚀 Calling chat API with conversation history:', {
        historyLength: conversationHistory.length,
        lastMessage: conversationHistory[conversationHistory.length - 1]
      });

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: messageText,
          conversationHistory: conversationHistory,
          selectedQuestions: selectedQuestionsFromCanvas.length > 0 ? selectedQuestionsFromCanvas : undefined,
          selectedAction: selectedQuestionsFromCanvas.length > 0 ? selectedAction : undefined
        }
      });

      if (error || data?.error) {
        console.error('❌ API Error:', error || data?.error);
        throw new Error(data?.error || error.message);
      }

      const {
        assistantText,
        agentUsed,
        readyForFortu,
        readyForFortuInstance,
        refinedChallenge
      } = processApiResponse(data);

      console.log('✅ Received API response:', {
        assistantTextLength: assistantText.length,
        agentUsed,
        readyForFortu,
        refinedChallenge: refinedChallenge?.substring(0, 50) + '...'
      });

      // Handle session management
      handleSessionManagement(readyForFortu, refinedChallenge, questionSessions);

      // Create canvas preview for all cases including fortu
      const canvasPreviewData = shouldCreateCanvasPreview(
        messageText, 
        agentUsed, 
        readyForFortu,
        false, // No multi-challenge in simplified flow
        refinedChallenge,
        onTriggerCanvas
      );
      
      if (canvasPreviewData) {
        setHasCanvasBeenTriggered(true);
      }

      // Enhance assistant text with additional guidance
      const enhancedAssistantText = enhanceAssistantText(
        assistantText,
        readyForFortuInstance,
        refinedChallenge,
        canvasPreviewData
      );

      const assistantMessage = createAssistantMessage(enhancedAssistantText, canvasPreviewData);
      
      console.log('🤖 Created assistant message:', { id: assistantMessage.id, text: assistantMessage.text.substring(0, 50) + '...' });

      // Add assistant message to session
      const assistantChatMessage = convertMessageToChatMessage(assistantMessage);
      addMessageToSession(activeSession.id, assistantChatMessage);

      console.log('✅ Message handling completed successfully');

    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error);
      const errorMessage = createErrorMessage();
      const errorChatMessage = convertMessageToChatMessage(errorMessage);
      addMessageToSession(activeSession.id, errorChatMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSendMessage
  };
};
