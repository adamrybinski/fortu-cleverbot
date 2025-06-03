
import { useState, useCallback } from 'react';
import { CanvasTrigger } from '@/components/canvas/CanvasContainer';

export const useCanvas = () => {
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<CanvasTrigger | null>(null);

  const triggerCanvas = useCallback((trigger: CanvasTrigger) => {
    console.log('Triggering canvas with:', trigger);
    setCurrentTrigger(trigger);
    setIsCanvasOpen(true);
  }, []);

  const closeCanvas = useCallback(() => {
    setIsCanvasOpen(false);
    setCurrentTrigger(null);
  }, []);

  const openCanvas = useCallback((type = 'blank', payload = {}) => {
    triggerCanvas({ type, payload });
  }, [triggerCanvas]);

  return {
    isCanvasOpen,
    currentTrigger,
    triggerCanvas,
    closeCanvas,
    openCanvas
  };
};
