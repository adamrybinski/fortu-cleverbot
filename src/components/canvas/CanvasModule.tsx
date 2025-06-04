
import React from 'react';
import { CanvasTrigger } from './CanvasContainer';
import { BlankCanvas } from './modules/BlankCanvas';
import { FortuQuestionsCanvas } from './modules/FortuQuestionsCanvas';

interface Question {
  id: string | number;
  question: string;
  source: 'fortu' | 'openai';
  selected?: boolean;
}

interface CanvasModuleProps {
  trigger: CanvasTrigger;
  onSendQuestionsToChat?: (questions: Question[]) => void;
}

export const CanvasModule: React.FC<CanvasModuleProps> = ({ trigger, onSendQuestionsToChat }) => {
  console.log('Canvas triggered with:', trigger);

  switch (trigger.type) {
    case 'fortuQuestions':
      return <FortuQuestionsCanvas payload={trigger.payload} onSendQuestionsToChat={onSendQuestionsToChat} />;
    
    case 'challengeMapping':
      return <BlankCanvas payload={trigger.payload} />; // Use BlankCanvas for now, could be specialized later
    
    case 'blank':
    case 'canvas':
    default:
      return <BlankCanvas payload={trigger.payload} />;
  }
};
