
import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { ExpandableQuestionCard } from './ExpandableQuestionCard';
import { EmptyState } from './EmptyState';
import { Question } from './types';

interface QuestionSectionProps {
  title: string;
  icon: LucideIcon;
  questions: Question[];
  isLoading: boolean;
  emptyMessage: string;
  borderColor?: string;
  iconColor?: string;
  emptyIconColor?: string;
  onSelectionChange?: (questionId: string | number, selected: boolean) => void;
  showSelection?: boolean;
  expandedQuestions?: Set<string | number>;
  questionSummaries?: Record<string | number, string>;
  loadingSummaries?: Set<string | number>;
  onToggleExpansion?: (questionId: string | number) => void;
  onGenerateSummary?: (question: Question) => void;
}

export const QuestionSection: React.FC<QuestionSectionProps> = ({
  title,
  icon: Icon,
  questions,
  isLoading,
  emptyMessage,
  borderColor = 'border-[#6EFFC6]/30',
  iconColor = 'text-[#003079]',
  emptyIconColor = 'text-[#6EFFC6]',
  onSelectionChange,
  showSelection = false,
  expandedQuestions = new Set(),
  questionSummaries = {},
  loadingSummaries = new Set(),
  onToggleExpansion,
  onGenerateSummary
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h2 className="text-xl font-semibold text-[#003079]">
          {title}
        </h2>
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-[#753BBD]" />
        )}
      </div>
      
      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((question) => (
            <ExpandableQuestionCard 
              key={question.id} 
              question={question}
              borderColor={borderColor}
              onSelectionChange={onSelectionChange}
              showSelection={showSelection}
              isExpanded={expandedQuestions.has(question.id)}
              onToggleExpansion={onToggleExpansion}
              onGenerateSummary={onGenerateSummary}
              summary={questionSummaries[question.id]}
              isLoadingSummary={loadingSummaries.has(question.id)}
            />
          ))}
        </div>
      ) : !isLoading && (
        <EmptyState 
          icon={Icon}
          message={emptyMessage}
          iconColor={emptyIconColor}
        />
      )}
    </div>
  );
};
