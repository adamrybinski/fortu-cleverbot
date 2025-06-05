
import React, { useState } from 'react';
import { ChatUI } from './ChatUI';
import { ChatHistorySidebar } from './chat/ChatHistorySidebar';
import { Button } from '@/components/ui/button';
import { History, X } from 'lucide-react';
import { CanvasTrigger } from './canvas/CanvasContainer';
import { Question } from './canvas/modules/types';
import { QuestionSession } from '@/hooks/useQuestionSessions';
import { useChatHistory } from '@/hooks/useChatHistory';

interface QuestionSessionsHook {
  questionSessions: QuestionSession[];
  activeSessionId: string | null;
  getActiveSession: () => QuestionSession | null;
  createNewSession: (question: string) => string;
  updateSession: (sessionId: string, updates: Partial<QuestionSession>) => void;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

interface ChatInterfaceProps {
  onOpenCanvas: (type?: string, payload?: Record<string, any>) => void;
  onTriggerCanvas: (trigger: CanvasTrigger) => void;
  isCanvasOpen: boolean;
  selectedQuestionsFromCanvas?: Question[];
  selectedAction?: 'refine' | 'instance' | 'both';
  onClearSelectedQuestions?: () => void;
  questionSessions?: QuestionSessionsHook;
  onSendMessageToChat?: (message: string) => void;
  currentTrigger?: CanvasTrigger | null;
  activeSessionId?: string | null;
  onSessionChange?: (sessionId: string | null) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onOpenCanvas, 
  onTriggerCanvas, 
  isCanvasOpen,
  selectedQuestionsFromCanvas = [],
  selectedAction = 'refine',
  onClearSelectedQuestions,
  questionSessions,
  onSendMessageToChat,
  currentTrigger,
  activeSessionId,
  onSessionChange
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { createNewSession, switchToSession } = useChatHistory();

  const handleNewChat = () => {
    const newSessionId = createNewSession();
    setIsSidebarOpen(false); // Close sidebar after creating new chat
  };

  const handleSessionChange = (sessionId: string) => {
    switchToSession(sessionId);
    setIsSidebarOpen(false); // Close sidebar after switching
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Chat UI - Always Full Width */}
      <div className="flex flex-col h-full">
        {/* Sidebar Toggle Button */}
        <div className="flex items-center p-2 border-b border-gray-200 bg-[#F1EDFF]/30">
          <Button
            onClick={handleToggleSidebar}
            variant="outline"
            size="sm"
            className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <History className="w-4 h-4" />}
          </Button>
        </div>

        {/* Chat UI Component */}
        <div className="flex-1 min-h-0">
          <ChatUI 
            onOpenCanvas={onOpenCanvas} 
            onTriggerCanvas={onTriggerCanvas}
            isCanvasOpen={isCanvasOpen}
            selectedQuestionsFromCanvas={selectedQuestionsFromCanvas}
            selectedAction={selectedAction}
            onClearSelectedQuestions={onClearSelectedQuestions}
            questionSessions={questionSessions}
            onSendMessageToChat={onSendMessageToChat}
            currentTrigger={currentTrigger}
            activeSessionId={activeSessionId}
            onSessionChange={onSessionChange}
          />
        </div>
      </div>

      {/* Overlay Sidebar */}
      <div
        className={`absolute inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen 
            ? 'translate-x-0' 
            : '-translate-x-full'
        }`}
      >
        <div className="w-80 h-full shadow-lg">
          <ChatHistorySidebar 
            onNewChat={handleNewChat} 
            onClose={handleCloseSidebar}
          />
        </div>
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="absolute inset-0 bg-black/20 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
