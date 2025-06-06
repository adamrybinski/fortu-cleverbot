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

  // Save only saved sessions to localStorage
  useEffect(() => {
    const savedSessions = sessions.filter(session => session.isSaved);
    console.log('💾 Saving sessions to localStorage:', savedSessions.length);
    
    if (savedSessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSessions));
    } else {
      console.log('🗑️ No saved sessions, removing from localStorage');
      localStorage.removeItem(STORAGE_KEY);
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

  const saveCurrentSession = useCallback(() => {
    console.log('💾 Attempting to save current session:', activeSessionId);
    const activeSession = sessions.find(session => session.id === activeSessionId);
    if (activeSession && activeSession.hasUserMessage && !activeSession.isSaved) {
      console.log('✅ Saving current session:', activeSessionId);
      setSessions(prev =>
        prev.map(session =>
          session.id === activeSessionId
            ? { ...session, isSaved: true }
            : session
        )
      );
    } else {
      console.log('⏭️ Session not saved - conditions not met:', {
        hasActiveSession: !!activeSession,
        hasUserMessage: activeSession?.hasUserMessage,
        isSaved: activeSession?.isSaved
      });
    }
  }, [activeSessionId, sessions]);

  const getActiveSession = useCallback((): ChatSession | null => {
    if (!activeSessionId) {
      console.log('❌ No active session ID');
      return null;
    }
    const session = sessions.find(session => session.id === activeSessionId) || null;
    console.log('🎯 Active session:', session?.id, 'Found:', !!session);
    return session;
  }, [activeSessionId, sessions]);

  const addMessageToSession = useCallback(async (sessionId: string, message: ChatMessage) => {
    console.log('📝 Adding message to session:', sessionId, 'Role:', message.role);
    setSessions(prev => 
      prev.map(session => {
        if (session.id === sessionId) {
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
            id: sessionId,
            hasUserMessage: updatedSession.hasUserMessage,
            isSaved: updatedSession.isSaved,
            messageCount: updatedSession.messages.length,
            isFirstUserMessage
          });

          // Generate title if this is the first user message and title is still "New Chat"
          if (session.title === 'New Chat' && message.role === 'user' && updatedMessages.filter(m => m.role === 'user').length === 1) {
            console.log('🏷️ Generating title for session:', sessionId);
            generateChatTitle(updatedMessages).then(title => {
              setSessions(prevSessions =>
                prevSessions.map(s =>
                  s.id === sessionId ? { ...s, title } : s
                )
              );
            });
          }

          return updatedSession;
        }
        return session;
      })
    );
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
      
      // If we deleted the active session, switch to the most recent session or clear
      if (activeSessionId === sessionId) {
        const savedSessions = filtered.filter(s => s.isSaved);
        if (savedSessions.length > 0) {
          setActiveSessionId(savedSessions[0].id);
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
  const visibleSessions = sessions.filter(session => {
    const shouldShow = session.isSaved && session.hasUserMessage;
    console.log('🔍 Session visibility check:', {
      id: session.id,
      isSaved: session.isSaved,
      hasUserMessage: session.hasUserMessage,
      shouldShow
    });
    return shouldShow;
  });

  console.log('📋 Visible sessions for sidebar:', visibleSessions.length);

  return {
    sessions: visibleSessions,
    allSessions: sessions,
    activeSessionId,
    isGeneratingTitle,
    getActiveSession,
    createNewSession,
    saveCurrentSession,
    addMessageToSession,
    updateSessionMessages,
    switchToSession,
    deleteSession,
    renameSession,
    toggleStarSession
  };
};
