
import { Message } from '@/components/chat/types';
import { ChatMessage } from '../chat-history/types';

export const convertMessageToChatMessage = (message: Message): ChatMessage => {
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
