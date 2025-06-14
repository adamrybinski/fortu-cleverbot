
import React, { useState, useEffect } from 'react';
import { ChatUI } from './ChatUI';
import { ChatHistorySidebar } from './chat/ChatHistorySidebar';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
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
  hasCanvasBeenTriggered?: boolean;
  // Canvas control functions
  closeCanvas?: () => void;
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
  onSessionChange,
  hasCanvasBeenTriggered = false,
  closeCanvas
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Single source of truth for chat history
  const { 
    createNewSession, 
    switchToSession, 
    deleteSession,
    renameSession,
    toggleStarSession,
    allSessions, 
    activeSessionId: currentActiveSessionId,
    sessions,
    getActiveSession,
    addMessageToSession
  } = useChatHistory();

  const handleNewChat = () => {
    console.log('Creating new chat from sidebar...');
    
    // Create new session - saving is now handled automatically
    const newSessionId = createNewSession();
    
    // Clear canvas state when creating new chat
    if (closeCanvas) {
      console.log('🧹 Clearing canvas state for new chat');
      closeCanvas();
    }
    
    // Clear selected questions from canvas
    if (onClearSelectedQuestions) {
      onClearSelectedQuestions();
    }
    
    setIsSidebarOpen(false);
  };

  const handleSessionChange = (sessionId: string) => {
    console.log('Switching to session from sidebar:', sessionId);
    
    // Switch to session - saving is now handled automatically
    switchToSession(sessionId);
    
    // Clear canvas state when switching sessions
    if (closeCanvas) {
      console.log('🧹 Clearing canvas state for session switch');
      closeCanvas();
    }
    
    // Clear selected questions from canvas
    if (onClearSelectedQuestions) {
      onClearSelectedQuestions();
    }
    
    setIsSidebarOpen(false);
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
            activeSessionId={currentActiveSessionId}
            onSessionChange={onSessionChange}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={handleToggleSidebar}
            // Pass session management functions to ChatUI
            getActiveSession={getActiveSession}
            addMessageToSession={addMessageToSession}
            createNewSession={createNewSession}
          />
        </div>
      </div>

      {/* Overlay Sidebar - Mobile responsive width */}
      <div
        className={`absolute inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
          isSidebarOpen 
            ? 'translate-x-0' 
            : '-translate-x-full'
        }`}
      >
        <div className="h-full shadow-lg">
          <ChatHistorySidebar 
            onNewChat={handleNewChat} 
            onClose={handleCloseSidebar}
            // Pass all session management props
            sessions={sessions}
            allSessions={allSessions}
            activeSessionId={currentActiveSessionId}
            getActiveSession={getActiveSession}
            switchToSession={handleSessionChange}
            deleteSession={deleteSession}
            renameSession={renameSession}
            toggleStarSession={toggleStarSession}
          />
        </div>
      </div>

      {/* Backdrop - Touch friendly for mobile */}
      {isSidebarOpen && (
        <div
          className="absolute inset-0 bg-black/20 z-40 touch-manipulation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
