
import React from 'react';
import { CanvasTrigger } from './CanvasContainer';
import { BlankCanvas } from './modules/BlankCanvas';
import { FortuQuestionsCanvas } from './modules/FortuQuestionsCanvas';
import { ChallengeHistory } from './modules/ChallengeHistory';
import { Question, ChallengeHistoryHook } from './modules/types';

interface CanvasModuleProps {
  trigger: CanvasTrigger;
  onSendQuestionsToChat?: (questions: Question[], action?: 'refine' | 'instance' | 'both') => void;
  challengeHistory?: ChallengeHistoryHook;
}

export const CanvasModule: React.FC<CanvasModuleProps> = ({ 
  trigger, 
  onSendQuestionsToChat,
  challengeHistory
}) => {
  console.log('Canvas triggered with:', trigger);

  switch (trigger.type) {
    case 'fortuQuestions':
      return (
        <FortuQuestionsCanvas 
          payload={trigger.payload} 
          onSendQuestionsToChat={onSendQuestionsToChat}
          challengeHistory={challengeHistory}
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
      return <BlankCanvas payload={trigger.payload} />; // Use BlankCanvas for now, could be specialized later
    
    case 'blank':
    case 'canvas':
    default:
      return <BlankCanvas payload={trigger.payload} />;
  }
};
