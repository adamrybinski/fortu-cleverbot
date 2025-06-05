
import React from 'react';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasTrigger } from '@/components/canvas/CanvasContainer';

interface ChatHeaderProps {
  onOpenCanvas?: (type?: string, payload?: Record<string, any>) => void;
  isCanvasOpen?: boolean;
  hasCanvasBeenTriggered?: boolean;
  currentTrigger?: CanvasTrigger | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onOpenCanvas, 
  isCanvasOpen, 
  hasCanvasBeenTriggered,
  currentTrigger
}) => {
  const handleOpenCanvas = () => {
    if (currentTrigger) {
      // Reopen the same canvas that was previously triggered
      onOpenCanvas?.(currentTrigger.type, currentTrigger.payload);
    } else {
      // Fallback to blank canvas if no previous trigger
      onOpenCanvas?.('blank', {});
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#F1EDFF]/30 flex-shrink-0">
      <h1 className="text-xl font-semibold text-[#003079]">CleverBot</h1>
      {!isCanvasOpen && onOpenCanvas && hasCanvasBeenTriggered && (
        <Button
          onClick={handleOpenCanvas}
          variant="outline"
          size="sm"
          className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20 dark:text-white dark:border-[#6EFFC6]/50"
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Open Canvas
        </Button>
      )}
    </div>
  );
};
