
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/components/canvas/modules/types';

export const useQuestionExpansion = () => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string | number>>(new Set());
  const [questionSummaries, setQuestionSummaries] = useState<Record<string | number, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Set<string | number>>(new Set());

  const toggleQuestionExpansion = useCallback((questionId: string | number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const generateQuestionSummary = async (question: Question) => {
    if (loadingSummaries.has(question.id) || questionSummaries[question.id]) {
      return;
    }

    setLoadingSummaries(prev => new Set(prev).add(question.id));

    try {
      const { data, error } = await supabase.functions.invoke('generate-question-summary', {
        body: { question: question.question, source: question.source }
      });

      if (error) throw error;

      if (data && data.summary) {
        setQuestionSummaries(prev => ({
          ...prev,
          [question.id]: data.summary
        }));
      }
    } catch (error) {
      console.error('Error generating question summary:', error);
      setQuestionSummaries(prev => ({
        ...prev,
        [question.id]: 'Failed to generate summary. Please try again.'
      }));
    } finally {
      setLoadingSummaries(prev => {
        const newSet = new Set(prev);
        newSet.delete(question.id);
        return newSet;
      });
    }
  };

  const toggleExpandAllQuestions = useCallback((questions: Question[]) => {
    const questionIds = questions.map(q => q.id);
    const hasExpandedQuestions = questionIds.some(id => expandedQuestions.has(id));
    
    if (hasExpandedQuestions) {
      // Collapse all
      setExpandedQuestions(prev => {
        const newSet = new Set(prev);
        questionIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      // Expand all and generate summaries
      setExpandedQuestions(prev => {
        const newSet = new Set(prev);
        questionIds.forEach(id => newSet.add(id));
        return newSet;
      });
      
      // Auto-generate summaries for questions that don't have them
      questions.forEach(question => {
        if (!questionSummaries[question.id] && !loadingSummaries.has(question.id)) {
          generateQuestionSummary(question);
        }
      });
    }
  }, [expandedQuestions, questionSummaries, loadingSummaries]);

  const clearExpansionData = useCallback(() => {
    setExpandedQuestions(new Set());
    setQuestionSummaries({});
    setLoadingSummaries(new Set());
  }, []);

  return {
    expandedQuestions,
    questionSummaries,
    loadingSummaries,
    toggleQuestionExpansion,
    generateQuestionSummary,
    toggleExpandAllQuestions,
    clearExpansionData
  };
};
