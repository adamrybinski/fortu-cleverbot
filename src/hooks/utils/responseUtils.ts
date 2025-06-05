
import { CanvasPreviewData } from '@/components/chat/types';

export const enhanceAssistantText = (
  assistantText: string,
  readyForFortuInstance: boolean,
  refinedChallenge: string,
  canvasPreviewData: CanvasPreviewData | null
): string => {
  let enhancedText = assistantText;

  // Handle fortu.ai instance guidance (when user selects what to submit)
  if (readyForFortuInstance && refinedChallenge) {
    enhancedText += `\n\n**🎯 Ready for fortu.ai Instance Setup**\n\n` +
      "Perfect! Based on your selection, here's what you'll submit to your fortu.ai instance:\n\n" +
      `**Your Challenge:** "${refinedChallenge}"\n\n` +
      "**Next Step:** Take this to your fortu.ai instance to find specific, actionable solutions from organisations that have successfully tackled this exact challenge.";
  }

  // Add canvas guidance text
  if (canvasPreviewData) {
    if (canvasPreviewData.type === 'fortuQuestions') {
      enhancedText += "\n\nI've opened the question explorer below where you can browse relevant approaches from our database. Select the questions that best align with your challenge to help me create the perfect refined statement for your fortu.ai instance.";
    } else {
      enhancedText += "\n\nI've set up a blank canvas for you. Click the expand button below to open it and start visualising your ideas.";
    }
  }

  return enhancedText;
};

export const processApiResponse = (data: any) => {
  const assistantText = data.response;
  const agentUsed = data.agentUsed;
  const readyForFortu = data.readyForFortu;
  const readyForFortuInstance = data.readyForFortuInstance;
  const refinedChallenge = data.refinedChallenge;

  console.log('🔄 Message Handler - Response data:', {
    agentUsed,
    readyForFortu,
    readyForFortuInstance,
    refinedChallenge
  });

  return {
    assistantText,
    agentUsed,
    readyForFortu,
    readyForFortuInstance,
    refinedChallenge
  };
};
