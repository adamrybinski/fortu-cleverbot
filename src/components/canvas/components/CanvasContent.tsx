
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CanvasModule } from '../CanvasModule';
import { ChallengeHistory } from '../modules/ChallengeHistory';
import { SimpleQuestionToolbar } from '../modules/SimpleQuestionToolbar';
import { CanvasTrigger } from '../CanvasContainer';
import { Question, ChallengeHistoryHook } from '../modules/types';
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

interface CanvasContentProps {
  showChallengeHistory: boolean;
  activeModule: 'questions' | 'setup';
  trigger: CanvasTrigger;
  toolbarState: {
    showSelection: boolean;
    selectedQuestions: Question[];
    hasQuestions: boolean;
  };
  challengeHistory: any[];
  currentSessionId: string | null;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  getUnselectedQuestions: (sessionId: string) => Question[];
  getCurrentSession: () => any;
  createNewSession: (question: string) => string;
  updateSession: (sessionId: string, updates: any) => void;
  markSessionCompleted: (sessionId: string) => void;
  questionSessions?: QuestionSessionsHook;
  onSendQuestionsToChat?: (questions: Question[], action?: 'refine' | 'instance' | 'both') => void;
  onSetShowChallengeHistory: (show: boolean) => void;
  onSelectionStateChange: (state: { showSelection: boolean; selectedQuestions: Question[]; hasQuestions: boolean; }) => void;
  onSendToChat: (questions: Question[]) => void;
  onToggleSelection: () => void;
  onClearSelections: () => void;
}

export const CanvasContent: React.FC<CanvasContentProps> = ({
  showChallengeHistory,
  activeModule,
  trigger,
  toolbarState,
  challengeHistory,
  currentSessionId,
  switchToSession,
  deleteSession,
  getUnselectedQuestions,
  getCurrentSession,
  createNewSession,
  updateSession,
  markSessionCompleted,
  questionSessions,
  onSendQuestionsToChat,
  onSetShowChallengeHistory,
  onSelectionStateChange,
  onSendToChat,
  onToggleSelection,
  onClearSelections
}) => {
  const handleStartNewChallenge = () => {
    onSetShowChallengeHistory(false);
    if (onSendQuestionsToChat) {
      onSendQuestionsToChat([], 'refine');
    }
  };

  const handleExploreRemainingQuestions = (sessionId: string) => {
    const remainingQuestions = getUnselectedQuestions(sessionId);
    onSetShowChallengeHistory(false);
    switchToSession(sessionId);
    
    if (onSendQuestionsToChat && remainingQuestions.length > 0) {
      onSendQuestionsToChat(remainingQuestions, 'refine');
    }
  };

  // Create appropriate trigger based on active module
  const getActiveTrigger = (): CanvasTrigger => {
    if (activeModule === 'setup') {
      return {
        type: 'fortuInstanceSetup',
        payload: trigger?.payload || {}
      };
    } else {
      return {
        type: 'fortuQuestions',
        payload: trigger?.payload || {}
      };
    }
  };

  return (
    <div className="flex-1 min-h-0 relative">
      <ScrollArea className="h-full w-full">
        {showChallengeHistory ? (
          <ChallengeHistory
            challengeHistory={challengeHistory}
            currentSessionId={currentSessionId}
            onSwitchToSession={(sessionId) => {
              switchToSession(sessionId);
              onSetShowChallengeHistory(false);
            }}
            onDeleteSession={deleteSession}
            onStartNewChallenge={handleStartNewChallenge}
            onExploreRemainingQuestions={handleExploreRemainingQuestions}
          />
        ) : (
          <CanvasModule 
            trigger={getActiveTrigger()} 
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
            onSelectionStateChange={onSelectionStateChange}
            onSendToChat={onSendToChat}
            onToggleSelection={onToggleSelection}
            onClearSelections={onClearSelections}
            showSelection={toolbarState.showSelection}
          />
        )}
      </ScrollArea>

      {/* Floating Question Selection Toolbar - positioned outside ScrollArea */}
      {!showChallengeHistory && toolbarState.hasQuestions && activeModule === 'questions' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative h-full w-full">
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-6 pointer-events-auto">
              <SimpleQuestionToolbar
                showSelection={toolbarState.showSelection}
                selectedQuestions={toolbarState.selectedQuestions}
                onToggleSelection={onToggleSelection}
                onSendToChat={onSendToChat}
                onClearSelections={onClearSelections}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
