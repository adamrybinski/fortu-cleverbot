
import { useEffect, useRef } from 'react';
import { Question } from '@/components/chat/types';

interface UseSelectedQuestionsProps {
  selectedQuestionsFromCanvas: Question[];
  selectedAction: 'refine' | 'instance' | 'both';
  onSendMessage: (message: string, isAutoMessage?: boolean) => void;
}

export const useSelectedQuestions = ({
  selectedQuestionsFromCanvas,
  selectedAction,
  onSendMessage
}: UseSelectedQuestionsProps) => {
  const lastProcessedRef = useRef<string>('');

  useEffect(() => {
    if (selectedQuestionsFromCanvas.length > 0) {
      // Create a unique key for this set of questions
      const questionsKey = selectedQuestionsFromCanvas.map(q => q.id).sort().join(',');
      
      // Prevent duplicate processing
      if (questionsKey === lastProcessedRef.current) {
        console.log('Skipping duplicate selected questions processing');
        return;
      }
      
      lastProcessedRef.current = questionsKey;
      
      const questionsList = selectedQuestionsFromCanvas.map(q => `• ${q.question}`).join('\n');
      
      let autoMessage = '';
      
      switch (selectedAction) {
        case 'refine':
          autoMessage = `I've selected these ${selectedQuestionsFromCanvas.length} questions from the canvas for challenge refinement:\n\n${questionsList}\n\nPlease provide a summary of these questions and refine my challenge based on these selections. I only want the refinement analysis, no additional question matches.`;
          break;
        case 'instance':
          autoMessage = `I've selected these ${selectedQuestionsFromCanvas.length} questions from the canvas to setup a new fortu.ai instance:\n\n${questionsList}\n\nPlease help me prepare these questions along with my original challenge for setting up a new fortu.ai instance.`;
          break;
        case 'both':
          autoMessage = `I've selected these ${selectedQuestionsFromCanvas.length} questions from the canvas and want both refinement and instance setup:\n\n${questionsList}\n\nPlease first refine my challenge based on these selections, then help me prepare everything for setting up a new fortu.ai instance.`;
          break;
      }
      
      console.log('Sending auto-message for selected questions:', questionsKey);
      onSendMessage(autoMessage, true);
    }
  }, [selectedQuestionsFromCanvas, selectedAction, onSendMessage]);

  // Reset the processed ref when questions are cleared
  useEffect(() => {
    if (selectedQuestionsFromCanvas.length === 0) {
      lastProcessedRef.current = '';
    }
  }, [selectedQuestionsFromCanvas.length]);
};
