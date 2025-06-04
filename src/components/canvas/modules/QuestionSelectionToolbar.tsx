
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, Send, X } from 'lucide-react';

interface Question {
  id: string | number;
  question: string;
  source: 'fortu' | 'openai';
  selected?: boolean;
}

interface QuestionSelectionToolbarProps {
  showSelection: boolean;
  selectedQuestions: Question[];
  onToggleSelection: () => void;
  onSendToChat: (questions: Question[]) => void;
  onClearSelections: () => void;
}

export const QuestionSelectionToolbar: React.FC<QuestionSelectionToolbarProps> = ({
  showSelection,
  selectedQuestions,
  onToggleSelection,
  onSendToChat,
  onClearSelections
}) => {
  if (!showSelection) {
    return (
      <div className="fixed bottom-6 right-6 z-10">
        <Button
          onClick={onToggleSelection}
          className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white shadow-lg"
        >
          <CheckSquare className="w-4 h-4 mr-2" />
          Select Questions
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 z-10">
      <div className="bg-white/95 backdrop-blur-sm border border-[#6EFFC6]/30 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[#003079] font-medium">
              {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
            </span>
            
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
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onSendToChat(selectedQuestions)}
              disabled={selectedQuestions.length === 0}
              className="bg-[#753BBD] hover:bg-[#753BBD]/90 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to Chat ({selectedQuestions.length})
            </Button>
            
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
  );
};
