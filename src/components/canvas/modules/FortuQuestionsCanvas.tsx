
import React from 'react';

interface FortuQuestionsCanvasProps {
  payload?: Record<string, any>;
}

export const FortuQuestionsCanvas: React.FC<FortuQuestionsCanvasProps> = ({ payload }) => {
  return (
    <div className="w-full h-full p-6">
      <div className="w-full h-full bg-gradient-to-br from-[#F1EDFF] to-[#EEFFF3] rounded-lg border border-[#6EFFC6]/30 p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#753BBD]/10 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#753BBD]/20 flex items-center justify-center">
              <span className="text-[#753BBD] font-bold text-lg">?</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-[#003079] mb-3">Fortune Questions</h3>
          <p className="text-[#1D253A]/70 text-sm max-w-md mx-auto mb-6">
            Interactive question module for exploring insights and possibilities. 
            This module will be expanded with dynamic questions and responses.
          </p>
          
          {payload?.challengeSummary && (
            <div className="bg-white/80 rounded-lg p-4 text-left max-w-md mx-auto">
              <h4 className="font-medium text-[#003079] mb-2">Challenge Summary:</h4>
              <p className="text-[#1D253A]/80 text-sm">{payload.challengeSummary}</p>
            </div>
          )}
          
          <div className="mt-6 space-y-2">
            <div className="w-full h-2 bg-[#6EFFC6]/20 rounded-full">
              <div className="w-1/3 h-full bg-[#6EFFC6] rounded-full"></div>
            </div>
            <p className="text-xs text-[#1D253A]/60">Module ready for expansion</p>
          </div>
        </div>
      </div>
    </div>
  );
};
