
import React from 'react';
import { Database, Bot } from 'lucide-react';
import { QuestionSection } from '../QuestionSection';
import { MainEmptyState } from '../MainEmptyState';
import { FortuQuestionsHeader } from '../FortuQuestionsHeader';
import { ErrorDisplay } from '../ErrorDisplay';
import { Question } from '../types';

interface QuestionCanvasContentProps {
  // Header props
  refinedChallenge?: string;
  isSearchReady?: boolean;
  isLoading: boolean;
  hasQuestions: boolean;
  showSelection: boolean;
  onGenerateQuestions: () => void;
  onToggleSelection: () => void;
  
  // Error
  error: string | null;
  
  // Questions
  fortuQuestions: Question[];
  aiQuestions: Question[];
  isLoadingFortu: boolean;
  isLoadingAI: boolean;
  
  // Question interactions
  onSelectionChange?: (questionId: string | number) => void;
  expandedQuestions: Set<string | number>;
  questionSummaries: Record<string | number, string>;
  loadingSummaries: Set<string | number>;
  onToggleExpansion: (questionId: string | number) => void;
  onGenerateSummary: (question: Question) => Promise<void>;
  onToggleExpandAllFortu: () => void;
  onToggleExpandAllAI: () => void;
}

export const QuestionCanvasContent: React.FC<QuestionCanvasContentProps> = ({
  refinedChallenge,
  isSearchReady,
  isLoading,
  hasQuestions,
  showSelection,
  onGenerateQuestions,
  onToggleSelection,
  error,
  fortuQuestions,
  aiQuestions,
  isLoadingFortu,
  isLoadingAI,
  onSelectionChange,
  expandedQuestions,
  questionSummaries,
  loadingSummaries,
  onToggleExpansion,
  onGenerateSummary,
  onToggleExpandAllFortu,
  onToggleExpandAllAI
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <FortuQuestionsHeader
        refinedChallenge={refinedChallenge}
        isSearchReady={isSearchReady}
        isLoading={isLoading}
        hasQuestions={hasQuestions}
        onGenerateQuestions={onGenerateQuestions}
        showSelection={showSelection}
        onToggleSelection={onToggleSelection}
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
        onSelectionChange={showSelection ? onSelectionChange : undefined}
        showSelection={showSelection}
        expandedQuestions={expandedQuestions}
        questionSummaries={questionSummaries}
        loadingSummaries={loadingSummaries}
        onToggleExpansion={onToggleExpansion}
        onGenerateSummary={onGenerateSummary}
        onToggleExpandAll={onToggleExpandAllFortu}
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
        onSelectionChange={showSelection ? onSelectionChange : undefined}
        showSelection={showSelection}
        expandedQuestions={expandedQuestions}
        questionSummaries={questionSummaries}
        loadingSummaries={loadingSummaries}
        onToggleExpansion={onToggleExpansion}
        onGenerateSummary={onGenerateSummary}
        onToggleExpandAll={onToggleExpandAllAI}
      />

      {/* Empty State - only show if no questions and not loading */}
      {!hasQuestions && !isLoading && !error && <MainEmptyState />}
    </div>
  );
};
