
import { useCallback } from 'react';
import { Question } from '@/components/canvas/modules/types';

interface UseQuestionSelectionProps {
  fortuQuestions: Question[];
  aiQuestions: Question[];
  setFortuQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setAiQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

export const useQuestionSelection = ({
  fortuQuestions,
  aiQuestions,
  setFortuQuestions,
  setAiQuestions
}: UseQuestionSelectionProps) => {
  
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

  return {
    handleQuestionSelection,
    getSelectedQuestions,
    clearSelections
  };
};
