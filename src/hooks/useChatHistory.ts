import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/components/chat/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  selectedQuestions?: Question[];
  selectedAction?: 'refine' | 'instance' | 'both';
  isAutoMessage?: boolean;
  canvasData?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
  isStarred?: boolean;
  isSaved?: boolean;
  hasUserMessage?: boolean;
}

const STORAGE_KEY = 'cleverbot_chat_history';

export const useChatHistory = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  // Load sessions from localStorage on mount
  useEffect(() => {
    console.log('🔄 Loading sessions from localStorage...');
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
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
        setSessions(sessionsWithDates);
        
        // Set the most recent session as active if none is set
        if (sessionsWithDates.length > 0) {
          setActiveSessionId(sessionsWithDates[0].id);
          console.log('🎯 Set active session to:', sessionsWithDates[0].id);
        }
      } catch (error) {
        console.error('❌ Error loading chat history:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      console.log('📭 No stored sessions found');
    }
  }, []);

  // Immediate localStorage save helper
  const saveToStorage = useCallback((sessionsToSave: ChatSession[]) => {
    const validSessions = sessionsToSave.filter(session => session.isSaved && session.hasUserMessage);
    console.log('💾 Immediate save to localStorage:', {
      totalSessions: sessionsToSave.length,
      validSessions: validSessions.length,
      sessionIds: validSessions.map(s => s.id)
    });
    
    if (validSessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validSessions));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    const sessionsToSave = sessions.filter(session => session.isSaved && session.hasUserMessage);
    console.log('💾 Auto-saving sessions to localStorage:', {
      totalSessions: sessions.length,
      sessionsToSave: sessionsToSave.length,
      sessionIds: sessionsToSave.map(s => s.id)
    });
    
    if (sessionsToSave.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave));
    } else {
      // Only remove if there are truly no sessions with user messages
      const hasAnyUserSessions = sessions.some(s => s.hasUserMessage);
      if (!hasAnyUserSessions) {
        console.log('🗑️ No sessions with user messages, removing from localStorage');
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [sessions]);

  const generateChatTitle = async (messages: ChatMessage[]): Promise<string> => {
    if (messages.length === 0) return 'New Chat';
    
    try {
      setIsGeneratingTitle(true);
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
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const createNewSession = useCallback((): string => {
    console.log('🆕 Creating new session...');
    const newSession: ChatSession = {
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
          const updatedMessages = [...session.messages, message];
          const isFirstUserMessage = message.role === 'user' && !session.hasUserMessage;
          
          const updatedSession = {
            ...session,
            messages: updatedMessages,
            lastActivity: new Date(),
            hasUserMessage: session.hasUserMessage || message.role === 'user',
            // Immediately save session when user sends first message
            isSaved: session.isSaved || isFirstUserMessage
          };

          console.log('📊 Session updated:', {
            id: sessionId,
            hasUserMessage: updatedSession.hasUserMessage,
            isSaved: updatedSession.isSaved,
            messageCount: updatedSession.messages.length,
            isFirstUserMessage,
            shouldBeVisible: updatedSession.hasUserMessage && updatedSession.isSaved
          });

          // Generate title if this is the first user message and title is still "New Chat"
          if (session.title === 'New Chat' && message.role === 'user' && updatedMessages.filter(m => m.role === 'user').length === 1) {
            console.log('🏷️ Generating title for session:', sessionId);
            generateChatTitle(updatedMessages).then(title => {
              setSessions(prevSessions => {
                const newSessions = prevSessions.map(s =>
                  s.id === sessionId ? { ...s, title } : s
                );
                // Immediate save after title update
                const validSessions = newSessions.filter(s => s.isSaved && s.hasUserMessage);
                if (validSessions.length > 0) {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(validSessions));
                }
                return newSessions;
              });
            });
          }

          return updatedSession;
        }
        return session;
      });

      // Immediate save to localStorage for sessions with user messages
      const sessionsToSave = updatedSessions.filter(session => session.isSaved && session.hasUserMessage);
      if (sessionsToSave.length > 0) {
        console.log('💾 Immediate localStorage update after message');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave));
      }

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
        const visibleSessions = filtered.filter(s => s.isSaved && s.hasUserMessage);
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

  // Return sessions that should be visible in the sidebar - simplified logic
  const visibleSessions = sessions.filter(session => {
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
