
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from './types';

export const generateChatTitle = async (messages: ChatMessage[]): Promise<string> => {
  if (messages.length === 0) return 'New Chat';
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-chat-title', {
      body: { messages: messages.slice(0, 4) }
    });

    if (error) {
      console.error('Error generating title:', error);
      return 'New Chat';
    }

    return data.title || 'New Chat';
  } catch (error) {
    console.error('Error generating title:', error);
    return 'New Chat';
  }
};

export const shouldGenerateTitle = (session: any, message: ChatMessage): boolean => {
  // Only generate title when:
  // 1. Current title is "New Chat" (hasn't been generated yet)
  // 2. This is a user message
  // 3. This is the first user message in the conversation
  return (
    session.title === 'New Chat' && 
    message.role === 'user' && 
    session.messages.filter((m: ChatMessage) => m.role === 'user').length === 1
  );
};
