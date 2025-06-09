import { ChallengeSession } from '@/hooks/useChallengeHistory';

export interface Question {
  id: string | number;
  question: string;
  source: 'fortu' | 'openai';
  selected?: boolean;
  status?: 'Discovery' | 'Explore' | 'Journey' | 'Equip' | 'AI' | 'Pre-approved';
}

export interface ChallengeHistoryHook {
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
