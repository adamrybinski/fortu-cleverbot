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
  isSaved?: boolean; // New flag to track if session is saved to localStorage
}

const STORAGE_KEY = 'cleverbot_chat_history';

export const useChatHistory = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          lastActivity: new Date(session.lastActivity),
          isSaved: true, // All loaded sessions are considered saved
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(sessionsWithDates);
        
        // Set the most recent session as active if none is set
        if (sessionsWithDates.length > 0 && !activeSessionId) {
          setActiveSessionId(sessionsWithDates[0].id);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Save only saved sessions to localStorage
  useEffect(() => {
    const savedSessions = sessions.filter(session => session.isSaved);
    if (savedSessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSessions));
    } else {
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
      isSaved: false // Start as unsaved until user sends first message
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  }, []);

  const getActiveSession = useCallback((): ChatSession | null => {
    if (!activeSessionId) return null;
    return sessions.find(session => session.id === activeSessionId) || null;
  }, [activeSessionId, sessions]);

  const addMessageToSession = useCallback(async (sessionId: string, message: ChatMessage) => {
    setSessions(prev => 
      prev.map(session => {
        if (session.id === sessionId) {
          const updatedMessages = [...session.messages, message];
          const isFirstUserMessage = message.role === 'user' && !session.isSaved;
          
          const updatedSession = {
            ...session,
            messages: updatedMessages,
            lastActivity: new Date(),
            isSaved: session.isSaved || isFirstUserMessage // Mark as saved when user sends first message
          };

          // Generate title if this is the first user message and title is still "New Chat"
          if (session.title === 'New Chat' && message.role === 'user' && updatedMessages.filter(m => m.role === 'user').length === 1) {
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
    setActiveSessionId(sessionId);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const filtered = prev.filter(session => session.id !== sessionId);
      
      // If we deleted the active session, handle appropriately
      if (activeSessionId === sessionId) {
        if (filtered.length > 0) {
          // Switch to the first available session
          setActiveSessionId(filtered[0].id);
        } else {
          // No sessions left, create a new one
          const newSessionId = createNewSession();
          // Don't set active here as createNewSession already does it
        }
      }
      
      return filtered;
    });
  }, [activeSessionId, createNewSession]);

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

  return {
    sessions: sessions.filter(session => session.isSaved), // Only return saved sessions for sidebar
    allSessions: sessions, // Return all sessions for internal use
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
