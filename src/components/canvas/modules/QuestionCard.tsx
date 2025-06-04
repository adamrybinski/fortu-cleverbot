
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: string | number;
  question: string;
  status?: 'Discovery' | 'Explore' | 'Journey' | 'Equip' | 'AI';
  source: 'fortu' | 'openai';
}

interface QuestionCardProps {
  question: Question;
  borderColor?: string;
  onClick?: (question: Question) => void;
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
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(question);
    }
  };

  return (
    <div 
      className={`bg-white/70 p-4 rounded-lg border ${borderColor} hover:bg-white/90 transition-colors ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-[#6EFFC6]/50' : ''
      }`}
      onClick={handleClick}
    >
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
  );
};
