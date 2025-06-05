
import React, { useState } from 'react';
import { X, ArrowLeft, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CanvasModule } from './CanvasModule';
import { ChallengeHistory } from './modules/ChallengeHistory';
import { CanvasQuestionMenu } from './CanvasQuestionMenu';
import { SimpleQuestionToolbar } from './modules/SimpleQuestionToolbar';
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

// ShineBorder Component optimized for Lovable
interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string | string[];
  className?: string;
  children: React.ReactNode;
}

function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = "#000000",
  className = "",
  children,
}: ShineBorderProps) {
  const colorGradient = Array.isArray(color) ? color.join(",") : color;
  
  return (
    <div
      className={`relative h-full w-full rounded-xl bg-white p-3 ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
      }}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-75"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${colorGradient}, transparent)`,
          animation: `spin ${duration}s linear infinite`,
          padding: `${borderWidth}px`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
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
      <div className="flex items-center justify-between p-4 border-b border-[#6EFFC6]/20 bg-gradient-to-r from-[#F1EDFF] to-[#EEFFF3] flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Question Session Menu - only show if questionSessions is provided and there are multiple sessions */}
          {questionSessions && (
            <CanvasQuestionMenu
              questionSessions={questionSessions.questionSessions}
              activeSessionId={questionSessions.activeSessionId}
              onSwitchToSession={questionSessions.switchToSession}
              onCreateNewSession={handleCreateNewQuestionSession}
              onDeleteSession={questionSessions.deleteSession}
              onSendMessageToChat={onSendMessageToChat}
            />
          )}
          
          {isMobile && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-[#003079] hover:bg-white/50 p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h2 className="text-lg font-semibold text-[#003079]">
            {showChallengeHistory ? 'Challenge History' : 'Canvas'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!showChallengeHistory && challengeHistory.length > 0 && (
            <Button
              onClick={() => setShowChallengeHistory(true)}
              variant="ghost"
              size="sm"
              className="text-[#003079] hover:bg-white/50"
            >
              <History className="w-4 h-4" />
            </Button>
          )}
          {!isMobile && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-[#003079] hover:bg-white/50"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
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
            />
          )}
        </ScrollArea>

        {/* Floating Question Selection Toolbar - positioned outside ScrollArea */}
        {!showChallengeHistory && toolbarState.hasQuestions && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative h-full w-full">
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-6 pointer-events-auto">
                <SimpleQuestionToolbar
                  showSelection={toolbarState.showSelection}
                  selectedQuestions={toolbarState.selectedQuestions}
                  onToggleSelection={handleToggleSelection}
                  onSendToChat={handleSendToChat}
                  onClearSelections={handleClearSelections}
                />
              </div>
            </div>
          </div>
        )}
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
