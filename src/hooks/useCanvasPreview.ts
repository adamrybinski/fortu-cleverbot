
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
          description: 'Your challenge workspace. Start a new challenge while preserving your previous work, or explore remaining questions from your current challenge.',
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
    
    // New challenge creation trigger (preserve current challenge)
    if (readyForMultiChallenge && agentUsed === 'prospect') {
      setPendingCanvasGuidance(
        "Perfect! I've saved your current challenge and opened your challenge workspace.\n\n" +
        "**Your Options:**\n\n" +
        "**📝 Start New Challenge**\n" +
        "- Begin with a completely different business challenge\n" +
        "- Your previous challenge will remain accessible in the history\n\n" +
        "**🔍 Continue Previous Work**\n" +
        "- Access your saved challenges and their refined questions\n" +
        "- Review and build upon your previous explorations\n\n" +
        "Choose how you'd like to proceed with your challenge exploration!"
      );

      return createCanvasPreviewData('challengeHistory', {
        newChallengeMode: true,
        currentChallenge: refinedChallenge,
        timestamp: new Date().toISOString()
      });
    }
    
    // Question matching trigger (user explicitly requested)
    if (readyForFortu && agentUsed === 'prospect') {
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
