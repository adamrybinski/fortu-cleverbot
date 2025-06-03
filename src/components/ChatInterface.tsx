
import React from 'react';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      {/* Canvas Toggle Button for when canvas is closed */}
      {!isCanvasOpen && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex-shrink-0">
          <Button
            onClick={() => onOpenCanvas()}
            variant="outline"
            size="sm"
            className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20 dark:text-white dark:border-[#6EFFC6]/50"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Open Canvas
          </Button>
        </div>
      )}
      
      {/* Chat UI - Direct placement with flex-1 for proper height flow */}
      <ChatUI 
        onOpenCanvas={onOpenCanvas} 
        onTriggerCanvas={onTriggerCanvas}
      />
    </div>
  );
};
