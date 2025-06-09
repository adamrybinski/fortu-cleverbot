
import { useState } from 'react';
import { CanvasPreviewData } from '@/components/chat/types';

export const useCanvasPreview = () => {
  const [hasCanvasBeenTriggered, setHasCanvasBeenTriggered] = useState(false);
  const [pendingCanvasGuidance, setPendingCanvasGuidance] = useState<string | null>(null);
  const [shouldAutoOpenCanvas, setShouldAutoOpenCanvas] = useState(false);

  const createCanvasPreviewData = (type: string, payload: Record<string, any>): CanvasPreviewData => {
    switch (type) {
      case 'fortuQuestions':
        return {
          type: 'fortuQuestions',
          title: 'fortu.ai Question Search',
          description: 'Discover relevant questions and insights from our database of business challenges. Select the most relevant ones to refine your challenge.',
          payload
        };
      case 'fortuInstanceSetup':
        return {
          type: 'fortuInstanceSetup',
          title: 'fortu.ai Instance Setup',
          description: 'Configure your personalised fortu.ai workspace with branding, colours, and settings tailored to your organisation.',
          payload
        };
      case 'blank':
      case 'canvas':
      default:
        return {
          type: 'blank',
          title: 'Blank Canvas Created',
          description: 'A blank canvas for drawing, brainstorming, and visual thinking. Click to expand and start creating.',
          payload
        };
    }
  };

  const shouldCreateCanvasPreview = (
    message: string, 
    agentUsed?: string, 
    readyForFortu?: boolean, 
    readyForMultiChallenge?: boolean,
    refinedChallenge?: string,
    onTriggerCanvas?: (trigger: any) => void
  ): CanvasPreviewData | null => {
    const lowerInput = message.toLowerCase();
    
    // Auto-trigger fortu questions search (simplified flow step 3)
    if (readyForFortu && agentUsed === 'prospect') {
      console.log('Auto-triggering canvas for fortu questions search');
      
      // Remove the duplicative pending guidance since the canvas UI provides sufficient guidance
      // setPendingCanvasGuidance is no longer needed here
      
      const canvasData = createCanvasPreviewData('fortuQuestions', {
        refinedChallenge: refinedChallenge,
        searchReady: true,
        timestamp: new Date().toISOString()
      });

      // Auto-open the canvas instead of just showing preview
      if (onTriggerCanvas) {
        console.log('Auto-opening canvas for fortu questions');
        setShouldAutoOpenCanvas(true);
        setTimeout(() => {
          onTriggerCanvas({
            type: 'fortuQuestions',
            payload: canvasData.payload
          });
        }, 100);
      }

      return canvasData;
    }

    // Check for fortu instance setup trigger
    if (lowerInput.includes('set up fortu.ai instance') || 
        lowerInput.includes('setup fortu') || 
        lowerInput.includes('create fortu.ai instance')) {
      console.log('Triggering canvas for fortu instance setup');
      
      const canvasData = createCanvasPreviewData('fortuInstanceSetup', {
        refinedChallenge: refinedChallenge,
        timestamp: new Date().toISOString()
      });

      // Auto-open the canvas for setup
      if (onTriggerCanvas) {
        console.log('Auto-opening canvas for fortu instance setup');
        setShouldAutoOpenCanvas(true);
        setTimeout(() => {
          onTriggerCanvas({
            type: 'fortuInstanceSetup',
            payload: canvasData.payload
          });
        }, 100);
      }

      return canvasData;
    }
    
    // General canvas trigger (blank canvas only)
    if (lowerInput.includes('open canvas') || lowerInput.includes('blank canvas')) {
      return createCanvasPreviewData('blank', { 
        source: 'chat_trigger',
        timestamp: new Date().toISOString()
      });
    }
    
    return null;
  };

  return {
    hasCanvasBeenTriggered,
    setHasCanvasBeenTriggered,
    pendingCanvasGuidance,
    setPendingCanvasGuidance,
    shouldAutoOpenCanvas,
    setShouldAutoOpenCanvas,
    createCanvasPreviewData,
    shouldCreateCanvasPreview
  };
};
