import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasModule } from './CanvasModule';
import { cn } from '@/lib/utils';

// ShineBorder Component
interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string | string[];
  className?: string;
  children: React.ReactNode;
}

function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = "#000000",
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
        } as React.CSSProperties
      }
      className={cn(
        "relative grid h-full w-full place-items-center rounded-3xl bg-white p-3 text-black dark:bg-black dark:text-white",
        className,
      )}
    >
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--border-radius": `${borderRadius}px`,
            "--shine-pulse-duration": `${duration}s`,
            "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            "--background-radial-gradient": `radial-gradient(transparent,transparent, ${color instanceof Array ? color.join(",") : color},transparent,transparent)`,
          } as React.CSSProperties
        }
        className={`before:bg-shine-size before:absolute before:inset-0 before:aspect-square before:size-full before:rounded-3xl before:p-[--border-width] before:will-change-[background-position] before:content-[""] before:![-webkit-mask-composite:xor] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:![mask-composite:exclude] before:[mask:--mask-linear-gradient] motion-safe:before:animate-[shine-pulse_var(--shine-pulse-duration)_infinite_linear]`}
      ></div>
      {children}
    </div>
  );
}

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
  useShineBorder = false
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
      {/* Canvas Content Area */}
      <div className="flex-1 w-full overflow-hidden">
        <CanvasModule trigger={trigger} />
      </div>
    </div>
  );

  if (useShineBorder) {
    return (
      <div className="h-full w-full p-2">
        <ShineBorder
          borderWidth={2}
          className="border-0 bg-transparent p-0 rounded-xl"
          color={["#6EFFC6", "#003079", "#F1EDFF"]}
          duration={12}
          borderRadius={12}
        >
          {content}
        </ShineBorder>
      </div>
    );
  }

  return content;
};