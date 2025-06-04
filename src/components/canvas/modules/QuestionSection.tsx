
import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { EmptyState } from './EmptyState';

interface Question {
  id: string | number;
  question: string;
  status?: 'Discovery' | 'Explore' | 'Journey' | 'Equip' | 'AI';
  source: 'fortu' | 'openai';
}

interface QuestionSectionProps {
  title: string;
  icon: LucideIcon;
  questions: Question[];
  isLoading: boolean;
  emptyMessage: string;
  borderColor?: string;
  iconColor?: string;
  emptyIconColor?: string;
}

export const QuestionSection: React.FC<QuestionSectionProps> = ({
  title,
  icon: Icon,
  questions,
  isLoading,
  emptyMessage,
  borderColor = 'border-[#6EFFC6]/30',
  iconColor = 'text-[#003079]',
  emptyIconColor = 'text-[#6EFFC6]'
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
            <QuestionCard 
              key={question.id} 
              question={question}
              borderColor={borderColor}
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
