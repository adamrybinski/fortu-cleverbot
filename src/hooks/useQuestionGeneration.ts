import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/components/canvas/modules/types';

export const useQuestionGeneration = () => {
  const [fortuQuestions, setFortuQuestions] = useState<Question[]>([]);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [isLoadingFortu, setIsLoadingFortu] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelection, setShowSelection] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionSummary, setQuestionSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  const generateFortuQuestions = async (challenge: string) => {
    setIsLoadingFortu(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-fortu-questions', {
        body: { refinedChallenge: challenge }
      });

      if (error) throw error;

      if (data && data.questions) {
        const questionsWithIds = data.questions.map((q: string, index: number) => ({
          id: `fortu-${Date.now()}-${index}`,
          question: q,
          source: 'fortu' as const,
          selected: false
        }));
        
        setFortuQuestions(questionsWithIds);
        console.log('Generated fortu questions:', questionsWithIds);
      }
    } catch (error) {
      console.error('Error generating fortu questions:', error);
      setError('Failed to generate fortu.ai questions. Please try again.');
    } finally {
      setIsLoadingFortu(false);
    }
  };

  const generateAIQuestions = async (challenge: string) => {
    setIsLoadingAI(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-questions', {
        body: { refinedChallenge: challenge }
      });

      if (error) throw error;

      if (data && data.questions) {
        const questionsWithIds = data.questions.map((q: string, index: number) => ({
          id: `ai-${Date.now()}-${index}`,
          question: q,
          source: 'openai' as const,
          selected: false
        }));
        
        setAiQuestions(questionsWithIds);
        console.log('Generated AI questions:', questionsWithIds);
      }
    } catch (error) {
      console.error('Error generating AI questions:', error);
      setError('Failed to generate AI questions. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generateAllQuestions = useCallback(async (challenge: string) => {
    console.log('Generating all questions for challenge:', challenge);
    await Promise.all([
      generateFortuQuestions(challenge),
      generateAIQuestions(challenge)
    ]);
  }, []);

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
    
    // If there are selected questions, enable selection mode
    if (selectedQuestions.length > 0) {
      setShowSelection(true);
    }
  }, []);

  const toggleSelectionMode = () => {
    setShowSelection(!showSelection);
    if (showSelection) {
      // Clear all selections when exiting selection mode
      clearSelections();
    }
  };

  const handleQuestionSelection = (questionId: string | number) => {
    const updateQuestions = (questions: Question[]) =>
      questions.map(q => 
        q.id === questionId ? { ...q, selected: !q.selected } : q
      );

    setFortuQuestions(prev => updateQuestions(prev));
    setAiQuestions(prev => updateQuestions(prev));
  };

  const getSelectedQuestions = () => {
    return [...fortuQuestions, ...aiQuestions].filter(q => q.selected);
  };

  const clearSelections = () => {
    const clearSelected = (questions: Question[]) =>
      questions.map(q => ({ ...q, selected: false }));
    
    setFortuQuestions(prev => clearSelected(prev));
    setAiQuestions(prev => clearSelected(prev));
  };

  const generateQuestionSummary = async (question: Question) => {
    setSelectedQuestion(question);
    setIsSummaryDialogOpen(true);
    setIsLoadingSummary(true);
    setQuestionSummary(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-question-summary', {
        body: { question: question.question }
      });

      if (error) throw error;

      if (data && data.summary) {
        setQuestionSummary(data.summary);
      }
    } catch (error) {
      console.error('Error generating question summary:', error);
      setQuestionSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const closeSummaryDialog = () => {
    setIsSummaryDialogOpen(false);
    setSelectedQuestion(null);
    setQuestionSummary(null);
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
    selectedQuestion,
    questionSummary,
    isLoadingSummary,
    isSummaryDialogOpen,
    generateQuestionSummary,
    closeSummaryDialog,
    loadQuestionsFromSession
  };
};
