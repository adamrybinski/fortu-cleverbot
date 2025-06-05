
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, X, Square } from 'lucide-react';
import { Question } from './types';

interface SimpleQuestionToolbarProps {
  showSelection: boolean;
  selectedQuestions: Question[];
  onToggleSelection: () => void;
  onSendToChat: (questions: Question[]) => void;
  onClearSelections: () => void;
}

export const SimpleQuestionToolbar: React.FC<SimpleQuestionToolbarProps> = ({
  showSelection,
  selectedQuestions,
  onToggleSelection,
  onSendToChat,
  onClearSelections
}) => {
  if (!showSelection) {
    return null;
  }

  return (
    <div className="fixed bottom-6 z-50 w-full">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/95 backdrop-blur-sm border border-[#6EFFC6]/30 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            {/* Selection Count */}
            <span className="text-[#003079] font-medium">
              {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
            </span>
            
            <div className="flex items-center gap-3">
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
              
              {/* Send to Chat */}
              {selectedQuestions.length > 0 && (
                <Button
                  onClick={() => onSendToChat(selectedQuestions)}
                  className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Chat
                </Button>
              )}
              
              {/* Cancel Selection */}
              <Button
                onClick={onToggleSelection}
                variant="outline"
                className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
              >
                <Square className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
