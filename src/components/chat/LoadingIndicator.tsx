
import React from 'react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start items-start gap-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full shadow-sm overflow-hidden bg-white p-1">
          <img
            src="/lovable-uploads/7fabe412-0da9-4efc-a1d8-ee6ee3349e4d.png"
            alt="CleverBot"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
      <div className="bg-white text-[#1D253A] rounded-lg rounded-bl-sm p-3 shadow-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-[#753BBD] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#753BBD] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#753BBD] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};
