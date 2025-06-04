
import { useState, useEffect } from 'react';

export interface ChallengeSession {
  id: string;
  originalChallenge: string;
  refinedChallenge: string;
  selectedQuestions: Question[];
  allQuestions: Question[];
  timestamp: Date;
  status: 'exploring' | 'refined' | 'completed';
  fortuGuidanceProvided: boolean;
}

interface Question {
  id: string | number;
  question: string;
  source: 'fortu' | 'openai';
  selected?: boolean;
  relevance?: number;
  context?: string;
  organisations?: number;
  status?: 'Discovery' | 'Explore' | 'Journey' | 'Equip' | 'AI';
  insights?: string;
}

const STORAGE_KEY = 'cleverbot_challenge_history';

export const useChallengeHistory = () => {
  const [challengeHistory, setChallengeHistory] = useState<ChallengeSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load challenge history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const sessions = parsed.map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp)
        }));
        setChallengeHistory(sessions);
      } catch (error) {
        console.error('Error loading challenge history:', error);
      }
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challengeHistory));
  }, [challengeHistory]);

  const createNewSession = (originalChallenge: string): string => {
    const newSession: ChallengeSession = {
      id: `session_${Date.now()}`,
      originalChallenge,
      refinedChallenge: '',
      selectedQuestions: [],
      allQuestions: [],
      timestamp: new Date(),
      status: 'exploring',
      fortuGuidanceProvided: false
    };

    setChallengeHistory(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const updateSession = (sessionId: string, updates: Partial<ChallengeSession>) => {
    setChallengeHistory(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates }
          : session
      )
    );
  };

  const getCurrentSession = (): ChallengeSession | null => {
    if (!currentSessionId) return null;
    return challengeHistory.find(session => session.id === currentSessionId) || null;
  };

  const switchToSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const deleteSession = (sessionId: string) => {
    setChallengeHistory(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const getUnselectedQuestions = (sessionId: string): Question[] => {
    const session = challengeHistory.find(s => s.id === sessionId);
    if (!session) return [];
    
    return session.allQuestions.filter(q => 
      !session.selectedQuestions.some(selected => selected.id === q.id)
    );
  };

  const markSessionCompleted = (sessionId: string) => {
    updateSession(sessionId, { 
      status: 'completed',
      fortuGuidanceProvided: true 
    });
  };

  const clearHistory = () => {
    setChallengeHistory([]);
    setCurrentSessionId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    challengeHistory,
    currentSessionId,
    getCurrentSession,
    createNewSession,
    updateSession,
    switchToSession,
    deleteSession,
    getUnselectedQuestions,
    markSessionCompleted,
    clearHistory
  };
};
