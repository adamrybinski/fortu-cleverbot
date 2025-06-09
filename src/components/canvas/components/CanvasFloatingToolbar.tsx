
import React from 'react';
import { SimpleQuestionToolbar } from '../modules/SimpleQuestionToolbar';
import { Question } from '../modules/types';

interface CanvasFloatingToolbarProps {
  showChallengeHistory: boolean;
  hasQuestions: boolean;
  showSelection: boolean;
  selectedQuestions: Question[];
  onToggleSelection: () => void;
  onSendToChat: (questions: Question[]) => void;
  onClearSelections: () => void;
  onSetupFortuInstance: (questions: Question[]) => void;
  onAddAnotherChallenge: () => void;
}

export const CanvasFloatingToolbar: React.FC<CanvasFloatingToolbarProps> = ({
  showChallengeHistory,
  hasQuestions,
  showSelection,
  selectedQuestions,
  onToggleSelection,
  onSendToChat,
  onClearSelections,
  onSetupFortuInstance,
  onAddAnotherChallenge
}) => {
  if (showChallengeHistory || !hasQuestions) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="relative h-full w-full">
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-6 pointer-events-auto">
          <SimpleQuestionToolbar
            showSelection={showSelection}
            selectedQuestions={selectedQuestions}
            onToggleSelection={onToggleSelection}
            onSendToChat={onSendToChat}
            onClearSelections={onClearSelections}
            onSetupFortuInstance={onSetupFortuInstance}
            onAddAnotherChallenge={onAddAnotherChallenge}
          />
        </div>
      </div>
    </div>
  );
};
