import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasModule } from './CanvasModule';

// -------------------------------
// ✅ ShineBorder component (fixed)
// -------------------------------
interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string | string[];
  className?: string;
  children: React.ReactNode;
}

function ShineBorder({
  borderRadius = 12,
  borderWidth = 2,
  duration = 8,
  color = ["#6EFFC6", "#003079", "#F1EDFF"],
  className = "",
  children,
}: ShineBorderProps) {
  const colorGradient = Array.isArray(color) ? color.join(', ') : color;

  return (
    <div className={`relative p-[${borderWidth}px] ${className}`}>
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 z-0 pointer-events-none rounded-[inherit]"
        style={{
          background: `conic-gradient(${colorGradient})`,
          animation: `spin ${duration}s linear infinite`,
          WebkitMaskImage: 'linear-gradient(#fff 0 0)',
          maskImage: 'linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          borderRadius: `${borderRadius}px`,
        }}
      />
      {/* Content inside the border */}
      <div
        className="relative z-10 bg-white h-full w-full rounded-[inherit]"
        style={{ borderRadius: `${borderRadius}px` }}
      >
        {children}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// -------------------------------
// 📦 CanvasContainer component
// -------------------------------
export interface CanvasTrigger {
  type: string;
  payload?: Record<string, any>;
}

interface CanvasContainerProps {
  onClose: () => void;
  isVisible: boolean;
  trigger: CanvasTrigger | null;
  isMobile?: boolean;
  useShineBorder?: boolean;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  onClose,
  isVisible,
  trigger,
  isMobile = false,
  useShineBorder = false,
}) => {
  if (!isVisible || !trigger) return null;

  const content = (
    <div className="flex flex-col h-full w-full bg-white border-l border-[#6EFFC6]/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#6EFFC6]/20 bg-gradient-to-r from-[#F1EDFF] to-[#EEFFF3] flex-shrink-0">
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

      {/* Canvas Content */}
      <div className="flex-1 w-full overflow-hidden">
        <CanvasModule trigger={trigger} />
      </div>
    </div>
  );

  return useShineBorder ? (
    <div className="h-full w-full p-2">
      <ShineBorder
        borderWidth={2}
        className="border-0 bg-transparent p-0"
        color={["#6EFFC6", "#003079", "#F1EDFF"]}
        duration={8}
        borderRadius={12}
      >
        {content}
      </ShineBorder>
    </div>
  ) : (
    content
  );
};
