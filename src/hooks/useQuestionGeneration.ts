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
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string | number>>(new Set());
  const [questionSummaries, setQuestionSummaries] = useState<Record<string | number, string>>({});
  const [loadingSummaries, setLoadingSummaries] = useState<Set<string | number>>(new Set());

  const generateFortuQuestions = async (challenge: string) => {
    setIsLoadingFortu(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-fortu-questions', {
        body: { refinedChallenge: challenge }
      });

      if (error) throw error;

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

  const clearQuestions = useCallback(() => {
    console.log('Clearing all questions');
    setFortuQuestions([]);
    setAiQuestions([]);
    setError(null);
    setShowSelection(false);
    setExpandedQuestions(new Set());
    setQuestionSummaries({});
    setLoadingSummaries(new Set());
    clearSelections();
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
    
    // If there are selected questions, enable selection mode
    if (selectedQuestions.length > 0) {
      setShowSelection(true);
    }
  }, [clearQuestions]);

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

  const toggleExpandAllFortuQuestions = useCallback(() => {
    const fortuIds = fortuQuestions.map(q => q.id);
    const hasExpandedQuestions = fortuIds.some(id => expandedQuestions.has(id));
    
    if (hasExpandedQuestions) {
      // Collapse all
      setExpandedQuestions(prev => {
        const newSet = new Set(prev);
        fortuIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      // Expand all and generate summaries
      setExpandedQuestions(prev => {
        const newSet = new Set(prev);
        fortuIds.forEach(id => newSet.add(id));
        return newSet;
      });
      
      // Auto-generate summaries for questions that don't have them
      fortuQuestions.forEach(question => {
        if (!questionSummaries[question.id] && !loadingSummaries.has(question.id)) {
          generateQuestionSummary(question);
        }
      });
    }
  }, [fortuQuestions, expandedQuestions, questionSummaries, loadingSummaries]);

  const toggleExpandAllAIQuestions = useCallback(() => {
    const aiIds = aiQuestions.map(q => q.id);
    const hasExpandedQuestions = aiIds.some(id => expandedQuestions.has(id));
    
    if (hasExpandedQuestions) {
      // Collapse all
      setExpandedQuestions(prev => {
        const newSet = new Set(prev);
        aiIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      // Expand all and generate summaries
      setExpandedQuestions(prev => {
        const newSet = new Set(prev);
        aiIds.forEach(id => newSet.add(id));
        return newSet;
      });
      
      // Auto-generate summaries for questions that don't have them
      aiQuestions.forEach(question => {
        if (!questionSummaries[question.id] && !loadingSummaries.has(question.id)) {
          generateQuestionSummary(question);
        }
      });
    }
  }, [aiQuestions, expandedQuestions, questionSummaries, loadingSummaries]);

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
