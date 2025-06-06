
import { Message, Question, CanvasPreviewData } from '@/components/chat/types';
import { createUserMessage, createAssistantMessage, createErrorMessage } from '../utils/messageUtils';
import { enhanceAssistantText, processApiResponse } from '../utils/responseUtils';
import { handleSessionManagement } from '../utils/sessionUtils';
import { QuestionSession } from '../useQuestionSessions';

interface QuestionSessionsHook {
  questionSessions: QuestionSession[];
  activeSessionId: string | null;
  getActiveSession: () => QuestionSession | null;
  createNewSession: (question: string) => string;
  updateSession: (sessionId: string, updates: Partial<QuestionSession>) => void;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

export interface MessageProcessingParams {
  messageText: string;
  selectedQuestionsFromCanvas: Question[];
  selectedAction: 'refine' | 'instance' | 'both';
  isAutoMessage: boolean;
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
}

export const createUserMessageFromInput = (
  messageText: string,
  selectedQuestionsFromCanvas: Question[],
  selectedAction: 'refine' | 'instance' | 'both',
  isAutoMessage: boolean
): Message => {
  const newMessage = createUserMessage(
    messageText,
    selectedQuestionsFromCanvas,
    selectedAction,
    isAutoMessage
  );

  console.log('💬 Created user message:', { 
    id: newMessage.id, 
    text: newMessage.text.substring(0, 50) + '...',
    role: newMessage.role
  });

  return newMessage;
};

export const processApiResponseData = (
  data: any,
  params: MessageProcessingParams
): Message => {
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
  handleSessionManagement(readyForFortu, refinedChallenge, params.questionSessions);

  // Create canvas preview for all cases including fortu
  const canvasPreviewData = params.shouldCreateCanvasPreview(
    params.messageText, 
    agentUsed, 
    readyForFortu,
    false, // No multi-challenge in simplified flow
    refinedChallenge,
    params.onTriggerCanvas
  );
  
  if (canvasPreviewData) {
    params.setHasCanvasBeenTriggered(true);
  }

  // Enhance assistant text with additional guidance
  const enhancedAssistantText = enhanceAssistantText(
    assistantText,
    readyForFortuInstance,
    refinedChallenge,
    canvasPreviewData
  );

  const assistantMessage = createAssistantMessage(enhancedAssistantText, canvasPreviewData);
  
  console.log('🤖 Created assistant message:', { 
    id: assistantMessage.id, 
    text: assistantMessage.text.substring(0, 50) + '...' 
  });

  return assistantMessage;
};

export const createAndReturnErrorMessage = (): Message => {
  const errorMessage = createErrorMessage();
  console.log('❌ Created error message:', errorMessage.id);
  return errorMessage;
};
