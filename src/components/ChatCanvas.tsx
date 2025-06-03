import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { CanvasContainer, CanvasTrigger } from './canvas/CanvasContainer';

export const ChatCanvas = () => {
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [trigger, setTrigger] = useState<CanvasTrigger | null>(null);

  const handleOpenCanvas = (type = 'blank', payload = {}) => {
    setTrigger({ type, payload });
    setIsCanvasOpen(true);
  };

  const handleTriggerCanvas = (trigger: CanvasTrigger) => {
    setTrigger(trigger);
    setIsCanvasOpen(true);
  };

  const handleCloseCanvas = () => {
    setIsCanvasOpen(false);
    setTrigger(null);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Chat column */}
      <div className={`h-full ${isCanvasOpen ? 'w-[30%]' : 'w-full'}`}>
        <ChatInterface
          onOpenCanvas={handleOpenCanvas}
          onTriggerCanvas={handleTriggerCanvas}
          isCanvasOpen={isCanvasOpen}
        />
      </div>

      {/* Canvas column */}
      {isCanvasOpen && trigger && (
        <div className="hidden md:flex w-[70%] h-full">
          <CanvasContainer
            isVisible={true}
            trigger={trigger}
            onClose={handleCloseCanvas}
          />
        </div>
      )}
    </div>
  );
};
