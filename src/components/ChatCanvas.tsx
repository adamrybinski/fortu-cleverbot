
import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { CanvasArea } from './CanvasArea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Square } from 'lucide-react';

export const ChatCanvas: React.FC = () => {
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'canvas'>('chat');

  const handleOpenCanvas = () => {
    setIsCanvasOpen(true);
  };

  const handleCloseCanvas = () => {
    setIsCanvasOpen(false);
    setActiveView('chat');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#F1EDFF] via-[#EEFFF3] to-[#FFFFFF] overflow-hidden">
      {/* Mobile Toggle Buttons */}
      {isCanvasOpen && (
        <div className="md:hidden fixed top-4 left-4 right-4 z-10 flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
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
          className={`transition-all duration-500 ease-in-out ${
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
            onOpenCanvas={handleOpenCanvas}
            isCanvasOpen={isCanvasOpen}
          />
        </div>

        {/* Canvas Panel */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            isCanvasOpen
              ? 'w-full md:w-[70%] lg:w-[65%]'
              : 'w-0 overflow-hidden'
          } ${
            isCanvasOpen && activeView === 'canvas' ? 'flex md:flex' : ''
          } ${
            isCanvasOpen && activeView === 'chat' ? 'hidden md:flex' : ''
          }`}
        >
          <CanvasArea
            onClose={handleCloseCanvas}
            isVisible={isCanvasOpen}
          />
        </div>
      </div>
    </div>
  );
};
