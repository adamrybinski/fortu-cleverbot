
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/components/canvas/modules/types';

export const useQuestionAPIGeneration = () => {
  const [isLoadingFortu, setIsLoadingFortu] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFortuQuestions = useCallback(async (challenge: string): Promise<Question[]> => {
    console.log('Starting fortu questions generation for:', challenge);
    setIsLoadingFortu(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-fortu-questions', {
        body: { refinedChallenge: challenge }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data && data.questions) {
        // Handle both string arrays and object arrays from the API
        const questionsWithIds = data.questions.map((q: any, index: number) => {
          // If q is an object with a question property, extract it; otherwise treat as string
          const questionText = typeof q === 'object' && q.question ? q.question : q;
          const status = typeof q === 'object' && q.status ? q.status : 'Discovery';
          
          return {
            id: `fortu-${Date.now()}-${index}`,
            question: questionText,
            source: 'fortu' as const,
            selected: false,
            status: status
          };
        });
        
        console.log('Generated fortu questions:', questionsWithIds);
        return questionsWithIds;
      } else {
        console.warn('No questions received from fortu API');
        return [];
      }
    } catch (error) {
      console.error('Error generating fortu questions:', error);
      setError('Failed to generate fortu.ai questions. Please try again.');
      return [];
    } finally {
      setIsLoadingFortu(false);
    }
  }, []);

  const generateAIQuestions = useCallback(async (challenge: string): Promise<Question[]> => {
    console.log('Starting AI questions generation for:', challenge);
    setIsLoadingAI(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-questions', {
        body: { refinedChallenge: challenge }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data && data.questions) {
        const questionsWithIds = data.questions.map((q: any, index: number) => {
          // Handle both old string format and new object format
          const questionText = typeof q === 'object' ? q.question : q;
          
          return {
            id: `ai-${Date.now()}-${index}`,
            question: questionText,
            source: 'openai' as const,
            selected: false,
            status: 'AI' as const
          };
        });
        
        console.log('Generated AI questions:', questionsWithIds);
        return questionsWithIds;
      } else {
        console.warn('No questions received from AI API');
        return [];
      }
    } catch (error) {
      console.error('Error generating AI questions:', error);
      setError('Failed to generate AI questions. Please try again.');
      return [];
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

  return {
    isLoadingFortu,
    isLoadingAI,
    error,
    setError,
    generateFortuQuestions,
    generateAIQuestions
  };
};
