
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useQuestionGeneration = () => {
  const [fortuQuestions, setFortuQuestions] = useState<Question[]>([]);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [isLoadingFortu, setIsLoadingFortu] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFortuQuestions = async (refinedChallenge: string) => {
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

  const generateAIQuestions = async (refinedChallenge: string, relatedQuestions: string[] = []) => {
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

  const generateAllQuestions = async (refinedChallenge: string) => {
    if (!refinedChallenge) return;

    setError(null);

    try {
      // Step 1: Generate fortu questions
      const fortuQs = await generateFortuQuestions(refinedChallenge);
      
      // Step 2: Generate AI questions based on fortu questions
      const relatedQuestionsText = fortuQs.map(q => q.question);
      await generateAIQuestions(refinedChallenge, relatedQuestionsText);

    } catch (err) {
      console.error('Question generation error:', err);
      setError('Something went wrong while generating questions. Please try again.');
    }
  };

  return {
    fortuQuestions,
    aiQuestions,
    isLoadingFortu,
    isLoadingAI,
    error,
    generateAllQuestions,
    setError
  };
};
