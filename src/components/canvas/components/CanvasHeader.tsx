
import React from 'react';
import { PanelRightClose, ArrowLeft, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasQuestionMenu } from '../CanvasQuestionMenu';
import { CanvasTrigger } from '../CanvasContainer';
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
  activeModule: 'questions' | 'setup';
  challengeHistoryLength: number;
  isMobile: boolean;
  trigger: CanvasTrigger | null;
  questionSessions?: QuestionSessionsHook;
  onClose: () => void;
  onShowChallengeHistory: () => void;
  onCreateNewQuestionSession: () => void;
  onModuleSwitch: (moduleType: 'questions' | 'setup') => void;
  onSendMessageToChat?: (message: string) => void;
}

export const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  showChallengeHistory,
  activeModule,
  challengeHistoryLength,
  isMobile,
  trigger,
  questionSessions,
  onClose,
  onShowChallengeHistory,
  onCreateNewQuestionSession,
  onModuleSwitch,
  onSendMessageToChat
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#6EFFC6]/20 bg-gradient-to-r from-[#F1EDFF] to-[#EEFFF3] flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Canvas Menu - show if questionSessions is provided and menu should be visible */}
        {questionSessions && (
          <CanvasQuestionMenu
            questionSessions={questionSessions.questionSessions}
            activeSessionId={questionSessions.activeSessionId}
            onSwitchToSession={questionSessions.switchToSession}
            onCreateNewSession={onCreateNewQuestionSession}
            onDeleteSession={questionSessions.deleteSession}
            onSendMessageToChat={onSendMessageToChat}
            currentTriggerType={trigger?.type}
            onSwitchToModule={onModuleSwitch}
            activeModule={activeModule}
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
          {showChallengeHistory ? 'Challenge History' : 
           activeModule === 'setup' ? 'Fortu.ai Setup' : 'Canvas'}
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
