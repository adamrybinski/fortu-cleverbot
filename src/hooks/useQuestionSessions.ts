
import { useState, useCallback } from 'react';
import { Question } from '@/components/canvas/modules/types';

export interface QuestionSession {
  id: string;
  question: string;
  refinedChallenge?: string;
  fortuQuestions: Question[];
  aiQuestions: Question[];
  selectedQuestions: Question[];
  status: 'asking' | 'searching' | 'matches_found' | 'refined';
  timestamp: Date;
}

export const useQuestionSessions = () => {
  const [questionSessions, setQuestionSessions] = useState<QuestionSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const createNewSession = useCallback((question: string): string => {
    const newSession: QuestionSession = {
      id: `session_${Date.now()}`,
      question,
      refinedChallenge: undefined,
      fortuQuestions: [],
      aiQuestions: [],
      selectedQuestions: [],
      status: 'asking',
      timestamp: new Date()
    };

    setQuestionSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  }, []);

  const updateSession = useCallback((sessionId: string, updates: Partial<QuestionSession>) => {
    setQuestionSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, ...updates }
          : session
      )
    );
  }, []);

  const getActiveSession = useCallback((): QuestionSession | null => {
    if (!activeSessionId) return null;
    return questionSessions.find(session => session.id === activeSessionId) || null;
  }, [activeSessionId, questionSessions]);

  const switchToSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setQuestionSessions(prev => prev.filter(session => session.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(questionSessions.length > 1 ? questionSessions[0].id : null);
    }
  }, [activeSessionId, questionSessions]);

  return {
    questionSessions,
    activeSessionId,
    getActiveSession,
    createNewSession,
    updateSession,
    switchToSession,
    deleteSession
  };
};
