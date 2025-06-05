
import React from 'react';
import { PanelRightOpen, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasTrigger } from '@/components/canvas/CanvasContainer';

interface ChatHeaderProps {
  onOpenCanvas?: (type?: string, payload?: Record<string, any>) => void;
  onCloseCanvas?: () => void;
  isCanvasOpen?: boolean;
  hasCanvasBeenTriggered?: boolean;
  currentTrigger?: CanvasTrigger | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onOpenCanvas, 
  onCloseCanvas,
  isCanvasOpen, 
  hasCanvasBeenTriggered,
  currentTrigger
}) => {
  const handleCanvasToggle = () => {
    if (isCanvasOpen) {
      onCloseCanvas?.();
    } else {
      if (currentTrigger) {
        // Reopen the same canvas that was previously triggered
        onOpenCanvas?.(currentTrigger.type, currentTrigger.payload);
      } else {
        // Fallback to blank canvas if no previous trigger
        onOpenCanvas?.('blank', {});
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#F1EDFF]/30 flex-shrink-0">
      <h1 className="text-xl font-semibold text-[#003079]">CleverBot</h1>
      {onOpenCanvas && hasCanvasBeenTriggered && (
        <Button
          onClick={handleCanvasToggle}
          variant="outline"
          size="sm"
          className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20 dark:text-white dark:border-[#6EFFC6]/50"
        >
          {isCanvasOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </Button>
      )}
    </div>
  );
};
