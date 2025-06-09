// Simplified detection functions for the 4-step flow

export function isReadyForFortuQuestions(
  response: string, 
  conversationHistory: any[], 
  userMessage: string
): boolean {
  const lowerResponse = response.toLowerCase();
  const lowerMessage = userMessage.toLowerCase();
  
  console.log('Checking readiness for fortu questions:');
  console.log('- Conversation history length:', conversationHistory.length);
  console.log('- User message:', userMessage);
  console.log('- Bot response contains fortu search promise:', 
    lowerResponse.includes('i\'ve searched fortu') || 
    lowerResponse.includes('searched fortu.ai and found') || 
    lowerResponse.includes('found') && lowerResponse.includes('matched questions') ||
    lowerResponse.includes('below in the canvas')
  );

  // Auto-trigger after HDW confirmation - look for detailed canvas guidance
  const hasFortuSearchComplete = 
    lowerResponse.includes('i\'ve searched fortu') ||
    lowerResponse.includes('searched fortu.ai and found') ||
    (lowerResponse.includes('found') && lowerResponse.includes('matched questions')) ||
    lowerResponse.includes('below in the canvas') ||
    lowerResponse.includes('explore these questions') ||
    lowerResponse.includes('select the ones that resonate') ||
    lowerResponse.includes('generated') && lowerResponse.includes('additional suggested questions');

  // User confirmed HDW question (simple yes/no or confirmation)
  const userConfirmedHDW = 
    lowerMessage.includes('yes') ||
    lowerMessage.includes('correct') ||
    lowerMessage.includes('right') ||
    lowerMessage.includes('accurate') ||
    lowerMessage.includes('that works') ||
    lowerMessage.includes('looks good') ||
    (lowerMessage.length < 30 && !lowerMessage.includes('no'));

  // Don't trigger if user is sending selected questions back from canvas
  const isCanvasReturn = 
    lowerMessage.includes('selected questions') ||
    lowerMessage.includes('canvas for challenge refinement') ||
    lowerMessage.includes('from the canvas');

  if (hasFortuSearchComplete && userConfirmedHDW && !isCanvasReturn) {
    console.log('Auto-triggering fortu search after HDW confirmation');
    return true;
  }

  console.log('Ready for fortu questions:', false);
  return false;
}

export const isReadyForFortuInstanceGuidance = (
  aiResponse: string, 
  conversationHistory: any[], 
  userMessage: string
): boolean => {
  const lowerResponse = aiResponse.toLowerCase();
  const lowerUserMessage = userMessage.toLowerCase();
  
  // Check if user is requesting fortu.ai instance setup
  const instanceSetupPhrases = [
    'set up fortu.ai instance',
    'setup fortu',
    'create fortu.ai instance',
    'fortu.ai instance',
    'create instance'
  ];
  
  const userRequestsInstance = instanceSetupPhrases.some(phrase => 
    lowerUserMessage.includes(phrase)
  );
  
  // Check if AI is responding about instance setup
  const aiMentionsInstanceSetup = [
    'set up your personalised fortu.ai instance',
    'setup canvas',
    'configure your workspace',
    'organisation\'s branding'
  ].some(phrase => lowerResponse.includes(phrase));
  
  return userRequestsInstance || aiMentionsInstanceSetup;
};

// Simplified - no multi-challenge complexity
export function isReadyForMultiChallengeExploration(
  response: string,
  conversationHistory: any[],
  userMessage: string
): boolean {
  console.log('Multi-challenge exploration disabled in simplified flow');
  return false;
}

export function extractRefinedChallenge(conversationHistory: any[], currentResponse: string): string {
  const lowerResponse = currentResponse.toLowerCase();
  
  // Look for refined challenge in current response
  const refinedChallengeMarkers = [
    'here\'s your refined challenge:',
    'refined challenge statement:',
    'blended challenge:',
    'your refined challenge:'
  ];
  
  for (const marker of refinedChallengeMarkers) {
    const markerIndex = lowerResponse.indexOf(marker);
    if (markerIndex !== -1) {
      const afterMarker = currentResponse.substring(markerIndex + marker.length);
      const lines = afterMarker.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('"') && trimmed.includes('How do we')) {
          const extracted = trimmed.replace(/^"/, '').replace(/"$/, '').trim();
          console.log('Extracted refined challenge:', extracted);
          return extracted;
        }
      }
    }
  }
  
  // Fallback: look for any "How do we" question in the response
  const howDoWeMatch = currentResponse.match(/How do we[^?]+\?/);
  if (howDoWeMatch) {
    const extracted = howDoWeMatch[0];
    console.log('Extracted refined challenge (fallback):', extracted);
    return extracted;
  }
  
  // Final fallback: look in conversation history for the latest HDW question
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const msg = conversationHistory[i];
    if (msg.role === 'assistant' && msg.text.includes('How do we')) {
      const howDoWeMatch = msg.text.match(/How do we[^?]+\?/);
      if (howDoWeMatch) {
        const extracted = howDoWeMatch[0];
        console.log('Extracted refined challenge (history fallback):', extracted);
        return extracted;
      }
    }
  }
  
  return '';
}
