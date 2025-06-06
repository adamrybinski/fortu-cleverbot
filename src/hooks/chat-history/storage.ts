
import { ChatSession } from './types';

const STORAGE_KEY = 'cleverbot_chat_history';

export const loadSessionsFromStorage = (): ChatSession[] => {
  console.log('🔄 Loading sessions from localStorage...');
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (!stored) {
    console.log('📭 No stored sessions found');
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    const sessionsWithDates = parsed.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      lastActivity: new Date(session.lastActivity),
      isSaved: true,
      hasUserMessage: session.hasUserMessage || false,
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
    
    console.log('✅ Loaded sessions from storage:', sessionsWithDates.length);
    return sessionsWithDates;
  } catch (error) {
    console.error('❌ Error loading chat history:', error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

export const saveSessionsToStorage = (sessions: ChatSession[]): void => {
  const validSessions = sessions.filter(session => session.isSaved && session.hasUserMessage);
  
  console.log('💾 Saving sessions to localStorage:', {
    totalSessions: sessions.length,
    validSessions: validSessions.length,
    sessionIds: validSessions.map(s => s.id)
  });
  
  if (validSessions.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validSessions));
  } else {
    const hasAnyUserSessions = sessions.some(s => s.hasUserMessage);
    if (!hasAnyUserSessions) {
      console.log('🗑️ No sessions with user messages, removing from localStorage');
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};

export const forceStorageUpdate = (sessions: ChatSession[]): void => {
  const sessionsToSave = sessions.filter(session => session.isSaved && session.hasUserMessage);
  
  console.log('💾 Force localStorage update:', {
    totalSessions: sessions.length,
    sessionsToSave: sessionsToSave.length,
    sessionIds: sessionsToSave.map(s => s.id)
  });
  
  if (sessionsToSave.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave));
  }
};
