
import { ChatSession, ChatMessage } from './types';

export const createNewChatSession = (): ChatSession => {
  console.log('🆕 Creating new session...');
  
  return {
    id: `session_${Date.now()}`,
    title: 'New Chat',
    messages: [{
      id: '1',
      role: 'bot',
      text: 'Right, let\'s get started. What\'s the challenge you\'re looking to crack? Don\'t worry about having it perfectly formed — I\'ll help sharpen it.',
      timestamp: new Date(),
    }],
    createdAt: new Date(),
    lastActivity: new Date(),
    isStarred: false,
    isSaved: false,
    hasUserMessage: false
  };
};

export const updateSessionWithMessage = (
  session: ChatSession, 
  message: ChatMessage
): ChatSession => {
  const updatedMessages = [...session.messages, message];
  const isFirstUserMessage = message.role === 'user' && !session.hasUserMessage;
  
  const updatedSession = {
    ...session,
    messages: updatedMessages,
    lastActivity: new Date(),
    hasUserMessage: session.hasUserMessage || message.role === 'user',
    isSaved: session.isSaved || isFirstUserMessage
  };

  console.log('📊 Session updated:', {
    id: session.id,
    hasUserMessage: updatedSession.hasUserMessage,
    isSaved: updatedSession.isSaved,
    messageCount: updatedSession.messages.length,
    isFirstUserMessage,
    shouldBeVisible: updatedSession.hasUserMessage && updatedSession.isSaved
  });

  return updatedSession;
};

export const getVisibleSessions = (sessions: ChatSession[]): ChatSession[] => {
  return sessions.filter(session => {
    const shouldShow = session.hasUserMessage && session.isSaved;
    console.log('🔍 Session visibility check:', {
      id: session.id,
      title: session.title,
      isSaved: session.isSaved,
      hasUserMessage: session.hasUserMessage,
      shouldShow
    });
    return shouldShow;
  });
};

export const findActiveSession = (
  sessions: ChatSession[], 
  activeSessionId: string | null
): ChatSession | null => {
  if (!activeSessionId) {
    console.log('❌ No active session ID');
    return null;
  }
  
  const session = sessions.find(session => session.id === activeSessionId) || null;
  console.log('🎯 Active session lookup:', {
    activeSessionId,
    found: !!session,
    sessionTitle: session?.title,
    hasUserMessage: session?.hasUserMessage,
    isSaved: session?.isSaved
  });
  
  return session;
};
