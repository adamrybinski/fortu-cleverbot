
import { useEffect, useRef } from 'react';
import { useQuestionGeneration } from '@/hooks/useQuestionGeneration';
import { Question, ChallengeHistoryHook } from '../types';
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

interface UseFortuQuestionsCanvasProps {
  payload?: Record<string, any>;
  questionSessions?: QuestionSessionsHook;
}

export const useFortuQuestionsCanvas = ({
  payload,
  questionSessions
}: UseFortuQuestionsCanvasProps) => {
  const loadingFromSessionRef = useRef(false);
  const lastSessionIdRef = useRef<string | null>(null);
  const hasTriggeredGenerationRef = useRef(false);
  
  const {
    fortuQuestions,
    aiQuestions,
    isLoadingFortu,
    isLoadingAI,
    error,
    generateAllQuestions,
    setError,
    handleQuestionSelection,
    getSelectedQuestions,
    clearSelections,
    clearQuestions,
    expandedQuestions,
    questionSummaries,
    loadingSummaries,
    toggleQuestionExpansion,
    generateQuestionSummary,
    loadQuestionsFromSession,
    toggleExpandAllFortuQuestions,
    toggleExpandAllAIQuestions
  } = useQuestionGeneration();

  const activeSession = questionSessions?.getActiveSession();
  const refinedChallenge = activeSession?.refinedChallenge || payload?.refinedChallenge;
  const isSearchReady = payload?.searchReady;
  const payloadSessionId = payload?.sessionId;

  const hasQuestions = fortuQuestions.length > 0 || aiQuestions.length > 0;
  const isLoading = isLoadingFortu || isLoadingAI;
  const selectedQuestions = getSelectedQuestions();

  return {
    // State
    fortuQuestions,
    aiQuestions,
    isLoadingFortu,
    isLoadingAI,
    error,
    hasQuestions,
    isLoading,
    selectedQuestions,
    expandedQuestions,
    questionSummaries,
    loadingSummaries,
    activeSession,
    refinedChallenge,
    isSearchReady,
    payloadSessionId,
    
    // Refs
    loadingFromSessionRef,
    lastSessionIdRef,
    hasTriggeredGenerationRef,
    
    // Actions
    generateAllQuestions,
    setError,
    handleQuestionSelection,
    getSelectedQuestions,
    clearSelections,
    clearQuestions,
    toggleQuestionExpansion,
    generateQuestionSummary,
    loadQuestionsFromSession,
    toggleExpandAllFortuQuestions,
    toggleExpandAllAIQuestions
  };
};
