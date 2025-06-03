
import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { CanvasContainer } from './canvas/CanvasContainer';
import { Button } from '@/components/ui/button';
import { MessageSquare, Square } from 'lucide-react';
import { useCanvas } from '@/hooks/useCanvas';

export const ChatCanvas: React.FC = () => {
  const [activeView, setActiveView] = useState<'chat' | 'canvas'>('chat');
  const { isCanvasOpen, currentTrigger, triggerCanvas, closeCanvas, openCanvas } = useCanvas();

  const handleCloseCanvas = () => {
    closeCanvas();
    setActiveView('chat');
  };

  // Check if mobile viewport
  const isMobile = window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1EDFF] via-[#EEFFF3] to-[#FFFFFF] p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Mobile Toggle Buttons */}
        {isCanvasOpen && (
          <div className="md:hidden fixed top-8 left-8 right-8 z-10 flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <Button
              onClick={() => setActiveView('chat')}
              variant={activeView === 'chat' ? 'default' : 'outline'}
              size="sm"
              className={`flex-1 ${
                activeView === 'chat'
                  ? 'bg-[#753BBD] text-white'
                  : 'border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button
              onClick={() => setActiveView('canvas')}
              variant={activeView === 'canvas' ? 'default' : 'outline'}
              size="sm"
              className={`flex-1 ${
                activeView === 'canvas'
                  ? 'bg-[#753BBD] text-white'
                  : 'border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20'
              }`}
            >
              <Square className="w-4 h-4 mr-2" />
              Canvas
            </Button>
          </div>
        )}

        <div className="flex h-full">
          {/* Chat Panel */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isCanvasOpen
                ? 'hidden md:flex md:w-[30%] lg:w-[35%]'
                : 'w-full'
            } ${
              isCanvasOpen && activeView === 'chat' ? 'flex md:flex' : ''
            } ${
              isCanvasOpen && activeView === 'canvas' ? 'hidden md:flex' : ''
            }`}
          >
            <ChatInterface
              onOpenCanvas={openCanvas}
              onTriggerCanvas={triggerCanvas}
              isCanvasOpen={isCanvasOpen}
            />
          </div>

          {/* Canvas Panel */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isCanvasOpen
                ? 'w-full md:w-[70%] lg:w-[65%]'
                : 'w-0 overflow-hidden'
            } ${
              isCanvasOpen && activeView === 'canvas' ? 'flex md:flex' : ''
            } ${
              isCanvasOpen && activeView === 'chat' ? 'hidden md:flex' : ''
            }`}
          >
            <CanvasContainer
              onClose={handleCloseCanvas}
              isVisible={isCanvasOpen}
              trigger={currentTrigger}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
