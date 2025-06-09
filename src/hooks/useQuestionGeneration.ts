
import { useCallback } from 'react';
import { useQuestionExpansion } from './useQuestionExpansion';
import { useQuestionSelection } from './useQuestionSelection';
import { useQuestionAPIGeneration } from './useQuestionAPIGeneration';
import { useQuestionDataManagement } from './useQuestionDataManagement';
import { Question } from '@/components/canvas/modules/types';

export const useQuestionGeneration = () => {
  const {
    fortuQuestions,
    aiQuestions,
    setFortuQuestions,
    setAiQuestions,
    setFortuQuestionsData,
    setAiQuestionsData,
    clearQuestions,
    loadQuestionsFromSession
  } = useQuestionDataManagement();

  const {
    isLoadingFortu,
    isLoadingAI,
    error,
    setError,
    generateFortuQuestions,
    generateAIQuestions
  } = useQuestionAPIGeneration();

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

  const generateAllQuestions = useCallback(async (challenge: string) => {
    console.log('Starting generation of all questions for challenge:', challenge);
    
    // Generate both types of questions in parallel
    const [fortuResults, aiResults] = await Promise.all([
      generateFortuQuestions(challenge),
      generateAIQuestions(challenge)
    ]);

    // Update state with results
    setFortuQuestionsData(fortuResults);
    setAiQuestionsData(aiResults);
    
    console.log('Completed generation of all questions');
  }, [generateFortuQuestions, generateAIQuestions, setFortuQuestionsData, setAiQuestionsData]);

  const clearAllData = useCallback(() => {
    console.log('Clearing all questions and related data');
    clearQuestions();
    clearExpansionData();
    clearSelections();
    setError(null);
  }, [clearQuestions, clearExpansionData, clearSelections, setError]);

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
    clearQuestions: clearAllData,
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
