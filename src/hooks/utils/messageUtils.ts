
import { Message } from '@/components/chat/types';

export const createUserMessage = (
  messageText: string,
  selectedQuestions: any[],
  selectedAction: 'refine' | 'instance' | 'both',
  isAutoMessage: boolean
): Message => {
  return {
    id: Date.now().toString(),
    role: 'user',
    text: messageText,
    timestamp: new Date(),
    selectedQuestions: !isAutoMessage && selectedQuestions.length > 0 ? selectedQuestions : undefined,
    selectedAction: !isAutoMessage && selectedQuestions.length > 0 ? selectedAction : undefined,
  };
};

export const createAssistantMessage = (
  text: string,
  canvasData?: any
): Message => {
  return {
    id: (Date.now() + 1).toString(),
    role: 'bot',
    text,
    timestamp: new Date(),
    canvasData: canvasData || undefined
  };
};

export const createErrorMessage = (): Message => {
  return {
    id: (Date.now() + 1).toString(),
    role: 'bot',
    text: 'Right, hit a snag there. Technical hiccup on my end. Give it another go?',
    timestamp: new Date(),
  };
};
