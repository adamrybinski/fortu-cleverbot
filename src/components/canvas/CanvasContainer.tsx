
import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasModule } from './CanvasModule';

export interface CanvasTrigger {
  type: string;
  payload?: Record<string, any>;
}

interface CanvasContainerProps {
  onClose: () => void;
  isVisible: boolean;
  trigger: CanvasTrigger | null;
  isMobile?: boolean;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({ 
  onClose, 
  isVisible, 
  trigger,
  isMobile = false
}) => {
  if (!isVisible || !trigger) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-[#6EFFC6]/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#6EFFC6]/20 bg-gradient-to-r from-[#F1EDFF] to-[#EEFFF3]">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-[#003079] hover:bg-white/50 p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h2 className="text-lg font-semibold text-[#003079]">Canvas</h2>
          <span className="text-sm text-[#1D253A]/60 bg-white/50 px-2 py-1 rounded-md">
            {trigger.type}
          </span>
        </div>
        {!isMobile && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-[#003079] hover:bg-white/50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Canvas Content Area */}
      <div className="flex-1 overflow-hidden">
        <CanvasModule trigger={trigger} />
      </div>
    </div>
  );
};
