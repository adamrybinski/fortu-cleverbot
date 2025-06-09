
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CanvasModule } from './CanvasModule';
import { ChallengeHistory } from './modules/ChallengeHistory';
import { SimpleQuestionToolbar } from './modules/SimpleQuestionToolbar';
import { CanvasHeader } from './components/CanvasHeader';
import { CanvasFloatingToolbar } from './components/CanvasFloatingToolbar';
import { ShineBorder } from './components/ShineBorder';
import { useChallengeHistory } from '@/hooks/useChallengeHistory';
import { Question } from './modules/types';
import { QuestionSession } from '@/hooks/useQuestionSessions';

interface QuestionSessionsHook {
  questionSessions: QuestionSession[];
  activeSessionId: string | null;
  getActiveSession: () => QuestionSession | null;
  createNewSession: (question: string) => string;
  updateSession: (sessionId: string, updates: Partial<QuestionSession>) => void;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

export interface CanvasTrigger {
  type: string;
  payload?: Record<string, any>;
}

interface CanvasContainerProps {
  onClose: () => void;
  isVisible: boolean;
  trigger: CanvasTrigger | null;
  isMobile?: boolean;
  useShineBorder?: boolean;
  onSendQuestionsToChat?: (questions: Question[], action?: 'refine' | 'instance' | 'both') => void;
  questionSessions?: QuestionSessionsHook;
  onSendMessageToChat?: (message: string) => void;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({ 
  onClose, 
  isVisible, 
  trigger,
  isMobile = false,
  useShineBorder = false,
  onSendQuestionsToChat,
  questionSessions,
  onSendMessageToChat
}) => {
  const [showChallengeHistory, setShowChallengeHistory] = useState(false);
  const [toolbarState, setToolbarState] = useState({
    showSelection: false,
    selectedQuestions: [] as Question[],
    hasQuestions: false
  });

  const {
    challengeHistory,
    currentSessionId,
    getCurrentSession,
    createNewSession,
    updateSession,
    switchToSession,
    deleteSession,
    getUnselectedQuestions,
    markSessionCompleted
  } = useChallengeHistory();

  if (!isVisible || !trigger) return null;

  const handleStartNewChallenge = () => {
    setShowChallengeHistory(false);
    if (onSendQuestionsToChat) {
      onSendQuestionsToChat([], 'refine');
    }
  };

  const handleExploreRemainingQuestions = (sessionId: string) => {
    const remainingQuestions = getUnselectedQuestions(sessionId);
    setShowChallengeHistory(false);
    switchToSession(sessionId);
    
    if (onSendQuestionsToChat && remainingQuestions.length > 0) {
      onSendQuestionsToChat(remainingQuestions, 'refine');
    }
  };

  const handleCreateNewQuestionSession = () => {
    if (onSendMessageToChat) {
      onSendMessageToChat("I'd like to explore a new challenge. Can you help me identify and refine it?");
    }
  };

  const handleSetupFortuInstance = (questions: Question[]) => {
    // Send the selected questions to chat for fortu instance setup
    if (onSendQuestionsToChat) {
      onSendQuestionsToChat(questions, 'instance');
    }
  };

  const handleAddAnotherChallenge = () => {
    if (onSendMessageToChat) {
      onSendMessageToChat("I'd like to explore another challenge. Can you help me identify and refine it?");
    }
    setToolbarState(prev => ({ ...prev, showSelection: false, selectedQuestions: [] }));
  };

  const handleSelectionStateChange = (state: {
    showSelection: boolean;
    selectedQuestions: Question[];
    hasQuestions: boolean;
  }) => {
    setToolbarState(state);
  };

  const handleSendToChat = (questions: Question[]) => {
    if (onSendQuestionsToChat) {
      onSendQuestionsToChat(questions, 'refine');
    }
    setToolbarState(prev => ({ ...prev, showSelection: false, selectedQuestions: [] }));
  };

  const handleToggleSelection = () => {
    setToolbarState(prev => ({ ...prev, showSelection: !prev.showSelection }));
  };

  const handleClearSelections = () => {
    setToolbarState(prev => ({ ...prev, selectedQuestions: [] }));
  };

  const content = (
    <div className="relative flex flex-col h-full w-full bg-white border-l border-[#6EFFC6]/30">
      {/* Header */}
      <CanvasHeader
        showChallengeHistory={showChallengeHistory}
        challengeHistoryLength={challengeHistory.length}
        isMobile={isMobile}
        questionSessions={questionSessions}
        onClose={onClose}
        onShowChallengeHistory={() => setShowChallengeHistory(true)}
        onCreateNewQuestionSession={handleCreateNewQuestionSession}
        onSendMessageToChat={onSendMessageToChat}
      />
      
      {/* Canvas Content Area with ScrollArea */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full w-full">
          {showChallengeHistory ? (
            <ChallengeHistory
              challengeHistory={challengeHistory}
              currentSessionId={currentSessionId}
              onSwitchToSession={(sessionId) => {
                switchToSession(sessionId);
                setShowChallengeHistory(false);
              }}
              onDeleteSession={deleteSession}
              onStartNewChallenge={handleStartNewChallenge}
              onExploreRemainingQuestions={handleExploreRemainingQuestions}
            />
          ) : (
            <CanvasModule 
              trigger={trigger} 
              onSendQuestionsToChat={onSendQuestionsToChat}
              challengeHistory={{
                challengeHistory,
                currentSessionId,
                getCurrentSession,
                createNewSession,
                updateSession,
                switchToSession,
                deleteSession,
                getUnselectedQuestions,
                markSessionCompleted
              }}
              questionSessions={questionSessions}
              onSelectionStateChange={handleSelectionStateChange}
              onSendToChat={handleSendToChat}
              onToggleSelection={handleToggleSelection}
              onClearSelections={handleClearSelections}
              showSelection={toolbarState.showSelection}
            />
          )}
        </ScrollArea>

        {/* Floating Question Selection Toolbar - positioned outside ScrollArea */}
        <CanvasFloatingToolbar
          showChallengeHistory={showChallengeHistory}
          hasQuestions={toolbarState.hasQuestions}
          showSelection={toolbarState.showSelection}
          selectedQuestions={toolbarState.selectedQuestions}
          onToggleSelection={handleToggleSelection}
          onSendToChat={handleSendToChat}
          onClearSelections={handleClearSelections}
          onSetupFortuInstance={handleSetupFortuInstance}
          onAddAnotherChallenge={handleAddAnotherChallenge}
        />
      </div>
    </div>
  );

  if (useShineBorder) {
    return (
      <div className="h-full w-full p-2">
        <ShineBorder
          borderWidth={2}
          className="border-0 bg-transparent p-0"
          color={["#6EFFC6", "#003079", "#F1EDFF"]}
          duration={8}
          borderRadius={12}
        >
          {content}
        </ShineBorder>
      </div>
    );
  }

  return content;
};
