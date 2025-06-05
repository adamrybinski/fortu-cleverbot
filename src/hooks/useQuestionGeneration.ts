
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/components/canvas/modules/types';
import { useQuestionExpansion } from './useQuestionExpansion';
import { useQuestionSelection } from './useQuestionSelection';

export const useQuestionGeneration = () => {
  const [fortuQuestions, setFortuQuestions] = useState<Question[]>([]);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [isLoadingFortu, setIsLoadingFortu] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    expandedQuestions,
    questionSummaries,
    loadingSummaries,
    toggleQuestionExpansion,
    generateQuestionSummary,
    toggleExpandAllQuestions,
    clearExpansionData
  } = useQuestionExpansion();

  const {
    handleQuestionSelection,
    getSelectedQuestions,
    clearSelections
  } = useQuestionSelection({
    fortuQuestions,
    aiQuestions,
    setFortuQuestions,
    setAiQuestions
  });

  const generateFortuQuestions = useCallback(async (challenge: string) => {
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
          
          return {
            id: `fortu-${Date.now()}-${index}`,
            question: questionText,
            source: 'fortu' as const,
            selected: false
          };
        });
        
        console.log('Generated fortu questions:', questionsWithIds);
        setFortuQuestions(questionsWithIds);
      } else {
        console.warn('No questions received from fortu API');
      }
    } catch (error) {
      console.error('Error generating fortu questions:', error);
      setError('Failed to generate fortu.ai questions. Please try again.');
    } finally {
      setIsLoadingFortu(false);
    }
  }, []);

  const generateAIQuestions = useCallback(async (challenge: string) => {
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
        const questionsWithIds = data.questions.map((q: string, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          question: q,
          source: 'openai' as const,
          selected: false
        }));
        
        console.log('Generated AI questions:', questionsWithIds);
        setAiQuestions(questionsWithIds);
      } else {
        console.warn('No questions received from AI API');
      }
    } catch (error) {
      console.error('Error generating AI questions:', error);
      setError('Failed to generate AI questions. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  }, []);

  const generateAllQuestions = useCallback(async (challenge: string) => {
    console.log('Starting generation of all questions for challenge:', challenge);
    
    // Generate both types of questions in parallel
    await Promise.all([
      generateFortuQuestions(challenge),
      generateAIQuestions(challenge)
    ]);
    
    console.log('Completed generation of all questions');
  }, [generateFortuQuestions, generateAIQuestions]);

  const clearQuestions = useCallback(() => {
    console.log('Clearing all questions and related data');
    setFortuQuestions([]);
    setAiQuestions([]);
    setError(null);
    clearExpansionData();
    clearSelections();
  }, [clearExpansionData, clearSelections]);

  const loadQuestionsFromSession = useCallback((
    sessionFortuQuestions: Question[],
    sessionAiQuestions: Question[],
    selectedQuestions: Question[] = []
  ) => {
    console.log('Loading questions from session:', {
      fortu: sessionFortuQuestions.length,
      ai: sessionAiQuestions.length,
      selected: selectedQuestions.length
    });
    
    // Clear existing questions first
    clearQuestions();
    
    // Restore the selected state for questions
    const fortuWithSelection = sessionFortuQuestions.map(q => ({
      ...q,
      selected: selectedQuestions.some(sel => sel.id === q.id)
    }));
    
    const aiWithSelection = sessionAiQuestions.map(q => ({
      ...q,
      selected: selectedQuestions.some(sel => sel.id === q.id)
    }));
    
    setFortuQuestions(fortuWithSelection);
    setAiQuestions(aiWithSelection);
  }, [clearQuestions]);

  const toggleExpandAllFortuQuestions = useCallback(() => {
    toggleExpandAllQuestions(fortuQuestions);
  }, [fortuQuestions, toggleExpandAllQuestions]);

  const toggleExpandAllAIQuestions = useCallback(() => {
    toggleExpandAllQuestions(aiQuestions);
  }, [aiQuestions, toggleExpandAllQuestions]);

  return {
    fortuQuestions,
    aiQuestions,
    isLoadingFortu,
    isLoadingAI,
    error,
    generateAllQuestions,
    setError,
    handleQuestionSelection,
    getSelectedQuestions,
    clearSelections,
    clearQuestions,
    expandedQuestions,
    questionSummaries,
    loadingSummaries,
    toggleQuestionExpansion,
    generateQuestionSummary,
    loadQuestionsFromSession,
    toggleExpandAllFortuQuestions,
    toggleExpandAllAIQuestions
  };
};
