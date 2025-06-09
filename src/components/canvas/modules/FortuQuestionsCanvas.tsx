
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Question, ChallengeHistoryHook } from './types';
import { QuestionSession } from '@/hooks/useQuestionSessions';
import { useFortuQuestionsCanvas } from './hooks/useFortuQuestionsCanvas';
import { QuestionGenerationManager } from './components/QuestionGenerationManager';
import { QuestionCanvasContent } from './components/QuestionCanvasContent';

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
    onSetupFortuInstance: (questions: Question[]) => void;
    onAddAnotherChallenge: () => void;
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
  console.log('🎨 FortuQuestionsCanvas mounted with payload:', payload);
  
  const {
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
  } = useFortuQuestionsCanvas({ payload, questionSessions });

  // Expose selection state to parent
  useEffect(() => {
    if (onSelectionStateChange) {
      onSelectionStateChange({
        showSelection,
        selectedQuestions,
        hasQuestions,
        onSetupFortuInstance: handleSetupFortuInstance,
        onAddAnotherChallenge: handleAddAnotherChallenge
      });
    }
  }, [showSelection, selectedQuestions, hasQuestions, onSelectionStateChange]);

  const handleGenerateQuestions = () => {
    console.log('🔄 Manual generation triggered with challenge:', refinedChallenge);
    if (refinedChallenge) {
      hasTriggeredGenerationRef.current = true;
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

  const handleSetupFortuInstance = (questions: Question[]) => {
    const activeSession = questionSessions?.getActiveSession();
    
    // Create payload for fortu instance setup
    const setupPayload = {
      refinedChallenge: activeSession?.refinedChallenge || payload?.refinedChallenge,
      fortuQuestions,
      aiQuestions,
      selectedQuestions: questions
    };

    // Trigger the fortu instance setup canvas
    if (onSendQuestionsToChat) {
      // Use a special trigger to indicate fortu instance setup
      console.log('🏗️ Setting up fortu.ai instance with payload:', setupPayload);
      
      // Create a custom trigger for the fortu instance setup
      const trigger = {
        type: 'fortuInstanceSetup',
        payload: setupPayload
      };
      
      // We need to communicate this trigger to the parent
      // For now, we'll use the existing onSendQuestionsToChat but modify it
      // This is a workaround - ideally we'd have a dedicated onTriggerCanvas prop
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({ type: 'TRIGGER_CANVAS', trigger }, '*');
      }
    }
  };

  const handleAddAnotherChallenge = () => {
    console.log('🔄 Starting another challenge flow');
    if (onSendQuestionsToChat) {
      onSendQuestionsToChat([], 'refine');
    }
  };

  return (
    <ScrollArea className="h-full w-full">
      <div className={`p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3] min-h-full ${
        showSelection && hasQuestions ? 'pb-32' : ''
      }`}>
        {/* Question Generation Manager - handles all generation logic */}
        <QuestionGenerationManager
          isSearchReady={isSearchReady}
          refinedChallenge={refinedChallenge}
          hasTriggeredGenerationRef={hasTriggeredGenerationRef}
          isLoadingFortu={isLoadingFortu}
          isLoadingAI={isLoadingAI}
          activeSession={activeSession}
          loadingFromSessionRef={loadingFromSessionRef}
          lastSessionIdRef={lastSessionIdRef}
          fortuQuestions={fortuQuestions}
          aiQuestions={aiQuestions}
          generateAllQuestions={generateAllQuestions}
          loadQuestionsFromSession={loadQuestionsFromSession}
          clearQuestions={clearQuestions}
          questionSessions={questionSessions}
        />

        {/* Question Canvas Content - handles all UI rendering */}
        <QuestionCanvasContent
          refinedChallenge={refinedChallenge}
          isSearchReady={isSearchReady}
          isLoading={isLoading}
          hasQuestions={hasQuestions}
          showSelection={showSelection}
          onGenerateQuestions={handleGenerateQuestions}
          onToggleSelection={handleToggleSelection}
          error={error}
          fortuQuestions={fortuQuestions}
          aiQuestions={aiQuestions}
          isLoadingFortu={isLoadingFortu}
          isLoadingAI={isLoadingAI}
          onSelectionChange={showSelection ? handleQuestionSelection : undefined}
          expandedQuestions={expandedQuestions}
          questionSummaries={questionSummaries}
          loadingSummaries={loadingSummaries}
          onToggleExpansion={toggleQuestionExpansion}
          onGenerateSummary={generateQuestionSummary}
          onToggleExpandAllFortu={toggleExpandAllFortuQuestions}
          onToggleExpandAllAI={toggleExpandAllAIQuestions}
        />
      </div>
    </ScrollArea>
  );
};
