
import React from 'react';
import { CanvasTrigger } from './CanvasContainer';
import { BlankCanvas } from './modules/BlankCanvas';
import { FortuQuestionsCanvas } from './modules/FortuQuestionsCanvas';
import { Question, ChallengeHistoryHook } from './modules/types';

interface CanvasModuleProps {
  trigger: CanvasTrigger;
  onSendQuestionsToChat?: (questions: Question[], action?: 'refine' | 'instance' | 'both') => void;
  challengeHistory?: ChallengeHistoryHook;
}

export const CanvasModule: React.FC<CanvasModuleProps> = ({ 
  trigger, 
  onSendQuestionsToChat,
  challengeHistory
}) => {
  console.log('Canvas triggered with:', trigger);

  switch (trigger.type) {
    case 'fortuQuestions':
      return (
        <FortuQuestionsCanvas 
          payload={trigger.payload} 
          onSendQuestionsToChat={onSendQuestionsToChat}
          challengeHistory={challengeHistory}
        />
      );
    
    case 'challengeMapping':
      return <BlankCanvas payload={trigger.payload} />; // Use BlankCanvas for now, could be specialized later
    
    case 'blank':
    case 'canvas':
    default:
      return <BlankCanvas payload={trigger.payload} />;
  }
};
