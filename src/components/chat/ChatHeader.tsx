
import React from 'react';
import { PanelRightOpen, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasTrigger } from '@/components/canvas/CanvasContainer';

interface ChatHeaderProps {
  onOpenCanvas?: (type?: string, payload?: Record<string, any>) => void;
  isCanvasOpen?: boolean;
  hasCanvasBeenTriggered?: boolean;
  currentTrigger?: CanvasTrigger | null;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  hasVisibleSessions?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onOpenCanvas, 
  isCanvasOpen, 
  hasCanvasBeenTriggered,
  currentTrigger,
  isSidebarOpen,
  onToggleSidebar,
  hasVisibleSessions = false
}) => {
  const handleCanvasOpen = () => {
    if (!isCanvasOpen) {
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
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-[#F1EDFF]/30 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Left Panel Toggle - Always show when sidebar functionality is available */}
        {onToggleSidebar && (
          <Button
            onClick={onToggleSidebar}
            variant="outline"
            size="sm"
            className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20 h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2 touch-manipulation"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
        )}
        <h1 className="text-lg sm:text-xl font-semibold text-[#003079] font-['Montserrat']">CleverBot</h1>
      </div>
      
      {/* Right Panel Toggle (Canvas) - Only show open button when canvas is closed */}
      {onOpenCanvas && hasCanvasBeenTriggered && !isCanvasOpen && (
        <Button
          onClick={handleCanvasOpen}
          variant="outline"
          size="sm"
          className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20 dark:text-white dark:border-[#6EFFC6]/50 h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2 touch-manipulation"
        >
          <PanelRightOpen className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
