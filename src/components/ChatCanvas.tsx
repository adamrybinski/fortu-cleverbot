
import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { CanvasContainer } from './canvas/CanvasContainer';
import { Button } from '@/components/ui/button';
import { MessageSquare, Square } from 'lucide-react';
import { useCanvas } from '@/hooks/useCanvas';

interface Question {
  id: string | number;
  question: string;
  source: 'fortu' | 'openai';
  selected?: boolean;
}

export const ChatCanvas: React.FC = () => {
  const [activeView, setActiveView] = useState<'chat' | 'canvas'>('chat');
  const [selectedQuestionsFromCanvas, setSelectedQuestionsFromCanvas] = useState<Question[]>([]);
  const [selectedAction, setSelectedAction] = useState<'refine' | 'instance' | 'both'>('refine');
  const { isCanvasOpen, currentTrigger, triggerCanvas, closeCanvas, openCanvas } = useCanvas();

  const handleCloseCanvas = () => {
    closeCanvas();
    setActiveView('chat');
  };

  const handleSendQuestionsToChat = (questions: Question[], action: 'refine' | 'instance' | 'both' = 'refine') => {
    console.log('Sending questions to chat:', questions, 'with action:', action);
    setSelectedQuestionsFromCanvas(questions);
    setSelectedAction(action);
    // Switch to chat view on mobile after sending questions
    setActiveView('chat');
  };

  const handleClearSelectedQuestions = () => {
    console.log('Clearing selected questions');
    setSelectedQuestionsFromCanvas([]);
    setSelectedAction('refine');
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
              {selectedQuestionsFromCanvas.length > 0 && (
                <span className="ml-1 bg-[#6EFFC6] text-[#003079] rounded-full px-2 py-0.5 text-xs font-medium">
                  {selectedQuestionsFromCanvas.length}
                </span>
              )}
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
          {/* Chat Panel - removed overflow-hidden to allow internal scrolling */}
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
              onOpenCanvas={openCanvas}
              onTriggerCanvas={triggerCanvas}
              isCanvasOpen={isCanvasOpen}
              selectedQuestionsFromCanvas={selectedQuestionsFromCanvas}
              selectedAction={selectedAction}
              onClearSelectedQuestions={handleClearSelectedQuestions}
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
              onSendQuestionsToChat={handleSendQuestionsToChat}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
