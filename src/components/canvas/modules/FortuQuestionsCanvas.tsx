
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, Bot } from 'lucide-react';
import { useQuestionGeneration } from '@/hooks/useQuestionGeneration';
import { QuestionSection } from './QuestionSection';
import { MainEmptyState } from './MainEmptyState';
import { FortuQuestionsHeader } from './FortuQuestionsHeader';
import { ErrorDisplay } from './ErrorDisplay';
import { Question, ChallengeHistoryHook } from './types';
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

interface FortuQuestionsCanvasProps {
  payload?: Record<string, any>;
  onSendQuestionsToChat?: (questions: Question[], action?: 'refine' | 'instance' | 'both') => void;
  challengeHistory?: ChallengeHistoryHook;
  questionSessions?: QuestionSessionsHook;
  // Props to expose selection state to parent
  onSelectionStateChange?: (state: {
    showSelection: boolean;
    selectedQuestions: Question[];
    hasQuestions: boolean;
  }) => void;
  onSendToChat?: (questions: Question[]) => void;
  onToggleSelection?: () => void;
  onClearSelections?: () => void;
  // New prop to receive selection state from parent
  showSelection?: boolean;
}

export const FortuQuestionsCanvas: React.FC<FortuQuestionsCanvasProps> = ({ 
  payload,
  onSendQuestionsToChat,
  challengeHistory,
  questionSessions,
  onSelectionStateChange,
  onSendToChat,
  onToggleSelection,
  onClearSelections,
  showSelection = false
}) => {
  console.log('FortuQuestionsCanvas mounted with payload:', payload);
  
  // Add ref to track when we're loading from session to prevent infinite loops
  const loadingFromSessionRef = useRef(false);
  const lastSessionIdRef = useRef<string | null>(null);
  
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
  
  console.log('Active session:', activeSession);
  console.log('Extracted values:', {
    refinedChallenge,
    isSearchReady,
    fortuQuestionsCount: fortuQuestions.length,
    aiQuestionsCount: aiQuestions.length,
    activeSessionId: activeSession?.id
  });

  // Handle session switching - clear questions and load from new session
  useEffect(() => {
    if (activeSession && activeSession.id !== lastSessionIdRef.current) {
      console.log('Session changed to:', activeSession.id);
      lastSessionIdRef.current = activeSession.id;
      
      // Set loading flag to prevent save effect from running
      loadingFromSessionRef.current = true;
      
      // If session has questions, load them; otherwise clear questions
      if (activeSession.fortuQuestions.length > 0 || activeSession.aiQuestions.length > 0) {
        console.log('Loading existing questions from session:', activeSession.id);
        loadQuestionsFromSession(activeSession.fortuQuestions, activeSession.aiQuestions, activeSession.selectedQuestions);
      } else {
        console.log('Clearing questions for new/empty session:', activeSession.id);
        clearQuestions();
      }
      
      // Reset loading flag after a brief delay to allow state updates
      setTimeout(() => {
        loadingFromSessionRef.current = false;
      }, 100);
    }
  }, [activeSession?.id, loadQuestionsFromSession, clearQuestions]);

  // Auto-generate questions for new sessions with refined challenges but no questions
  useEffect(() => {
    // Don't run during session loading or if already loading
    if (loadingFromSessionRef.current || isLoadingFortu || isLoadingAI) {
      return;
    }

    const shouldGenerateQuestions = activeSession && 
      activeSession.refinedChallenge && 
      activeSession.fortuQuestions.length === 0 && 
      activeSession.aiQuestions.length === 0 &&
      fortuQuestions.length === 0 && 
      aiQuestions.length === 0;

    console.log('Auto-generation check:', {
      shouldGenerate: shouldGenerateQuestions,
      activeSessionId: activeSession?.id,
      refinedChallenge: activeSession?.refinedChallenge,
      sessionFortuCount: activeSession?.fortuQuestions.length,
      sessionAiCount: activeSession?.aiQuestions.length,
      localFortuCount: fortuQuestions.length,
      localAiCount: aiQuestions.length,
      isLoadingFromSession: loadingFromSessionRef.current
    });

    if (shouldGenerateQuestions) {
      console.log('Auto-generating questions for session:', activeSession.id, 'with challenge:', activeSession.refinedChallenge);
      generateAllQuestions(activeSession.refinedChallenge);
    }
  }, [activeSession?.id, activeSession?.refinedChallenge, fortuQuestions.length, aiQuestions.length, isLoadingFortu, isLoadingAI, generateAllQuestions]);

  // Save generated questions to active session - only when not loading from session
  useEffect(() => {
    // Don't save if we're currently loading from session or if there are no questions
    if (loadingFromSessionRef.current || (!fortuQuestions.length && !aiQuestions.length)) {
      return;
    }

    if (questionSessions?.activeSessionId) {
      console.log('Saving questions to session:', questionSessions.activeSessionId);
      questionSessions.updateSession(questionSessions.activeSessionId, {
        fortuQuestions,
        aiQuestions,
        status: 'matches_found'
      });
    }
  }, [fortuQuestions, aiQuestions, questionSessions?.activeSessionId, questionSessions?.updateSession]);

  const hasQuestions = fortuQuestions.length > 0 || aiQuestions.length > 0;
  const isLoading = isLoadingFortu || isLoadingAI;
  const selectedQuestions = getSelectedQuestions();

  // Expose selection state to parent
  useEffect(() => {
    if (onSelectionStateChange) {
      onSelectionStateChange({
        showSelection,
        selectedQuestions,
        hasQuestions
      });
    }
  }, [showSelection, selectedQuestions, hasQuestions, onSelectionStateChange]);

  const handleGenerateQuestions = () => {
    console.log('Manual generation triggered with challenge:', refinedChallenge);
    if (refinedChallenge) {
      generateAllQuestions(refinedChallenge);
    }
  };

  const handleSendToChat = (questions: Question[]) => {
    // Update question session with selections
    if (questionSessions?.activeSessionId) {
      questionSessions.updateSession(questionSessions.activeSessionId, {
        selectedQuestions: questions,
        status: 'refined'
      });
    }

    if (onSendQuestionsToChat) {
      // Default to 'refine' action for simplicity
      onSendQuestionsToChat(questions, 'refine');
    }
    
    // Use parent handlers if provided
    if (onToggleSelection) {
      onToggleSelection();
    }
    
    if (onClearSelections) {
      onClearSelections();
    } else {
      clearSelections();
    }
  };

  const handleToggleSelection = () => {
    if (onToggleSelection) {
      onToggleSelection();
    }
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className={`p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3] min-h-full ${
        showSelection && hasQuestions ? 'pb-32' : ''
      }`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <FortuQuestionsHeader
            refinedChallenge={refinedChallenge}
            isSearchReady={isSearchReady}
            isLoading={isLoading}
            hasQuestions={hasQuestions}
            onGenerateQuestions={handleGenerateQuestions}
            showSelection={showSelection}
            onToggleSelection={handleToggleSelection}
          />

          {/* Error Display */}
          <ErrorDisplay error={error} />

          {/* Section 1: Matched Questions from fortu.ai */}
          <QuestionSection
            title="Matched Questions from fortu.ai"
            icon={Database}
            questions={fortuQuestions}
            isLoading={isLoadingFortu}
            emptyMessage="No fortu.ai questions generated yet"
            borderColor="border-[#6EFFC6]/30"
            iconColor="text-[#753BBD]"
            emptyIconColor="text-[#6EFFC6]"
            onSelectionChange={showSelection ? handleQuestionSelection : undefined}
            showSelection={showSelection}
            expandedQuestions={expandedQuestions}
            questionSummaries={questionSummaries}
            loadingSummaries={loadingSummaries}
            onToggleExpansion={toggleQuestionExpansion}
            onGenerateSummary={generateQuestionSummary}
            onToggleExpandAll={toggleExpandAllFortuQuestions}
          />

          {/* Section 2: Suggested Questions from CleverBot */}
          <QuestionSection
            title="Suggested Questions from CleverBot"
            icon={Bot}
            questions={aiQuestions}
            isLoading={isLoadingAI}
            emptyMessage="No AI suggestions generated yet"
            borderColor="border-[#753BBD]/20"
            iconColor="text-[#753BBD]"
            emptyIconColor="text-[#753BBD]"
            onSelectionChange={showSelection ? handleQuestionSelection : undefined}
            showSelection={showSelection}
            expandedQuestions={expandedQuestions}
            questionSummaries={questionSummaries}
            loadingSummaries={loadingSummaries}
            onToggleExpansion={toggleQuestionExpansion}
            onGenerateSummary={generateQuestionSummary}
            onToggleExpandAll={toggleExpandAllAIQuestions}
          />

          {/* Empty State - only show if no questions and not loading */}
          {!hasQuestions && !isLoading && !error && <MainEmptyState />}
        </div>
      </div>
    </ScrollArea>
  );
};
