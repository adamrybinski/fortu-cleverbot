
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Loader2, Database, Bot } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Question } from './types';

interface ExpandableQuestionCardProps {
  question: Question;
  borderColor?: string;
  onSelectionChange?: (questionId: string | number, selected: boolean) => void;
  showSelection?: boolean;
  onGenerateSummary?: (question: Question) => void;
  summary?: string | null;
  isLoadingSummary?: boolean;
  isExpanded?: boolean;
  onToggleExpansion?: (questionId: string | number) => void;
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

export const ExpandableQuestionCard: React.FC<ExpandableQuestionCardProps> = ({ 
  question, 
  borderColor = 'border-[#6EFFC6]/30',
  onSelectionChange,
  showSelection = false,
  onGenerateSummary,
  summary,
  isLoadingSummary = false,
  isExpanded = false,
  onToggleExpansion
}) => {
  const handleSelectionChange = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(question.id, checked);
    }
  };

  const handleToggleExpansion = () => {
    if (onToggleExpansion) {
      onToggleExpansion(question.id);
      // Generate summary when expanding if not already loaded
      if (!isExpanded && !summary && !isLoadingSummary && onGenerateSummary) {
        onGenerateSummary(question);
      }
    }
  };

  const Icon = question.source === 'fortu' ? Database : Bot;
  const sourceLabel = question.source === 'fortu' ? 'fortu.ai' : 'CleverBot';

  return (
    <Collapsible open={isExpanded} onOpenChange={handleToggleExpansion}>
      <div 
        className={`bg-white/70 rounded-lg border transition-colors ${
          question.selected ? 'border-[#753BBD] bg-[#753BBD]/5' : borderColor
        }`}
      >
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-white/90 transition-colors">
            <div className="flex items-start gap-3">
              {showSelection && (
                <Checkbox
                  checked={question.selected || false}
                  onCheckedChange={handleSelectionChange}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 border-[#753BBD] data-[state=checked]:bg-[#753BBD] data-[state=checked]:text-white"
                />
              )}
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-[#003079] flex-1 mr-4">
                    {question.question}
                  </h3>
                  <div className="flex items-center gap-2">
                    {question.status && (
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(question.status)}
                      >
                        {question.status}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#753BBD]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#753BBD]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="px-4 pb-4">
            <div className="bg-[#F1EDFF]/50 p-4 rounded-lg border border-[#6EFFC6]/30 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-[#753BBD]" />
                <span className="text-sm font-medium text-[#753BBD]">
                  Insights from {sourceLabel}
                </span>
              </div>
              
              {isLoadingSummary ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-[#753BBD]" />
                  <span className="ml-2 text-[#1D253A]/70">
                    Generating insights...
                  </span>
                </div>
              ) : summary ? (
                <p className="text-[#1D253A] leading-relaxed text-sm">
                  {summary}
                </p>
              ) : (
                <p className="text-[#1D253A]/60 text-sm">
                  Click to load insights for this question.
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
