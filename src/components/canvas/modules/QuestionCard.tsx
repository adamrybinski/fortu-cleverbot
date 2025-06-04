
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Question {
  id: string | number;
  question: string;
  status?: 'Discovery' | 'Explore' | 'Journey' | 'Equip' | 'AI';
  source: 'fortu' | 'openai';
  selected?: boolean;
}

interface QuestionCardProps {
  question: Question;
  borderColor?: string;
  onClick?: (question: Question) => void;
  onSelectionChange?: (questionId: string | number, selected: boolean) => void;
  showSelection?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Discovery':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Explore':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Journey':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Equip':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'AI':
      return 'bg-[#753BBD]/10 text-[#753BBD] border-[#753BBD]/20';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  borderColor = 'border-[#6EFFC6]/30',
  onClick,
  onSelectionChange,
  showSelection = false
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !showSelection) {
      onClick(question);
    }
  };

  const handleSelectionChange = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(question.id, checked);
    }
  };

  return (
    <div 
      className={`bg-white/70 p-4 rounded-lg border transition-colors ${
        question.selected ? 'border-[#753BBD] bg-[#753BBD]/5' : borderColor
      } ${
        !showSelection && onClick ? 'cursor-pointer hover:bg-white/90 hover:shadow-md hover:border-[#6EFFC6]/50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {showSelection && (
          <Checkbox
            checked={question.selected || false}
            onCheckedChange={handleSelectionChange}
            className="mt-1 border-[#753BBD] data-[state=checked]:bg-[#753BBD] data-[state=checked]:text-white"
          />
        )}
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-[#003079] flex-1 mr-4">
              {question.question}
            </h3>
            {question.status && (
              <Badge 
                variant="outline" 
                className={getStatusColor(question.status)}
              >
                {question.status}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
