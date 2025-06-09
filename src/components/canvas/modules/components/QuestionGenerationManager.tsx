
import React, { useEffect } from 'react';
import { QuestionSession } from '@/hooks/useQuestionSessions';

interface QuestionSessionsHook {
  questionSessions: QuestionSession[];
  activeSessionId: string | null;
  getActiveSession: () => QuestionSession | null;
  createNewSession: (question: string) => string;
  updateSession: (sessionId: string, updates: Partial<QuestionSession>) => void;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

interface QuestionGenerationManagerProps {
  // Canvas state
  isSearchReady?: boolean;
  refinedChallenge?: string;
  hasTriggeredGenerationRef: React.MutableRefObject<boolean>;
  isLoadingFortu: boolean;
  isLoadingAI: boolean;
  
  // Session state
  activeSession: QuestionSession | null;
  loadingFromSessionRef: React.MutableRefObject<boolean>;
  lastSessionIdRef: React.MutableRefObject<string | null>;
  
  // Questions state
  fortuQuestions: any[];
  aiQuestions: any[];
  
  // Actions
  generateAllQuestions: (challenge: string) => Promise<void>;
  loadQuestionsFromSession: (fortu: any[], ai: any[], selected?: any[]) => void;
  clearQuestions: () => void;
  
  // Session management
  questionSessions?: QuestionSessionsHook;
}

export const QuestionGenerationManager: React.FC<QuestionGenerationManagerProps> = ({
  isSearchReady,
  refinedChallenge,
  hasTriggeredGenerationRef,
  isLoadingFortu,
  isLoadingAI,
  activeSession,
  loadingFromSessionRef,
  lastSessionIdRef,
  fortuQuestions,
  aiQuestions,
  generateAllQuestions,
  loadQuestionsFromSession,
  clearQuestions,
  questionSessions
}) => {
  // Handle immediate generation when canvas loads with searchReady payload
  useEffect(() => {
    if (isSearchReady && refinedChallenge && !hasTriggeredGenerationRef.current && !isLoadingFortu && !isLoadingAI) {
      console.log('🚀 IMMEDIATE GENERATION - SearchReady payload detected:', refinedChallenge);
      hasTriggeredGenerationRef.current = true;
      generateAllQuestions(refinedChallenge);
    }
  }, [isSearchReady, refinedChallenge, isLoadingFortu, isLoadingAI, generateAllQuestions]);

  // Handle session switching - clear questions and load from new session
  useEffect(() => {
    if (activeSession && activeSession.id !== lastSessionIdRef.current) {
      console.log('📋 Session changed to:', activeSession.id);
      lastSessionIdRef.current = activeSession.id;
      
      // Reset generation trigger when switching sessions
      hasTriggeredGenerationRef.current = false;
      
      // Set loading flag to prevent save effect from running
      loadingFromSessionRef.current = true;
      
      // If session has questions, load them; otherwise clear questions
      if (activeSession.fortuQuestions.length > 0 || activeSession.aiQuestions.length > 0) {
        console.log('📥 Loading existing questions from session:', activeSession.id);
        loadQuestionsFromSession(activeSession.fortuQuestions, activeSession.aiQuestions, activeSession.selectedQuestions);
      } else {
        console.log('🧹 Clearing questions for new/empty session:', activeSession.id);
        clearQuestions();
      }
      
      // Reset loading flag after a brief delay to allow state updates
      setTimeout(() => {
        loadingFromSessionRef.current = false;
      }, 100);
    }
  }, [activeSession?.id, loadQuestionsFromSession, clearQuestions]);

  // Auto-generate questions for sessions with refined challenges but no questions
  useEffect(() => {
    // Skip if we're loading from session, already loading, no session, or already triggered
    if (loadingFromSessionRef.current || isLoadingFortu || isLoadingAI || !activeSession || hasTriggeredGenerationRef.current) {
      console.log('⏸️ Skipping auto-generation:', {
        loadingFromSession: loadingFromSessionRef.current,
        isLoadingFortu,
        isLoadingAI,
        hasActiveSession: !!activeSession,
        hasTriggeredGeneration: hasTriggeredGenerationRef.current
      });
      return;
    }

    // Check if we need to generate questions
    const hasNoQuestions = activeSession.fortuQuestions.length === 0 && 
                          activeSession.aiQuestions.length === 0 &&
                          fortuQuestions.length === 0 && 
                          aiQuestions.length === 0;

    const shouldGenerate = activeSession.refinedChallenge && hasNoQuestions;

    console.log('🤔 Auto-generation decision:', {
      sessionId: activeSession.id,
      refinedChallenge: activeSession.refinedChallenge,
      sessionFortuCount: activeSession.fortuQuestions.length,
      sessionAiCount: activeSession.aiQuestions.length,
      localFortuCount: fortuQuestions.length,
      localAiCount: aiQuestions.length,
      hasNoQuestions,
      shouldGenerate
    });

    if (shouldGenerate) {
      console.log('🚀 AUTO-GENERATION - Generating questions for challenge:', activeSession.refinedChallenge);
      hasTriggeredGenerationRef.current = true;
      generateAllQuestions(activeSession.refinedChallenge);
    }
  }, [
    activeSession?.id, 
    activeSession?.refinedChallenge, 
    activeSession?.fortuQuestions.length,
    activeSession?.aiQuestions.length,
    fortuQuestions.length, 
    aiQuestions.length, 
    isLoadingFortu, 
    isLoadingAI, 
    generateAllQuestions
  ]);

  // Save generated questions to active session - only when not loading from session
  useEffect(() => {
    // Don't save if we're currently loading from session or if there are no questions
    if (loadingFromSessionRef.current || (!fortuQuestions.length && !aiQuestions.length)) {
      return;
    }

    if (questionSessions?.activeSessionId) {
      console.log('💾 Saving questions to session:', questionSessions.activeSessionId, {
        fortuCount: fortuQuestions.length,
        aiCount: aiQuestions.length
      });
      questionSessions.updateSession(questionSessions.activeSessionId, {
        fortuQuestions,
        aiQuestions,
        status: 'matches_found'
      });
    }
  }, [fortuQuestions, aiQuestions, questionSessions?.activeSessionId, questionSessions?.updateSession]);

  return null; // This is a logic-only component
};
