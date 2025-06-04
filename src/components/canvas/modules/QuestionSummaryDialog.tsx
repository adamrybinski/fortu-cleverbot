
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Database, Bot } from 'lucide-react';
import { Question } from './types';

interface QuestionSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  summary: string | null;
  isLoading: boolean;
}

export const QuestionSummaryDialog: React.FC<QuestionSummaryDialogProps> = ({
  isOpen,
  onClose,
  question,
  summary,
  isLoading
}) => {
  if (!question) return null;

  const Icon = question.source === 'fortu' ? Database : Bot;
  const sourceLabel = question.source === 'fortu' ? 'fortu.ai' : 'CleverBot';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[#003079]">
            <Icon className="w-5 h-5 text-[#753BBD]" />
            Question Insights
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-[#F1EDFF]/50 p-4 rounded-lg border border-[#6EFFC6]/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-[#753BBD]">
                From {sourceLabel}
              </span>
            </div>
            <p className="font-medium text-[#003079]">
              {question.question}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#6EFFC6]/20">
            <h3 className="font-semibold text-[#003079] mb-3">Summary</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#753BBD]" />
                <span className="ml-2 text-[#1D253A]/70">
                  Generating insights...
                </span>
              </div>
            ) : summary ? (
              <p className="text-[#1D253A] leading-relaxed">
                {summary}
              </p>
            ) : (
              <p className="text-[#1D253A]/60">
                No summary available.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
