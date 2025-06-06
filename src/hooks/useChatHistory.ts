import { useState, useCallback, useEffect } from 'react';
import { ChatSession, ChatMessage } from './chat-history/types';
import { 
  loadSessionsFromStorage, 
  saveSessionsToStorage, 
  forceStorageUpdate 
} from './chat-history/storage';
import { 
  createNewChatSession, 
  updateSessionWithMessage, 
  getVisibleSessions, 
  findActiveSession 
} from './chat-history/sessionUtils';
import { generateChatTitle, shouldGenerateTitle } from './chat-history/titleGeneration';

// Re-export types for backward compatibility
export type { ChatSession, ChatMessage };

export const useChatHistory = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loadedSessions = loadSessionsFromStorage();
    setSessions(loadedSessions);
    
    // Only set active session if there are actually saved sessions
    if (loadedSessions.length > 0) {
      setActiveSessionId(loadedSessions[0].id);
      console.log('🎯 Set active session to:', loadedSessions[0].id);
    } else {
      console.log('📭 No saved sessions found, will create on first message');
      // Don't create a session automatically - wait for user's first message
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    saveSessionsToStorage(sessions);
  }, [sessions]);

  const createNewSession = useCallback((): string => {
    const newSession = createNewChatSession();

    setSessions(prev => {
      console.log('📋 Adding new session to sessions:', newSession.id);
      const newSessions = [newSession, ...prev];
      console.log('📊 Total sessions after creation:', newSessions.length);
      return newSessions;
    });
    
    setActiveSessionId(newSession.id);
    console.log('🎯 Set active session to new session:', newSession.id);
    return newSession.id;
  }, []);

  const getActiveSession = useCallback((): ChatSession | null => {
    return findActiveSession(sessions, activeSessionId);
  }, [activeSessionId, sessions]);

  const addMessageToSession = useCallback(async (sessionId: string, message: ChatMessage) => {
    console.log('📝 Adding message to session:', {
      sessionId,
      role: message.role,
      messageText: message.text.substring(0, 50) + '...'
    });
    
    setSessions(prev => {
      const updatedSessions = prev.map(session => {
        if (session.id === sessionId) {
          const updatedSession = updateSessionWithMessage(session, message);

          // If this is the first user message, immediately force state update
          if (message.role === 'user' && !session.hasUserMessage) {
            console.log('🎯 First user message - session will become visible');
            // Force immediate re-render and storage update
            setTimeout(() => {
              forceStorageUpdate([updatedSession, ...prev.filter(s => s.id !== sessionId)]);
            }, 0);
          }

          // Generate title if needed (but only for user messages that make it a real conversation)
          if (shouldGenerateTitle(session, message)) {
            console.log('🏷️ Generating title for session:', sessionId);
            setIsGeneratingTitle(true);
            generateChatTitle(updatedSession.messages).then(title => {
              setIsGeneratingTitle(false);
              setSessions(prevSessions => {
                const newSessions = prevSessions.map(s =>
                  s.id === sessionId ? { ...s, title } : s
                );
                forceStorageUpdate(newSessions);
                return newSessions;
              });
            });
          }

          return updatedSession;
        }
        return session;
      });

      // Force immediate storage update for sessions with user messages
      forceStorageUpdate(updatedSessions);
      return updatedSessions;
    });
  }, []);

  const updateSessionMessages = useCallback((sessionId: string, messages: ChatMessage[]) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, messages, lastActivity: new Date() }
          : session
      )
    );
  }, []);

  const switchToSession = useCallback((sessionId: string) => {
    console.log('🔄 Switching to session:', sessionId);
    setActiveSessionId(sessionId);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    console.log('🗑️ Deleting session:', sessionId);
    setSessions(prev => {
      const filtered = prev.filter(session => session.id !== sessionId);
      console.log('📊 Sessions after deletion:', filtered.map(s => s.id));
      
      // If we deleted the active session, switch to the most recent visible session or clear
      if (activeSessionId === sessionId) {
        const visibleSessions = getVisibleSessions(filtered);
        if (visibleSessions.length > 0) {
          setActiveSessionId(visibleSessions[0].id);
        } else {
          setActiveSessionId(null);
        }
      }
      
      return filtered;
    });
  }, [activeSessionId]);

  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, title: newTitle }
          : session
      )
    );
  }, []);

  const toggleStarSession = useCallback((sessionId: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, isStarred: !session.isStarred }
          : session
      )
    );
  }, []);

  // Return sessions that should be visible in the sidebar
  const visibleSessions = getVisibleSessions(sessions);

  console.log('📋 Chat history state:', {
    totalSessions: sessions.length,
    visibleSessions: visibleSessions.length,
    activeSessionId,
    activeSessionExists: !!getActiveSession()
  });

  return {
    sessions: visibleSessions,
    allSessions: sessions,
    activeSessionId,
    isGeneratingTitle,
    getActiveSession,
    createNewSession,
    addMessageToSession,
    updateSessionMessages,
    switchToSession,
    deleteSession,
    renameSession,
    toggleStarSession
  };
};
