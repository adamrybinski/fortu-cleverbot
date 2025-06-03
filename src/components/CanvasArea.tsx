
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasAreaProps {
  onClose: () => void;
  isVisible: boolean;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({ onClose, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-[#6EFFC6]/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#6EFFC6]/20 bg-gradient-to-r from-[#F1EDFF] to-[#EEFFF3]">
        <h2 className="text-lg font-semibold text-[#003079]">Canvas</h2>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-[#003079] hover:bg-white/50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas Area - Placeholder */}
      <div className="flex-1 p-6">
        <div className="w-full h-full border-2 border-dashed border-[#6EFFC6]/40 rounded-lg bg-gradient-to-br from-[#F1EDFF]/20 to-[#EEFFF3]/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6EFFC6]/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#6EFFC6]/40"></div>
            </div>
            <h3 className="text-lg font-medium text-[#003079] mb-2">Canvas Ready</h3>
            <p className="text-[#1D253A]/60 text-sm max-w-sm">
              This is your blank canvas area. Drawing tools, shapes, and interactive features will be added here in future iterations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
