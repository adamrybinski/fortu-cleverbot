
import React from 'react';
import { ChatUI } from './ChatUI';
import { CanvasTrigger } from './canvas/CanvasContainer';

interface ChatInterfaceProps {
  onOpenCanvas: (type?: string, payload?: Record<string, any>) => void;
  onTriggerCanvas: (trigger: CanvasTrigger) => void;
  isCanvasOpen: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onOpenCanvas, 
  onTriggerCanvas, 
  isCanvasOpen 
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Chat UI - Direct placement with flex-1 for proper height flow */}
      <ChatUI 
        onOpenCanvas={onOpenCanvas} 
        onTriggerCanvas={onTriggerCanvas}
        isCanvasOpen={isCanvasOpen}
      />
    </div>
  );
};
