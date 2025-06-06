
import { useState } from 'react';
import { Question, CanvasPreviewData } from '@/components/chat/types';
import { QuestionSession } from './useQuestionSessions';
import { ChatSession, ChatMessage } from './useChatHistory';
import { convertMessageToChatMessage } from './message-handler/messageConversion';
import { callChatAPI, buildConversationHistory } from './message-handler/apiCommunication';
import { ensureActiveSession, waitForSessionUpdate, SessionManager } from './message-handler/sessionManagement';
import { 
  createUserMessageFromInput, 
  processApiResponseData, 
  createAndReturnErrorMessage,
  MessageProcessingParams 
} from './message-handler/messageProcessing';

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
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  getActiveSession: () => ChatSession | null;
  createNewSession: () => string;
}

export const useMessageHandler = ({
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
}: UseMessageHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastProcessedQuestions, setLastProcessedQuestions] = useState<string>('');

  const sessionManager: SessionManager = {
    getActiveSession,
    createNewSession,
    addMessageToSession
  };

  const handleSendMessage = async (messageText: string, isAutoMessage = false) => {
    if (!messageText.trim() || isLoading) {
      console.log('⚠️ Message sending blocked:', {
        hasText: !!messageText.trim(),
        isLoading
      });
      return;
    }

    console.log('📤 Starting message send:', {
      messageText: messageText.substring(0, 50) + '...',
      isAutoMessage
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

    setIsLoading(true);

    try {
      // Ensure we have an active session
      const activeSession = await ensureActiveSession(sessionManager);

      // Create and add user message
      const newMessage = createUserMessageFromInput(
        messageText,
        selectedQuestionsFromCanvas,
        selectedAction,
        isAutoMessage
      );

      const userChatMessage = convertMessageToChatMessage(newMessage);
      console.log('📝 Adding user message to session:', activeSession.id);
      addMessageToSession(activeSession.id, userChatMessage);

      // Clear selected questions after sending (only for manual messages)
      if (!isAutoMessage && onClearSelectedQuestions && selectedQuestionsFromCanvas.length > 0) {
        onClearSelectedQuestions();
      }

      // Wait for session state to update
      const updatedSession = await waitForSessionUpdate(sessionManager);

      console.log('📊 Updated session state after user message:', {
        id: updatedSession.id,
        hasUserMessage: updatedSession.hasUserMessage,
        isSaved: updatedSession.isSaved,
        messageCount: updatedSession.messages.length
      });

      // Build conversation history and call API
      const conversationHistory = buildConversationHistory(updatedSession.messages);
      const apiData = await callChatAPI({
        messageText,
        conversationHistory,
        selectedQuestions: selectedQuestionsFromCanvas.length > 0 ? selectedQuestionsFromCanvas : undefined,
        selectedAction: selectedQuestionsFromCanvas.length > 0 ? selectedAction : undefined
      });

      // Process API response and create assistant message
      const processingParams: MessageProcessingParams = {
        messageText,
        selectedQuestionsFromCanvas,
        selectedAction,
        isAutoMessage,
        shouldCreateCanvasPreview,
        setHasCanvasBeenTriggered,
        onTriggerCanvas,
        questionSessions
      };

      const assistantMessage = processApiResponseData(apiData, processingParams);

      // Add assistant message to session
      const assistantChatMessage = convertMessageToChatMessage(assistantMessage);
      addMessageToSession(updatedSession.id, assistantChatMessage);

      console.log('✅ Message handling completed successfully');

    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error);
      
      // Ensure we have a session for the error message
      try {
        const errorSession = await ensureActiveSession(sessionManager);
        const errorMessage = createAndReturnErrorMessage();
        const errorChatMessage = convertMessageToChatMessage(errorMessage);
        addMessageToSession(errorSession.id, errorChatMessage);
      } catch (sessionError) {
        console.error('❌ Failed to add error message to session:', sessionError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSendMessage
  };
};
