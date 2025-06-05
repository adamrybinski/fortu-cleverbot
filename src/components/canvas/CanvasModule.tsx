
import React from 'react';
import { CanvasTrigger } from './CanvasContainer';
import { BlankCanvas } from './modules/BlankCanvas';
import { FortuQuestionsCanvas } from './modules/FortuQuestionsCanvas';
import { ChallengeHistory } from './modules/ChallengeHistory';
import { Question, ChallengeHistoryHook } from './modules/types';
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

interface CanvasModuleProps {
  trigger: CanvasTrigger;
  onSendQuestionsToChat?: (questions: Question[], action?: 'refine' | 'instance' | 'both') => void;
  challengeHistory?: ChallengeHistoryHook;
  questionSessions?: QuestionSessionsHook;
}

export const CanvasModule: React.FC<CanvasModuleProps> = ({ 
  trigger, 
  onSendQuestionsToChat,
  challengeHistory,
  questionSessions
}) => {
  console.log('Canvas triggered with:', trigger);

  switch (trigger.type) {
    case 'fortuQuestions':
      return (
        <FortuQuestionsCanvas 
          payload={trigger.payload} 
          onSendQuestionsToChat={onSendQuestionsToChat}
          challengeHistory={challengeHistory}
          questionSessions={questionSessions}
        />
      );
    
    case 'challengeHistory':
      if (!challengeHistory) {
        console.warn('Challenge history not available, falling back to blank canvas');
        return <BlankCanvas payload={trigger.payload} />;
      }
      
      return (
        <div className="p-6 bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3] min-h-full">
          <ChallengeHistory
            challengeHistory={challengeHistory.challengeHistory}
            currentSessionId={challengeHistory.currentSessionId}
            onSwitchToSession={challengeHistory.switchToSession}
            onDeleteSession={challengeHistory.deleteSession}
            onStartNewChallenge={() => {
              if (onSendQuestionsToChat) {
                onSendQuestionsToChat([], 'refine');
              }
            }}
            onExploreRemainingQuestions={(sessionId) => {
              const remainingQuestions = challengeHistory.getUnselectedQuestions(sessionId);
              challengeHistory.switchToSession(sessionId);
              
              if (onSendQuestionsToChat && remainingQuestions.length > 0) {
                onSendQuestionsToChat(remainingQuestions, 'refine');
              }
            }}
          />
        </div>
      );
    
    case 'challengeMapping':
      return <BlankCanvas payload={trigger.payload} />;
    
    case 'blank':
    case 'canvas':
    default:
      return <BlankCanvas payload={trigger.payload} />;
  }
};
