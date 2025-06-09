
import React from 'react';
import { PanelRightClose, ArrowLeft, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasQuestionMenu } from '../CanvasQuestionMenu';
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

interface CanvasHeaderProps {
  showChallengeHistory: boolean;
  challengeHistoryLength: number;
  isMobile: boolean;
  questionSessions?: QuestionSessionsHook;
  onClose: () => void;
  onShowChallengeHistory: () => void;
  onCreateNewQuestionSession: () => void;
  onSendMessageToChat?: (message: string) => void;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  showChallengeHistory,
  challengeHistoryLength,
  isMobile,
  questionSessions,
  onClose,
  onShowChallengeHistory,
  onCreateNewQuestionSession,
  onSendMessageToChat
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#6EFFC6]/20 bg-gradient-to-r from-[#F1EDFF] to-[#EEFFF3] flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Question Session Menu - only show if questionSessions is provided and there are multiple sessions */}
        {questionSessions && (
          <CanvasQuestionMenu
            questionSessions={questionSessions.questionSessions}
            activeSessionId={questionSessions.activeSessionId}
            onSwitchToSession={questionSessions.switchToSession}
            onCreateNewSession={onCreateNewQuestionSession}
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
        {!showChallengeHistory && challengeHistoryLength > 0 && (
          <Button
            onClick={onShowChallengeHistory}
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
            <PanelRightClose className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
