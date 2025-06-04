
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';

interface FortuQuestionsHeaderProps {
  refinedChallenge?: string;
  isSearchReady?: boolean;
  isLoading: boolean;
  hasQuestions: boolean;
  onGenerateQuestions: () => void;
  showSelection: boolean;
}

export const FortuQuestionsHeader: React.FC<FortuQuestionsHeaderProps> = ({
  refinedChallenge,
  isSearchReady,
  isLoading,
  hasQuestions,
  onGenerateQuestions,
  showSelection
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[#003079] mb-2">Question Search</h1>
      <p className="text-[#1D253A] mb-4">
        Explore relevant questions and insights from our database of business challenges.
      </p>
      {refinedChallenge && (
        <div className="bg-white/50 p-4 rounded-lg border border-[#6EFFC6]/30 mb-4">
          <h3 className="font-semibold text-[#003079] mb-2">Your Challenge:</h3>
          <p className="text-[#1D253A]">{refinedChallenge}</p>
        </div>
      )}

      {/* Generate Button - only show if not auto-triggered */}
      {!isSearchReady && (
        <div className="mb-6">
          <Button
            onClick={onGenerateQuestions}
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
              onClick={onGenerateQuestions}
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

      {/* Refresh button when questions are loaded */}
      {hasQuestions && isSearchReady && !showSelection && (
        <div className="text-center mt-6">
          <Button
            onClick={onGenerateQuestions}
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
  );
};
