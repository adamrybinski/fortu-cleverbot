
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, Question, CanvasPreviewData } from '@/components/chat/types';
import { QuestionSession } from './useQuestionSessions';
import { createUserMessage, createAssistantMessage, createErrorMessage } from './utils/messageUtils';
import { handleSessionManagement } from './utils/sessionUtils';
import { enhanceAssistantText, processApiResponse } from './utils/responseUtils';
import { ChatSession } from './useChatHistory';

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
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
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
}

export const useMessageHandler = ({
  messages,
  setMessages,
  selectedQuestionsFromCanvas,
  selectedAction,
  onClearSelectedQuestions,
  shouldCreateCanvasPreview,
  setHasCanvasBeenTriggered,
  onTriggerCanvas,
  questionSessions,
  activeSession
}: UseMessageHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastProcessedQuestions, setLastProcessedQuestions] = useState<string>('');

  const handleSendMessage = async (messageText: string, isAutoMessage = false) => {
    if (!messageText.trim() || isLoading || !activeSession) return;

    console.log('📤 Sending message:', {
      messageText: messageText.substring(0, 50) + '...',
      isAutoMessage,
      activeSessionId: activeSession.id,
      currentMessageCount: messages.length
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

    console.log('💬 Adding user message:', { id: newMessage.id, text: newMessage.text.substring(0, 50) + '...' });

    // Add user message immediately to prevent race conditions
    setMessages(prev => {
      const updated = [...prev, newMessage];
      console.log('📝 Updated messages after user message:', {
        previousCount: prev.length,
        newCount: updated.length,
        lastMessage: updated[updated.length - 1]
      });
      return updated;
    });

    setIsLoading(true);

    // Clear selected questions after sending (only for manual messages)
    if (!isAutoMessage && onClearSelectedQuestions && selectedQuestionsFromCanvas.length > 0) {
      onClearSelectedQuestions();
    }

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        text: msg.text
      }));

      console.log('🚀 Calling chat API with conversation history length:', conversationHistory.length);

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          message: messageText,
          conversationHistory: conversationHistory,
          selectedQuestions: selectedQuestionsFromCanvas.length > 0 ? selectedQuestionsFromCanvas : undefined,
          selectedAction: selectedQuestionsFromCanvas.length > 0 ? selectedAction : undefined
        }
      });

      if (error || data?.error) throw new Error(data?.error || error.message);

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
      
      console.log('🤖 Adding assistant message:', { id: assistantMessage.id, text: assistantMessage.text.substring(0, 50) + '...' });

      // Add assistant message
      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        console.log('📝 Updated messages after assistant message:', {
          previousCount: prev.length,
          newCount: updated.length,
          messages: updated.map(m => ({ id: m.id, role: m.role, text: m.text.substring(0, 30) + '...' }))
        });
        return updated;
      });

    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error);
      const errorMessage = createErrorMessage();
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSendMessage
  };
};
