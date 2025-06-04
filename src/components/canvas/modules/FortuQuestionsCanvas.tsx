import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, Sparkles, Database, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FortuQuestionsCanvasProps {
  payload?: Record<string, any>;
}

interface Question {
  id: string | number;
  question: string;
  relevance?: number;
  context?: string;
  organisations?: number;
  status?: 'Discovery' | 'Explore' | 'Journey' | 'Equip' | 'AI';
  insights?: string;
  source: 'fortu' | 'openai';
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
    case 'AI':
      return 'bg-[#753BBD]/10 text-[#753BBD] border-[#753BBD]/20';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const FortuQuestionsCanvas: React.FC<FortuQuestionsCanvasProps> = ({ payload }) => {
  const [fortuQuestions, setFortuQuestions] = useState<Question[]>([]);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [isLoadingFortu, setIsLoadingFortu] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refinedChallenge = payload?.refinedChallenge;
  const isSearchReady = payload?.searchReady;

  const generateFortuQuestions = async () => {
    if (!refinedChallenge) return [];

    setIsLoadingFortu(true);
    try {
      const { data: fortuData, error: fortuError } = await supabase.functions.invoke('generate-fortu-questions', {
        body: { refinedChallenge }
      });

      if (fortuError) throw fortuError;

      const questions: Question[] = (fortuData.questions || []).slice(0, 5).map((q: any, i: number) => ({
        ...q,
        id: `fortu-${i}`,
        source: 'fortu'
      }));

      setFortuQuestions(questions);
      return questions;
    } catch (err) {
      console.error('Fortu question generation error:', err);
      throw err;
    } finally {
      setIsLoadingFortu(false);
    }
  };

  const generateAIQuestions = async (relatedQuestions: string[] = []) => {
    if (!refinedChallenge) return [];

    setIsLoadingAI(true);
    try {
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-ai-questions', {
        body: {
          refinedChallenge,
          relatedQuestions
        }
      });

      if (aiError) throw aiError;

      const questions: Question[] = (aiData.questions || []).map((q: string, i: number) => ({
        id: `ai-${i}`,
        question: q,
        source: 'openai',
        status: 'AI'
      }));

      setAiQuestions(questions);
      return questions;
    } catch (err) {
      console.error('AI question generation error:', err);
      throw err;
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generateAllQuestions = async () => {
    if (!refinedChallenge) return;

    setError(null);

    try {
      // Step 1: Generate fortu questions
      const fortuQs = await generateFortuQuestions();
      
      // Step 2: Generate AI questions based on fortu questions
      const relatedQuestionsText = fortuQs.map(q => q.question);
      await generateAIQuestions(relatedQuestionsText);

    } catch (err) {
      console.error('Question generation error:', err);
      setError('Something went wrong while generating questions. Please try again.');
    }
  };

  // Auto-generate when search is ready
  useEffect(() => {
    if (isSearchReady && refinedChallenge && fortuQuestions.length === 0 && aiQuestions.length === 0) {
      generateAllQuestions();
    }
  }, [isSearchReady, refinedChallenge]);

  const hasQuestions = fortuQuestions.length > 0 || aiQuestions.length > 0;
  const isLoading = isLoadingFortu || isLoadingAI;

  return (
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
                onClick={generateAllQuestions}
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
                  onClick={generateAllQuestions}
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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-[#003079]" />
              <h2 className="text-xl font-semibold text-[#003079]">
                Matched Questions from fortu.ai
              </h2>
              {isLoadingFortu && (
                <Loader2 className="w-4 h-4 animate-spin text-[#753BBD]" />
              )}
            </div>
            
            {fortuQuestions.length > 0 ? (
              <div className="space-y-4">
                {fortuQuestions.map((question) => (
                  <div key={question.id} className="bg-white/70 p-4 rounded-lg border border-[#6EFFC6]/30 hover:bg-white/90 transition-colors">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-[#003079] flex-1 mr-4">
                        {question.question}
                      </h3>
                      {question.status && (
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(question.status)}
                        >
                          {question.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !isLoadingFortu && (
              <div className="text-center py-8 text-[#1D253A]/60">
                <Database className="w-12 h-12 mx-auto mb-2 text-[#6EFFC6]" />
                <p>No fortu.ai questions generated yet</p>
              </div>
            )}
          </div>

          {/* Section 2: Suggested Questions from CleverBot */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="w-5 h-5 text-[#753BBD]" />
              <h2 className="text-xl font-semibold text-[#003079]">
                Suggested Questions from CleverBot
              </h2>
              {isLoadingAI && (
                <Loader2 className="w-4 h-4 animate-spin text-[#753BBD]" />
              )}
            </div>
            
            {aiQuestions.length > 0 ? (
              <div className="space-y-4">
                {aiQuestions.map((question) => (
                  <div key={question.id} className="bg-white/70 p-4 rounded-lg border border-[#753BBD]/20 hover:bg-white/90 transition-colors">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-[#003079] flex-1 mr-4">
                        {question.question}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor('AI')}
                      >
                        AI
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isLoadingAI && (
              <div className="text-center py-8 text-[#1D253A]/60">
                <Bot className="w-12 h-12 mx-auto mb-2 text-[#753BBD]" />
                <p>No AI suggestions generated yet</p>
              </div>
            )}
          </div>

          {/* Empty State - only show if no questions and not loading */}
          {!hasQuestions && !isLoading && !error && (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-[#6EFFC6] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#003079] mb-2">
                Ready to explore questions?
              </h3>
              <p className="text-[#1D253A]/70">
                Click "Generate Questions" to discover relevant insights for your challenge.
              </p>
            </div>
          )}

          {/* Refresh button when questions are loaded */}
          {hasQuestions && isSearchReady && (
            <div className="text-center">
              <Button
                onClick={generateAllQuestions}
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
  );
};
