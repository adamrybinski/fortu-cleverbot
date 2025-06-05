
import { QuestionSession } from '../useQuestionSessions';

interface QuestionSessionsHook {
  questionSessions: QuestionSession[];
  activeSessionId: string | null;
  getActiveSession: () => QuestionSession | null;
  createNewSession: (question: string) => string;
  updateSession: (sessionId: string, updates: Partial<QuestionSession>) => void;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
}

export const handleSessionManagement = (
  readyForFortu: boolean,
  refinedChallenge: string,
  questionSessions?: QuestionSessionsHook
) => {
  // Create new session when ready for fortu search
  if (readyForFortu && refinedChallenge && questionSessions) {
    console.log('🚀 Creating new session for fortu search:', refinedChallenge);
    const sessionId = questionSessions.createNewSession(refinedChallenge);
    questionSessions.updateSession(sessionId, {
      refinedChallenge,
      status: 'searching'
    });
  }

  // Update active session with refined challenge if we have one but session already exists
  if (refinedChallenge && questionSessions?.activeSessionId && !readyForFortu) {
    console.log('📝 Updating existing session with refined challenge:', refinedChallenge);
    questionSessions.updateSession(questionSessions.activeSessionId, {
      refinedChallenge
    });
  }
};
