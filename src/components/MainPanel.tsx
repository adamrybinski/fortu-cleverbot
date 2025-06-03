import React from 'react';
import { ChatInterface } from './ChatInterface';
import { CanvasContainer, CanvasTrigger } from './canvas/CanvasContainer';

interface MainPanelProps {
  isCanvasOpen: boolean;
  trigger: CanvasTrigger | null;
  onOpenCanvas: (type?: string, payload?: Record<string, any>) => void;
  onTriggerCanvas: (trigger: CanvasTrigger) => void;
  onCloseCanvas: () => void;
}

export const MainPanel: React.FC<MainPanelProps> = ({
  isCanvasOpen,
  trigger,
  onOpenCanvas,
  onTriggerCanvas,
  onCloseCanvas,
}) => {
  return (
    <div className="flex h-screen w-full">
      {/* Left: Chat Interface (30%) */}
      <div className="w-full md:w-[30%] h-full border-r border-[#6EFFC6]/20">
        <ChatInterface
          onOpenCanvas={onOpenCanvas}
          onTriggerCanvas={onTriggerCanvas}
          isCanvasOpen={isCanvasOpen}
        />
      </div>

      {/* Right: Canvas (70%) */}
      {isCanvasOpen && trigger && (
        <div className="hidden md:flex w-[70%] h-full">
          <CanvasContainer
            isVisible={true}
            trigger={trigger}
            onClose={onCloseCanvas}
          />
        </div>
      )}
    </div>
  );
};
