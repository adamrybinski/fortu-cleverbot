import React, { useState } from 'react';
import { ShineBorder } from './components/ShineBorder';
import { CanvasHeader } from './components/CanvasHeader';
import { CanvasContent } from './components/CanvasContent';
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
  // Determine initial active module based on trigger type and available refined challenges
  const getInitialModule = () => {
    if (!trigger) return 'questions';
    
    // Check if there are any refined challenges available
    const hasRefinedChallenges = questionSessions?.questionSessions.some(session => 
      session.refinedChallenge && (session.status === 'searching' || session.status === 'matches_found' || session.status === 'refined')
    ) || false;
    
    // Only allow setup module if there are refined challenges
    if (trigger.type === 'fortuInstanceSetup' && hasRefinedChallenges) {
      return 'setup';
    }
    
    return 'questions';
  };

  const [showChallengeHistory, setShowChallengeHistory] = useState(false);
  const [activeModule, setActiveModule] = useState<'questions' | 'setup'>(getInitialModule);
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

  // Update active module when trigger changes - with refined challenge validation
  React.useEffect(() => {
    const hasRefinedChallenges = questionSessions?.questionSessions.some(session => 
      session.refinedChallenge && (session.status === 'searching' || session.status === 'matches_found' || session.status === 'refined')
    ) || false;

    if (trigger?.type === 'fortuInstanceSetup' && hasRefinedChallenges) {
      setActiveModule('setup');
    } else if (trigger?.type === 'fortuQuestions') {
      setActiveModule('questions');
    } else if (trigger?.type === 'fortuInstanceSetup' && !hasRefinedChallenges) {
      // If setup is requested but no refined challenges exist, guide user to questions first
      setActiveModule('questions');
      if (onSendMessageToChat) {
        onSendMessageToChat("To access fortu.ai setup, please first refine at least one challenge by exploring questions.");
      }
    }
  }, [trigger?.type, questionSessions?.questionSessions, onSendMessageToChat]);

  // Early return after all hooks have been called
  if (!isVisible || !trigger) return null;

  const handleCreateNewQuestionSession = () => {
    if (onSendMessageToChat) {
      onSendMessageToChat("I'd like to explore a new challenge. Can you help me identify and refine it?");
    }
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

  const handleModuleSwitch = (moduleType: 'questions' | 'setup') => {
    // Validate access to setup module
    if (moduleType === 'setup') {
      const hasRefinedChallenges = questionSessions?.questionSessions.some(session => 
        session.refinedChallenge && (session.status === 'searching' || session.status === 'matches_found' || session.status === 'refined')
      ) || false;
      
      if (!hasRefinedChallenges) {
        if (onSendMessageToChat) {
          onSendMessageToChat("To access fortu.ai setup, please first refine at least one challenge by exploring questions.");
        }
        return;
      }
    }
    
    setActiveModule(moduleType);
    setShowChallengeHistory(false);
  };

  const content = (
    <div className="relative flex flex-col h-full w-full bg-white border-l border-[#6EFFC6]/30">
      <CanvasHeader
        showChallengeHistory={showChallengeHistory}
        activeModule={activeModule}
        challengeHistoryLength={challengeHistory.length}
        isMobile={isMobile}
        trigger={trigger}
        questionSessions={questionSessions}
        onClose={onClose}
        onShowChallengeHistory={() => setShowChallengeHistory(true)}
        onCreateNewQuestionSession={handleCreateNewQuestionSession}
        onModuleSwitch={handleModuleSwitch}
        onSendMessageToChat={onSendMessageToChat}
      />
      
      <CanvasContent
        showChallengeHistory={showChallengeHistory}
        activeModule={activeModule}
        trigger={trigger}
        toolbarState={toolbarState}
        challengeHistory={challengeHistory}
        currentSessionId={currentSessionId}
        switchToSession={switchToSession}
        deleteSession={deleteSession}
        getUnselectedQuestions={getUnselectedQuestions}
        getCurrentSession={getCurrentSession}
        createNewSession={createNewSession}
        updateSession={updateSession}
        markSessionCompleted={markSessionCompleted}
        questionSessions={questionSessions}
        onSendQuestionsToChat={onSendQuestionsToChat}
        onSetShowChallengeHistory={setShowChallengeHistory}
        onSelectionStateChange={handleSelectionStateChange}
        onSendToChat={handleSendToChat}
        onToggleSelection={handleToggleSelection}
        onClearSelections={handleClearSelections}
      />
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
