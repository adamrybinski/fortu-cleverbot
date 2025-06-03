
import React from 'react';

interface BlankCanvasProps {
  payload?: Record<string, any>;
}

export const BlankCanvas: React.FC<BlankCanvasProps> = ({ payload }) => {
  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full border-2 border-dashed border-[#6EFFC6]/40 rounded-lg bg-gradient-to-br from-[#F1EDFF]/20 to-[#EEFFF3]/20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6EFFC6]/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-[#6EFFC6]/40"></div>
          </div>
          <h3 className="text-lg font-medium text-[#003079] mb-2">Blank Canvas</h3>
          <p className="text-[#1D253A]/60 text-sm">
            This is your blank canvas area. Drawing tools, shapes, and interactive features will be added here in future iterations.
          </p>
          {payload && (
            <div className="mt-4 p-2 bg-white/50 rounded text-xs text-[#1D253A]/80 max-w-full overflow-auto">
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(payload, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
