
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, Sparkles, Database, Bot } from 'lucide-react';
import { useQuestionGeneration } from '@/hooks/useQuestionGeneration';
import { QuestionSection } from './QuestionSection';
import { MainEmptyState } from './MainEmptyState';
import { QuestionSummaryDialog } from './QuestionSummaryDialog';

interface FortuQuestionsCanvasProps {
  payload?: Record<string, any>;
}

export const FortuQuestionsCanvas: React.FC<FortuQuestionsCanvasProps> = ({ payload }) => {
  const {
    fortuQuestions,
    aiQuestions,
    isLoadingFortu,
    isLoadingAI,
    error,
    generateAllQuestions,
    setError,
    // Summary functionality
    selectedQuestion,
    questionSummary,
    isLoadingSummary,
    isSummaryDialogOpen,
    generateQuestionSummary,
    closeSummaryDialog
  } = useQuestionGeneration();

  const refinedChallenge = payload?.refinedChallenge;
  const isSearchReady = payload?.searchReady;

  // Auto-generate when search is ready
  useEffect(() => {
    if (isSearchReady && refinedChallenge && fortuQuestions.length === 0 && aiQuestions.length === 0) {
      generateAllQuestions(refinedChallenge);
    }
  }, [isSearchReady, refinedChallenge]);

  const hasQuestions = fortuQuestions.length > 0 || aiQuestions.length > 0;
  const isLoading = isLoadingFortu || isLoadingAI;

  const handleGenerateQuestions = () => {
    if (refinedChallenge) {
      generateAllQuestions(refinedChallenge);
    }
  };

  return (
    <>
      <ScrollArea className="h-full w-full">
        <div className="p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3] min-h-full">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#003079] mb-2">Question Search</h1>
              <p className="text-[#1D253A] mb-4">
                Explore relevant questions and insights from our database of business challenges.
              </p>
              {refinedChallenge && (
                <div className="bg-white/50 p-4 rounded-lg border border-[#6EFFC6]/30">
                  <h3 className="font-semibold text-[#003079] mb-2">Your Challenge:</h3>
                  <p className="text-[#1D253A]">{refinedChallenge}</p>
                </div>
              )}
            </div>

            {/* Generate Button - only show if not auto-triggered */}
            {!isSearchReady && (
              <div className="mb-6">
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={isLoading || !refinedChallenge}
                  className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
                {hasQuestions && (
                  <Button
                    onClick={handleGenerateQuestions}
                    disabled={isLoading}
                    variant="outline"
                    className="ml-2 border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

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
              onQuestionClick={generateQuestionSummary}
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
              onQuestionClick={generateQuestionSummary}
            />

            {/* Empty State - only show if no questions and not loading */}
            {!hasQuestions && !isLoading && !error && <MainEmptyState />}

            {/* Refresh button when questions are loaded */}
            {hasQuestions && isSearchReady && (
              <div className="text-center">
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={isLoading}
                  variant="outline"
                  className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh All Questions
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

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
