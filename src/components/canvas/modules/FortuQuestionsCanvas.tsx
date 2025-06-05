
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, Bot } from 'lucide-react';
import { useQuestionGeneration } from '@/hooks/useQuestionGeneration';
import { QuestionSection } from './QuestionSection';
import { MainEmptyState } from './MainEmptyState';
import { QuestionSummaryDialog } from './QuestionSummaryDialog';
import { QuestionSelectionToolbar } from './QuestionSelectionToolbar';
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
}

export const FortuQuestionsCanvas: React.FC<FortuQuestionsCanvasProps> = ({ 
  payload,
  onSendQuestionsToChat,
  challengeHistory,
  questionSessions
}) => {
  console.log('FortuQuestionsCanvas mounted with payload:', payload);
  
  const {
    fortuQuestions,
    aiQuestions,
    isLoadingFortu,
    isLoadingAI,
    error,
    generateAllQuestions,
    setError,
    showSelection,
    toggleSelectionMode,
    handleQuestionSelection,
    getSelectedQuestions,
    clearSelections,
    selectedQuestion,
    questionSummary,
    isLoadingSummary,
    isSummaryDialogOpen,
    generateQuestionSummary,
    closeSummaryDialog,
    loadQuestionsFromSession
  } = useQuestionGeneration();

  const activeSession = questionSessions?.getActiveSession();
  const refinedChallenge = activeSession?.refinedChallenge || payload?.refinedChallenge;
  const isSearchReady = payload?.searchReady;
  
  console.log('Active session:', activeSession);
  console.log('Extracted values:', {
    refinedChallenge,
    isSearchReady,
    fortuQuestionsCount: fortuQuestions.length,
    aiQuestionsCount: aiQuestions.length
  });

  // Load questions from active session when switching sessions
  useEffect(() => {
    if (activeSession && (activeSession.fortuQuestions.length > 0 || activeSession.aiQuestions.length > 0)) {
      console.log('Loading questions from active session:', activeSession.id);
      loadQuestionsFromSession(activeSession.fortuQuestions, activeSession.aiQuestions, activeSession.selectedQuestions);
    }
  }, [activeSession?.id, loadQuestionsFromSession]);

  // Auto-generate when search is ready for new sessions
  useEffect(() => {
    console.log('useEffect triggered with:', {
      isSearchReady,
      refinedChallenge,
      fortuQuestionsLength: fortuQuestions.length,
      aiQuestionsLength: aiQuestions.length,
      activeSessionId: activeSession?.id
    });
    
    if (isSearchReady && refinedChallenge && fortuQuestions.length === 0 && aiQuestions.length === 0) {
      console.log('Conditions met, calling generateAllQuestions with:', refinedChallenge);
      generateAllQuestions(refinedChallenge);
    }
  }, [isSearchReady, refinedChallenge, fortuQuestions.length, aiQuestions.length, generateAllQuestions, activeSession?.id]);

  // Update question session when questions are loaded
  useEffect(() => {
    if (questionSessions?.activeSessionId && (fortuQuestions.length > 0 || aiQuestions.length > 0)) {
      questionSessions.updateSession(questionSessions.activeSessionId, {
        fortuQuestions,
        aiQuestions,
        status: 'matches_found'
      });
    }
  }, [fortuQuestions, aiQuestions, questionSessions]);

  const hasQuestions = fortuQuestions.length > 0 || aiQuestions.length > 0;
  const isLoading = isLoadingFortu || isLoadingAI;
  const selectedQuestions = getSelectedQuestions();

  const handleGenerateQuestions = () => {
    console.log('Manual generation triggered with challenge:', refinedChallenge);
    if (refinedChallenge) {
      generateAllQuestions(refinedChallenge);
    }
  };

  const handleSendToChat = (questions: Question[], action: 'refine' | 'instance' | 'both') => {
    // Update question session with selections
    if (questionSessions?.activeSessionId) {
      questionSessions.updateSession(questionSessions.activeSessionId, {
        selectedQuestions: questions,
        status: 'refined'
      });
    }

    if (onSendQuestionsToChat) {
      onSendQuestionsToChat(questions, action);
    }
    toggleSelectionMode();
    clearSelections();
  };

  return (
    <>
      <ScrollArea className="h-full w-full">
        <div className="p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3] min-h-full">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <FortuQuestionsHeader
              refinedChallenge={refinedChallenge}
              isSearchReady={isSearchReady}
              isLoading={isLoading}
              hasQuestions={hasQuestions}
              onGenerateQuestions={handleGenerateQuestions}
              showSelection={showSelection}
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
              iconColor="text-[#003079]"
              emptyIconColor="text-[#6EFFC6]"
              onQuestionClick={showSelection ? undefined : generateQuestionSummary}
              onSelectionChange={showSelection ? handleQuestionSelection : undefined}
              showSelection={showSelection}
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
              onQuestionClick={showSelection ? undefined : generateQuestionSummary}
              onSelectionChange={showSelection ? handleQuestionSelection : undefined}
              showSelection={showSelection}
            />

            {/* Empty State - only show if no questions and not loading */}
            {!hasQuestions && !isLoading && !error && <MainEmptyState />}
          </div>
        </div>
      </ScrollArea>

      {/* Question Selection Toolbar */}
      {hasQuestions && (
        <QuestionSelectionToolbar
          showSelection={showSelection}
          selectedQuestions={selectedQuestions}
          onToggleSelection={toggleSelectionMode}
          onSendToChat={handleSendToChat}
          onClearSelections={clearSelections}
        />
      )}

      {/* Question Summary Dialog */}
      <QuestionSummaryDialog
        isOpen={isSummaryDialogOpen}
        onClose={closeSummaryDialog}
        question={selectedQuestion}
        summary={questionSummary}
        isLoading={isLoadingSummary}
      />
    </>
  );
};
