
import React from 'react';
import { CanvasPreviewData } from './types';
import { Button } from '@/components/ui/button';
import { Expand, Square, HelpCircle, Target } from 'lucide-react';

interface CanvasPreviewProps {
  canvasData: CanvasPreviewData;
  onExpand: () => void;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({ canvasData, onExpand }) => {
  const getCanvasIcon = () => {
    switch (canvasData.type) {
      case 'fortuQuestions':
        return <HelpCircle className="w-5 h-5 text-[#753BBD]" />;
      case 'challengeMapping':
        return <Target className="w-5 h-5 text-[#003079]" />;
      case 'blank':
      case 'canvas':
      default:
        return <Square className="w-5 h-5 text-[#6EFFC6]" />;
    }
  };

  const getCanvasColor = () => {
    switch (canvasData.type) {
      case 'fortuQuestions':
        return 'border-[#753BBD]/20 bg-gradient-to-r from-[#753BBD]/5 to-[#F1EDFF]/20';
      case 'challengeMapping':
        return 'border-[#003079]/20 bg-gradient-to-r from-[#003079]/5 to-[#F1EDFF]/20';
      case 'blank':
      case 'canvas':
      default:
        return 'border-[#6EFFC6]/20 bg-gradient-to-r from-[#6EFFC6]/5 to-[#EEFFF3]/20';
    }
  };

  const getCanvasTitle = () => {
    switch (canvasData.type) {
      case 'fortuQuestions':
        return 'Question Search added to Canvas';
      default:
        return canvasData.title;
    }
  };

  const getCanvasDescription = () => {
    switch (canvasData.type) {
      case 'fortuQuestions':
        return 'Browse relevant questions and select the ones that best match your challenge.';
      default:
        return canvasData.description;
    }
  };

  return (
    <div className={`mt-3 p-3 rounded-lg border ${getCanvasColor()} transition-all hover:shadow-sm`}>
      <div className="flex items-start gap-3">
        {/* Canvas Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mt-0.5">
          {getCanvasIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[#003079] text-sm mb-1">{getCanvasTitle()}</h4>
          <p className="text-[#1D253A]/70 text-xs leading-relaxed mb-2">{getCanvasDescription()}</p>
          
          {/* Enhanced info for Challenge Mapping only */}
          {canvasData.type === 'challengeMapping' && canvasData.payload?.originalChallenge && (
            <div className="bg-white/60 rounded p-2 text-xs text-[#1D253A]/80 mb-2">
              <span className="font-medium">Working on: </span>
              <span className="line-clamp-2">{canvasData.payload.originalChallenge}</span>
              {canvasData.payload.refinementStage === 'early' && (
                <div className="mt-1 text-[#753BBD] font-medium">• Challenge refinement in progress</div>
              )}
            </div>
          )}
        </div>

        {/* Expand Button */}
        <Button
          onClick={onExpand}
          variant="ghost"
          size="sm"
          className="flex-shrink-0 text-[#753BBD] hover:bg-[#753BBD]/10 hover:text-[#753BBD] p-2"
        >
          <Expand className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
