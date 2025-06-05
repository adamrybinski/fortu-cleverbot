
import React from 'react';
import { PanelRightOpen, PanelRightClose, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasTrigger } from '@/components/canvas/CanvasContainer';

interface ChatHeaderProps {
  onOpenCanvas?: (type?: string, payload?: Record<string, any>) => void;
  onCloseCanvas?: () => void;
  isCanvasOpen?: boolean;
  hasCanvasBeenTriggered?: boolean;
  currentTrigger?: CanvasTrigger | null;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onOpenCanvas, 
  onCloseCanvas,
  isCanvasOpen, 
  hasCanvasBeenTriggered,
  currentTrigger,
  isSidebarOpen,
  onToggleSidebar
}) => {
  const handleCanvasToggle = () => {
    if (isCanvasOpen) {
      onCloseCanvas?.();
    } else {
      if (currentTrigger) {
        // Reopen the same canvas that was previously triggered
        onOpenCanvas?.(currentTrigger.type, currentTrigger.payload);
      } else {
        // Default to question search canvas instead of blank
        onOpenCanvas?.('fortuQuestions', {});
      }
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#F1EDFF]/30 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Left Panel Toggle */}
        {onToggleSidebar && (
          <Button
            onClick={onToggleSidebar}
            variant="outline"
            size="sm"
            className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
        )}
        <h1 className="text-xl font-semibold text-[#003079]">CleverBot</h1>
      </div>
      
      {/* Right Panel Toggle (Canvas) */}
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
