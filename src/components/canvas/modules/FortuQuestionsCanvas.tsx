
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
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
      // Step 1: Fetch top 5 Fortu questions
      const { data: fortuData, error: fortuError } = await supabase.functions.invoke('generate-fortu-questions', {
        body: { refinedChallenge }
      });

      if (fortuError) throw fortuError;

      const fortuQuestions: Question[] = (fortuData.questions || []).slice(0, 5).map((q: any, i: number) => ({
        ...q,
        id: `fortu-${i}`,
        source: 'fortu'
      }));

      // Step 2: Generate 3 OpenAI questions based on Fortu + challenge
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-ai-questions', {
        body: {
          refinedChallenge,
          relatedQuestions: fortuQuestions.map(q => q.question)
        }
      });

      if (aiError) throw aiError;

      const aiQuestions: Question[] = (aiData.questions || []).map((q: string, i: number) => ({
        id: `ai-${i}`,
        question: q,
        source: 'openai',
        status: 'AI'
      }));

      // Merge and update
      setQuestions([...fortuQuestions, ...aiQuestions]);

    } catch (err) {
      console.error('Question generation error:', err);
      setError('Something went wrong while generating questions. Please try again.');
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#003079] mb-2">fortu.ai Question Search</h1>
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

        {/* Generate Button */}
        <div className="mb-6">
          <Button
            onClick={generateQuestions}
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
          {questions.length > 0 && (
            <Button
              onClick={generateQuestions}
              disabled={isLoading}
              variant="outline"
              className="ml-2 border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Questions Display */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#003079] mb-4">
              Related Questions ({questions.length})
            </h2>
            {questions.map((question) => (
              <div key={question.id} className="bg-white/70 p-4 rounded-lg border border-[#6EFFC6]/30 hover:bg-white/90 transition-colors">
                <div className="flex items-start justify-between mb-3">
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
                
                <div className="space-y-2">
                  {question.context && (
                    <p className="text-sm text-[#1D253A]/70">
                      <span className="font-medium">Context:</span> {question.context}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-[#1D253A]/60">
                    {question.relevance && (
                      <span>Relevance: {question.relevance}%</span>
                    )}
                    {question.organisations && (
                      <span>{question.organisations} organisations</span>
                    )}
                    <span className="capitalize">{question.source}</span>
                  </div>
                  
                  {question.insights && (
                    <p className="text-sm text-[#753BBD] font-medium">
                      {question.insights}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && questions.length === 0 && !error && (
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
      </div>
    </div>
  );
};
