
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
  selected?: boolean;
}

export const useQuestionGeneration = () => {
  const [fortuQuestions, setFortuQuestions] = useState<Question[]>([]);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [isLoadingFortu, setIsLoadingFortu] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelection, setShowSelection] = useState(false);
  
  // Summary-related state
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionSummary, setQuestionSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  const generateFortuQuestions = async (refinedChallenge: string) => {
    if (!refinedChallenge) return [];

    console.log('generateFortuQuestions called with:', refinedChallenge);
    setIsLoadingFortu(true);
    try {
      console.log('Calling generate-fortu-questions edge function...');
      const { data: fortuData, error: fortuError } = await supabase.functions.invoke('generate-fortu-questions', {
        body: { refinedChallenge }
      });

      if (fortuError) {
        console.error('Fortu function error:', fortuError);
        throw fortuError;
      }

      console.log('Fortu function response:', fortuData);

      const questions: Question[] = (fortuData.questions || []).slice(0, 5).map((q: any, i: number) => ({
        ...q,
        id: `fortu-${i}`,
        source: 'fortu',
        selected: false
      }));

      console.log('Processed fortu questions:', questions);
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

    console.log('generateAIQuestions called with:', { refinedChallenge, relatedQuestions });
    setIsLoadingAI(true);
    try {
      console.log('Calling generate-ai-questions edge function...');
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-ai-questions', {
        body: {
          refinedChallenge,
          relatedQuestions
        }
      });

      if (aiError) {
        console.error('AI function error:', aiError);
        throw aiError;
      }

      console.log('AI function response:', aiData);

      const questions: Question[] = (aiData.questions || []).map((q: string, i: number) => ({
        id: `ai-${i}`,
        question: q,
        source: 'openai',
        status: 'AI',
        selected: false
      }));

      console.log('Processed AI questions:', questions);
      setAiQuestions(questions);
      return questions;
    } catch (err) {
      console.error('AI question generation error:', err);
      throw err;
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generateQuestionSummary = async (question: Question) => {
    setSelectedQuestion(question);
    setQuestionSummary(null);
    setIsLoadingSummary(true);
    setIsSummaryDialogOpen(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-question-summary', {
        body: {
          question: question.question,
          source: question.source
        }
      });

      if (error) throw error;

      setQuestionSummary(data.summary);
    } catch (err) {
      console.error('Summary generation error:', err);
      setQuestionSummary('Sorry, we could not generate a summary for this question at the moment.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const closeSummaryDialog = () => {
    setIsSummaryDialogOpen(false);
    setSelectedQuestion(null);
    setQuestionSummary(null);
  };

  const handleQuestionSelection = (questionId: string | number, selected: boolean) => {
    setFortuQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, selected } : q)
    );
    setAiQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, selected } : q)
    );
  };

  const getSelectedQuestions = () => {
    const selectedFortu = fortuQuestions.filter(q => q.selected);
    const selectedAI = aiQuestions.filter(q => q.selected);
    return [...selectedFortu, ...selectedAI];
  };

  const toggleSelectionMode = () => {
    setShowSelection(!showSelection);
  };

  const clearSelections = () => {
    setFortuQuestions(prev => prev.map(q => ({ ...q, selected: false })));
    setAiQuestions(prev => prev.map(q => ({ ...q, selected: false })));
  };

  const generateAllQuestions = async (refinedChallenge: string) => {
    if (!refinedChallenge) {
      console.warn('generateAllQuestions called without refinedChallenge');
      return;
    }

    console.log('generateAllQuestions called with:', refinedChallenge);
    setError(null);

    try {
      // Step 1: Generate fortu questions
      console.log('Step 1: Generating fortu questions...');
      const fortuQs = await generateFortuQuestions(refinedChallenge);
      
      // Step 2: Generate AI questions based on fortu questions
      console.log('Step 2: Generating AI questions...');
      const relatedQuestionsText = fortuQs.map(q => q.question);
      await generateAIQuestions(refinedChallenge, relatedQuestionsText);

      console.log('All questions generated successfully');
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
    setError,
    showSelection,
    toggleSelectionMode,
    handleQuestionSelection,
    getSelectedQuestions,
    clearSelections,
    // Summary-related exports
    selectedQuestion,
    questionSummary,
    isLoadingSummary,
    isSummaryDialogOpen,
    generateQuestionSummary,
    closeSummaryDialog
  };
};
