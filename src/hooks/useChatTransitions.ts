
import { useEffect } from 'react';

interface UseChatTransitionsProps {
  isCanvasOpen?: boolean;
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
  setShouldAutoScroll: (value: boolean) => void;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  savedScrollPosition: React.MutableRefObject<number>;
}

export const useChatTransitions = ({
  isCanvasOpen,
  isTransitioning,
  setIsTransitioning,
  setShouldAutoScroll,
  messagesContainerRef,
  savedScrollPosition,
}: UseChatTransitionsProps) => {
  // Handle canvas transition with scroll position preservation
  useEffect(() => {
    if (isTransitioning) return; // Prevent multiple simultaneous transitions

    // Capture current scroll position
    if (messagesContainerRef.current) {
      savedScrollPosition.current = messagesContainerRef.current.scrollTop;
    }

    // Start transition
    setIsTransitioning(true);
    setShouldAutoScroll(false);

    // Phase 1: Show overlay (100ms)
    const phase1Timer = setTimeout(() => {
      // Canvas transition happens here (handled by CSS)
    }, 100);

    // Phase 2: Restore scroll position and hide overlay (500ms total)
    const phase2Timer = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = savedScrollPosition.current;
      }
      setIsTransitioning(false);
      setShouldAutoScroll(true);
    }, 500);

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
    };
  }, [isCanvasOpen]);
};
