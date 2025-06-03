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
      <div classNam
