
import React from 'react';
import { CanvasTrigger } from './CanvasContainer';
import { BlankCanvas } from './modules/BlankCanvas';
import { FortuQuestionsCanvas } from './modules/FortuQuestionsCanvas';

interface CanvasModuleProps {
  trigger: CanvasTrigger;
}

export const CanvasModule: React.FC<CanvasModuleProps> = ({ trigger }) => {
  console.log('Canvas triggered with:', trigger);

  switch (trigger.type) {
    case 'fortuQuestions':
      return <FortuQuestionsCanvas payload={trigger.payload} />;
    
    case 'blank':
    case 'canvas':
    default:
      return <BlankCanvas payload={trigger.payload} />;
  }
};
