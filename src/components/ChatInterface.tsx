
import React from 'react';
import { ChatUI } from './ChatUI';
import { CanvasTrigger } from './canvas/CanvasContainer';

interface Question {
  id: string | number;
  question: string;
  source: 'fortu' | 'openai';
  selected?: boolean;
}

interface ChatInterfaceProps {
  onOpenCanvas: (type?: string, payload?: Record<string, any>) => void;
  onTriggerCanvas: (trigger: CanvasTrigger) => void;
  isCanvasOpen: boolean;
  selectedQuestionsFromCanvas?: Question[];
  onClearSelectedQuestions?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onOpenCanvas, 
  onTriggerCanvas, 
  isCanvasOpen,
  selectedQuestionsFromCanvas = [],
  onClearSelectedQuestions
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Chat UI - Direct placement with flex-1 for proper height flow */}
      <ChatUI 
        onOpenCanvas={onOpenCanvas} 
        onTriggerCanvas={onTriggerCanvas}
        isCanvasOpen={isCanvasOpen}
        selectedQuestionsFromCanvas={selectedQuestionsFromCanvas}
        onClearSelectedQuestions={onClearSelectedQuestions}
      />
    </div>
  );
};
