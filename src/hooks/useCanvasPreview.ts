
import { useState } from 'react';
import { CanvasPreviewData } from '@/components/chat/types';

export const useCanvasPreview = () => {
  const [hasCanvasBeenTriggered, setHasCanvasBeenTriggered] = useState(false);
  const [pendingCanvasGuidance, setPendingCanvasGuidance] = useState<string | null>(null);

  const createCanvasPreviewData = (type: string, payload: Record<string, any>): CanvasPreviewData => {
    switch (type) {
      case 'fortuQuestions':
        return {
          type: 'fortuQuestions',
          title: 'fortu.ai Question Search',
          description: 'Discover relevant questions and insights from our database of business challenges. Select the most relevant ones to refine your challenge.',
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
    refinedChallenge?: string
  ): CanvasPreviewData | null => {
    const lowerInput = message.toLowerCase();
    
    // Auto-trigger fortu questions search (simplified flow step 3)
    if (readyForFortu && agentUsed === 'prospect') {
      setPendingCanvasGuidance(
        "Perfect! I've found relevant questions and approaches from organisations that have tackled similar challenges.\n\n" +
        "**Your Next Step:**\n\n" +
        "Browse through the matched questions from fortu.ai and AI suggestions. Select the ones that resonate most with your situation - these will help me create a refined, ultra-specific challenge statement for your fortu.ai instance.\n\n" +
        "Take your time exploring the options and select the questions that best align with your goals."
      );

      return createCanvasPreviewData('fortuQuestions', {
        refinedChallenge: refinedChallenge,
        searchReady: true,
        timestamp: new Date().toISOString()
      });
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
    createCanvasPreviewData,
    shouldCreateCanvasPreview
  };
};
