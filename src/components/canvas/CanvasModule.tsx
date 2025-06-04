
import React from 'react';
import { CanvasTrigger } from './CanvasContainer';
import { BlankCanvas } from './modules/BlankCanvas';
import { FortuQuestionsCanvas } from './modules/FortuQuestionsCanvas';
import { ChallengeSession } from '@/hooks/useChallengeHistory';

interface Question {
  id: string | number;
  question: string;
  source: 'fortu' | 'openai';
  selected?: boolean;
}

interface ChallengeHistoryHook {
  challengeHistory: ChallengeSession[];
  currentSessionId: string | null;
  getCurrentSession: () => ChallengeSession | null;
  createNewSession: (originalChallenge: string) => string;
  updateSession: (sessionId: string, updates: Partial<ChallengeSession>) => void;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  getUnselectedQuestions: (sessionId: string) => Question[];
  markSessionCompleted: (sessionId: string) => void;
}

interface CanvasModuleProps {
  trigger: CanvasTrigger;
  onSendQuestionsToChat?: (questions: Question[]) => void;
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
    
    case 'challengeMapping':
      return <BlankCanvas payload={trigger.payload} />; // Use BlankCanvas for now, could be specialized later
    
    case 'blank':
    case 'canvas':
    default:
      return <BlankCanvas payload={trigger.payload} />;
  }
};
