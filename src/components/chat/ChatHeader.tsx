
import React from 'react';

export const ChatHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#F1EDFF]/30 flex-shrink-0">
      <h1 className="text-xl font-semibold text-[#003079]">CleverBot</h1>
      <span className="text-xs text-[#1D253A]/60 bg-white/50 px-2 py-1 rounded-md">
        ICS Consultant
      </span>
    </div>
  );
};
