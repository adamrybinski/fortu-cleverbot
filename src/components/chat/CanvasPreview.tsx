"use client";

import React from 'react';
import { CanvasPreviewData } from './types';
import { Button } from '@/components/ui/button';
import { Maximize2, Square, HelpCircle, Target } from 'lucide-react';
import { ShineBorder } from '@/components/ui/shine-border';

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

  const getShineColors = () => {
    switch (canvasData.type) {
      case 'fortuQuestions':
        return ['#753BBD', '#E0BBFF', '#D8B4F8'];
      case 'challengeMapping':
        return ['#003079', '#89B4F8', '#F1EDFF'];
      case 'blank':
      case 'canvas':
      default:
        return ['#6EFFC6', '#EEFFF3', '#C3FFE4'];
    }
  };

  return (
    <div className="mt-4">
      <ShineBorder
        borderRadius={12}
        borderWidth={2}
        duration={10}
        color={getShineColors()}
        className="rounded-lg"
      >
        <div className="p-4 bg-white/90 dark:bg-black/30 rounded-lg w-full">
          <div className="flex items-start gap-3">
            {/* Canvas Icon */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mt-0.5">
              {getCanvasIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-[#003079] text-sm mb-1">
                {canvasData.title}
              </h4>
              <p className="text-[#1D253A]/70 text-xs leading-relaxed mb-2">
                {canvasData.description}
              </p>

              {/* Challenge Mapping info */}
              {canvasData.type === 'challengeMapping' && canvasData.payload?.originalChallenge && (
                <div className="bg-white/60 rounded p-2 text-xs text-[#1D253A]/80 mb-2">
                  <span className="font-medium">Working on: </span>
                  <span className="line-clamp-2">{canvasData.payload.originalChallenge}</span>
                  {canvasData.payload.refinementStage === 'early' && (
                    <div className="mt-1 text-[#753BBD] font-medium">• Challenge refinement in progress</div>
                  )}
                </div>
              )}

              {/* Fortu Questions info */}
              {canvasData.type === 'fortuQuestions' && (
                <div className="bg-white/60 rounded p-2 text-xs text-[#1D253A]/80 mb-2">
                  {canvasData.payload?.searchReady ? (
                    <>
                      <span className="font-medium text-[#753BBD]">✓ Search Ready: </span>
                      <span className="line-clamp-2">{canvasData.payload.refinedChallenge}</span>
                      <div className="mt-1 text-[#753BBD] font-medium">• Matching questions available</div>
                    </>
                  ) : canvasData.payload?.challengeSummary ? (
                    <>
                      <span className="font-medium">Challenge: </span>
                      <span className="line-clamp-2">{canvasData.payload.challengeSummary}</span>
                      <div className="mt-1 text-[#1D253A]/60">• Complete refinement to unlock search</div>
                    </>
                  ) : (
                    <div className="text-[#1D253A]/60">• Fortune questions module ready</div>
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
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </ShineBorder>
    </div>
  );
};
