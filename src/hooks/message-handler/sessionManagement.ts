
import { ChatSession, ChatMessage } from '../chat-history/types';

export interface SessionManager {
  getActiveSession: () => ChatSession | null;
  createNewSession: () => string;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
}

export const ensureActiveSession = async (sessionManager: SessionManager): Promise<ChatSession> => {
  let activeSession = sessionManager.getActiveSession();
  
  console.log('🔍 Current active session:', {
    exists: !!activeSession,
    id: activeSession?.id,
    hasUserMessage: activeSession?.hasUserMessage,
    isSaved: activeSession?.isSaved
  });
  
  if (!activeSession) {
    console.log('🆕 No active session found, creating new session');
    const newSessionId = sessionManager.createNewSession();
    console.log('✅ Created new session:', newSessionId);
    
    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 100));
    activeSession = sessionManager.getActiveSession();
    
    if (!activeSession) {
      console.error('❌ Failed to create or retrieve new session');
      throw new Error('Failed to create new session');
    }
  }

  console.log('✅ Using session:', activeSession.id);
  return activeSession;
};

export const waitForSessionUpdate = async (sessionManager: SessionManager, timeoutMs = 50): Promise<ChatSession> => {
  await new Promise(resolve => setTimeout(resolve, timeoutMs));
  
  const updatedSession = sessionManager.getActiveSession();
  if (!updatedSession) {
    console.error('❌ Session not found after adding message');
    throw new Error('Active session not found after adding message');
  }

  return updatedSession;
};
