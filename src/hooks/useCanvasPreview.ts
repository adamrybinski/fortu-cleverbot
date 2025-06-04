
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
    
    // PRIMARY TRIGGER: Fortu questions take highest priority when readyForFortu is true
    if (readyForFortu && agentUsed === 'prospect') {
      setPendingCanvasGuidance(
        "Perfect! I've opened the fortu.ai question search for you. You'll see questions matched from our database and AI-generated suggestions.\n\n" +
        "To refine your challenge further:\n" +
        "1. **Click on any question** to read a detailed summary and insights\n" +
        "2. **Select multiple questions** by clicking 'Select Questions' button\n" +
        "3. **Send selected questions back to me** to refine your challenge based on what resonates\n\n" +
        "Explore the questions and let me know which ones catch your attention!"
      );

      return createCanvasPreviewData('fortuQuestions', {
        refinedChallenge: refinedChallenge || message,
        challengeContext: 'user_confirmed',
        searchReady: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Multi-challenge exploration trigger (Stage 7) - only when NOT ready for fortu
    if (readyForMultiChallenge && agentUsed === 'prospect' && !readyForFortu) {
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
    
    // Fallback triggers for explicit requests
    if (agentUsed === 'prospect') {
      if (lowerInput.includes('question') || 
          lowerInput.includes('solution') || 
          lowerInput.includes('example') ||
          lowerInput.includes('what next') ||
          lowerInput.includes('how do we proceed')) {
        return createCanvasPreviewData('fortuQuestions', {
          challengeSummary: refinedChallenge || message,
          challengeContext: 'user_request',
          searchReady: false,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Manual fortu questions trigger
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
