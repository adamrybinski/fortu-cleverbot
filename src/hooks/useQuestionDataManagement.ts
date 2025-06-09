
import { useState, useCallback } from 'react';
import { Question } from '@/components/canvas/modules/types';

export const useQuestionDataManagement = () => {
  const [fortuQuestions, setFortuQuestions] = useState<Question[]>([]);
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);

  const setFortuQuestionsData = useCallback((questions: Question[]) => {
    setFortuQuestions(questions);
  }, []);

  const setAiQuestionsData = useCallback((questions: Question[]) => {
    setAiQuestions(questions);
  }, []);

  const clearQuestions = useCallback(() => {
    console.log('Clearing all questions');
    setFortuQuestions([]);
    setAiQuestions([]);
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

  return {
    fortuQuestions,
    aiQuestions,
    setFortuQuestions,
    setAiQuestions,
    setFortuQuestionsData,
    setAiQuestionsData,
    clearQuestions,
    loadQuestionsFromSession
  };
};
