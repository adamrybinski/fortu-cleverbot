
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/components/chat/types';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface ApiCallParams {
  messageText: string;
  conversationHistory: ConversationMessage[];
  selectedQuestions?: Question[];
  selectedAction?: 'refine' | 'instance' | 'both';
}

export const callChatAPI = async ({
  messageText,
  conversationHistory,
  selectedQuestions,
  selectedAction
}: ApiCallParams) => {
  console.log('🚀 Calling chat API with conversation history:', {
    historyLength: conversationHistory.length,
    lastMessage: conversationHistory[conversationHistory.length - 1]
  });

  const { data, error } = await supabase.functions.invoke('chat', {
    body: {
      message: messageText,
      conversationHistory: conversationHistory,
      selectedQuestions: selectedQuestions?.length ? selectedQuestions : undefined,
      selectedAction: selectedQuestions?.length ? selectedAction : undefined
    }
  });

  if (error || data?.error) {
    console.error('❌ API Error:', error || data?.error);
    throw new Error(data?.error || error.message);
  }

  return data;
};

export const buildConversationHistory = (messages: any[]): ConversationMessage[] => {
  return messages.map(msg => ({
    role: msg.role === 'bot' ? 'assistant' : 'user',
    text: msg.text
  }));
};
