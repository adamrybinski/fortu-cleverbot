
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, Send, X, Bot, Settings, Zap } from 'lucide-react';
import { Question } from './types';

interface QuestionSelectionToolbarProps {
  showSelection: boolean;
  selectedQuestions: Question[];
  onToggleSelection: () => void;
  onSendToChat: (questions: Question[], action: 'refine' | 'instance' | 'both') => void;
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
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
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
          
          {/* Action Buttons */}
          {selectedQuestions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => onSendToChat(selectedQuestions, 'refine')}
                className="flex-1 bg-[#753BBD] hover:bg-[#753BBD]/90 text-white"
              >
                <Bot className="w-4 h-4 mr-2" />
                Refine Challenge ({selectedQuestions.length})
              </Button>
              
              <Button
                onClick={() => onSendToChat(selectedQuestions, 'instance')}
                variant="outline"
                className="flex-1 border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
              >
                <Settings className="w-4 h-4 mr-2" />
                Setup fortu.ai Instance
              </Button>
              
              <Button
                onClick={() => onSendToChat(selectedQuestions, 'both')}
                variant="outline"
                className="flex-1 border-[#753BBD] text-[#753BBD] hover:bg-[#753BBD]/10"
              >
                <Zap className="w-4 h-4 mr-2" />
                Both
              </Button>
            </div>
          )}
          
          {/* Cancel Button */}
          <div className="flex justify-center">
            <Button
              onClick={onToggleSelection}
              variant="outline"
              className="border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
            >
              <Square className="w-4 h-4 mr-2" />
              Cancel Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
