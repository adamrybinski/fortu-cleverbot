
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
          description: 'Discover relevant questions and insights from our database of business challenges. Explore proven approaches to your refined challenge.',
          payload
        };
      case 'challengeHistory':
        return {
          type: 'challengeHistory',
          title: 'Challenge History',
          description: 'View your previous challenges and explore remaining questions or start new challenges.',
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
    
    // Multi-challenge exploration trigger (Stage 7) - highest priority when ready
    if (readyForMultiChallenge && agentUsed === 'prospect') {
      setPendingCanvasGuidance(
        "Excellent! You now have multiple options to continue your challenge exploration:\n\n" +
        "**Option 1: Explore Remaining Questions**\n" +
        "- Review questions from your previous canvas session that you didn't select\n" +
        "- Dive deeper into alternative approaches for the same challenge area\n\n" +
        "**Option 2: Start a Completely New Challenge**\n" +
        "- Begin fresh with a different business challenge you're facing\n" +
        "- Build a comprehensive challenge bank for your organisation\n\n" +
        "Click the History button in the canvas to see your previous challenges and choose your next exploration path!"
      );

      return createCanvasPreviewData('challengeHistory', {
        multiChallengeMode: true,
        previousChallenge: refinedChallenge,
        timestamp: new Date().toISOString()
      });
    }
    
    // Manual fortu questions trigger (explicit user request only)
    if (lowerInput.includes('fortu questions') || lowerInput.includes('search questions')) {
      return createCanvasPreviewData('fortuQuestions', {
        challengeSummary: message,
        searchReady: false,
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
