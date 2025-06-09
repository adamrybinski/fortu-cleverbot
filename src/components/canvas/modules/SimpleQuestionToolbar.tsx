
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, X, Building2, Plus } from 'lucide-react';
import { Question } from './types';

interface SimpleQuestionToolbarProps {
  showSelection: boolean;
  selectedQuestions: Question[];
  onToggleSelection: () => void;
  onSendToChat: (questions: Question[]) => void;
  onClearSelections: () => void;
  onSetupFortuInstance?: (questions: Question[]) => void;
  onAddAnotherChallenge?: () => void;
}

export const SimpleQuestionToolbar: React.FC<SimpleQuestionToolbarProps> = ({
  showSelection,
  selectedQuestions,
  onToggleSelection,
  onSendToChat,
  onClearSelections,
  onSetupFortuInstance,
  onAddAnotherChallenge
}) => {
  if (!showSelection) {
    return null;
  }

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-6">
      <div className="bg-white/95 backdrop-blur-sm border border-[#6EFFC6]/30 rounded-lg p-4 shadow-lg">
        <div className="space-y-4">
          {/* Selection Count */}
          <div className="text-center">
            <span className="text-[#003079] font-medium">
              {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Workflow Options */}
          <div className="space-y-3">
            <div className="text-sm text-[#1D253A] text-center">
              <p className="font-medium mb-2">Next Steps:</p>
              <p>
                Would you like to <strong>setup a fortu.ai instance</strong> and load in your refined challenge 
                with the matched questions plus AI suggested questions? These questions will be stored as 
                "Pre-approved" status for you to edit, approve, or reject.
              </p>
              <p className="mt-2">
                Alternatively, you can <strong>add another challenge</strong> to explore additional questions 
                through the same flow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Setup fortu.ai Instance */}
              {onSetupFortuInstance && (
                <Button
                  onClick={() => onSetupFortuInstance(selectedQuestions)}
                  className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white flex-1 sm:flex-none"
                  disabled={selectedQuestions.length === 0}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Setup fortu.ai Instance
                </Button>
              )}

              {/* Add Another Challenge */}
              {onAddAnotherChallenge && (
                <Button
                  onClick={onAddAnotherChallenge}
                  variant="outline"
                  className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20 flex-1 sm:flex-none"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Challenge
                </Button>
              )}
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center justify-between border-t border-[#6EFFC6]/20 pt-3">
            {/* Clear Selection */}
            {selectedQuestions.length > 0 && (
              <Button
                onClick={onClearSelections}
                variant="outline"
                size="sm"
                className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}

            {/* Legacy Send to Chat (as fallback) */}
            {selectedQuestions.length > 0 && (
              <Button
                onClick={() => onSendToChat(selectedQuestions)}
                variant="outline"
                size="sm"
                className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
              >
                <Send className="w-4 h-4 mr-1" />
                Send to Chat
              </Button>
            )}
            
            {/* Cancel Selection */}
            <Button
              onClick={onToggleSelection}
              variant="outline"
              size="sm"
              className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
