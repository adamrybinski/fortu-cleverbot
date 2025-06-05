
import React from 'react';
import { LucideIcon, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  onToggleExpandAll?: () => void;
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
  onGenerateSummary,
  onToggleExpandAll
}) => {
  const hasQuestions = questions.length > 0;
  
  // Check if any questions are expanded to determine button state
  const hasExpandedQuestions = hasQuestions && questions.some(q => expandedQuestions.has(q.id));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <h2 className="text-xl font-semibold text-[#003079]">
            {title}
          </h2>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-[#753BBD]" />
          )}
        </div>
        
        {/* Single Toggle Button */}
        {hasQuestions && onToggleExpandAll && (
          <Button
            onClick={onToggleExpandAll}
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3 border-[#6EFFC6] text-[#003079] hover:bg-[#6EFFC6]/20"
          >
            {hasExpandedQuestions ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Expand All
              </>
            )}
          </Button>
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
