
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FortuQuestionsCanvasProps {
  payload?: Record<string, any>;
}

interface Question {
  id: number;
  question: string;
  relevance: number;
  context: string;
  organisations: number;
  status: 'Discovery' | 'Explore' | 'Journey' | 'Equip';
  insights: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Discovery':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Explore':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Journey':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Equip':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const FortuQuestionsCanvas: React.FC<FortuQuestionsCanvasProps> = ({ payload }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refinedChallenge = payload?.refinedChallenge;
  const isSearchReady = payload?.searchReady;

  const generateQuestions = async () => {
    if (!refinedChallenge) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-fortu-questions', {
        body: { refinedChallenge }
      });

      if (error) throw error;

      setQuestions(data.questions);
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Failed to generate questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSearchReady && refinedChallenge && questions.length === 0) {
      generateQuestions();
    }
  }, [isSearchReady, refinedChallenge]);

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3]">
      <div className="w-full h-full bg-white rounded-lg border border-[#6EFFC6]/30 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-[#6EFFC6]/20 bg-gradient-to-r from-[#F1EDFF]/50 to-[#EEFFF3]/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#753BBD]/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-[#753BBD]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#003079]">fortu.ai Question Search</h3>
              <p className="text-[#1D253A]/70 text-sm">Discover proven approaches to your business challenge</p>
            </div>
          </div>

          {refinedChallenge && (
            <div className="bg-white/80 rounded-lg p-4">
              <h4 className="font-medium text-[#003079] mb-2">Your Refined Challenge:</h4>
              <p className="text-[#1D253A]/80 text-sm italic">"{refinedChallenge}"</p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {!isSearchReady ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6EFFC6]/20 flex items-center justify-center">
                <Search className="w-8 h-8 text-[#6EFFC6]" />
              </div>
              <h4 className="font-medium text-[#003079] mb-2">Search Ready</h4>
              <p className="text-[#1D253A]/70 text-sm mb-4">
                Complete your challenge refinement in the chat to unlock relevant fortu questions.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-medium text-[#003079]">Matching Questions</h4>
                <Button
                  onClick={generateQuestions}
                  size="sm"
                  className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </div>
                  )}
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className="p-4 rounded-lg border border-[#6EFFC6]/30 hover:border-[#6EFFC6]/60 hover:bg-[#EEFFF3]/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant="outline"
                              className="text-xs bg-[#753BBD]/10 text-[#753BBD] border-[#753BBD]/20"
                            >
                              {question.relevance}% match
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs border ${getStatusColor(question.status)}`}
                            >
                              {question.status}
                            </Badge>
                            <span className="text-xs text-[#1D253A]/60">{question.context}</span>
                          </div>
                          <h5 className="font-medium text-[#003079] text-sm mb-1 leading-tight">
                            {question.question}
                          </h5>
                          <p className="text-xs text-[#1D253A]/70">{question.insights}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLoading && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#6EFFC6]/20 flex items-center justify-center">
                    <Search className="w-6 h-6 text-[#6EFFC6]" />
                  </div>
                  <p className="text-[#1D253A]/70 text-sm">
                    Click "Refresh" to generate questions for your challenge.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
