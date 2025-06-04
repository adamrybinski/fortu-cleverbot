
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
    lowerResponse.includes('search fortu') || 
    lowerResponse.includes('find organisations') || 
    lowerResponse.includes('searching our database')
  );

  // Auto-trigger after HDW confirmation - look for automatic search promises
  const hasFortuSearchPromise = 
    lowerResponse.includes('search fortu') ||
    lowerResponse.includes('find organisations') ||
    lowerResponse.includes('searching our database') ||
    lowerResponse.includes('let me search') ||
    lowerResponse.includes('i\'ll find');

  // User confirmed HDW question (simple yes/no or confirmation)
  const userConfirmedHDW = 
    lowerMessage.includes('yes') ||
    lowerMessage.includes('correct') ||
    lowerMessage.includes('right') ||
    lowerMessage.includes('accurate') ||
    lowerMessage.includes('that works') ||
    lowerMessage.includes('looks good') ||
    (lowerMessage.length < 30 && !lowerMessage.includes('no'));

  if (hasFortuSearchPromise && userConfirmedHDW) {
    console.log('Auto-triggering fortu search after HDW confirmation');
    return true;
  }

  console.log('Ready for fortu questions:', false);
  return false;
}

export function isReadyForFortuInstanceGuidance(
  response: string,
  conversationHistory: any[],
  userMessage: string
): boolean {
  const lowerResponse = response.toLowerCase();
  const lowerMessage = userMessage.toLowerCase();
  
  console.log('Checking readiness for fortu.ai instance guidance:');
  
  // Check if response contains refined challenge and instance options
  const hasRefinedChallenge = 
    lowerResponse.includes('refined challenge') ||
    lowerResponse.includes('here\'s your refined') ||
    lowerResponse.includes('blended challenge');

  const hasInstanceOptions = 
    lowerResponse.includes('option 1') ||
    lowerResponse.includes('option 2') ||
    lowerResponse.includes('option 3') ||
    lowerResponse.includes('submit to your fortu.ai instance');

  // User selects an option for instance creation
  const userSelectsOption = 
    lowerMessage.includes('option 1') ||
    lowerMessage.includes('option 2') ||
    lowerMessage.includes('option 3') ||
    lowerMessage.includes('refined challenge') ||
    lowerMessage.includes('selected questions') ||
    lowerMessage.includes('both');

  console.log('- Response contains refined challenge:', hasRefinedChallenge);
  console.log('- Response contains instance options:', hasInstanceOptions);
  console.log('- User selects option:', userSelectsOption);

  const ready = hasRefinedChallenge && hasInstanceOptions && userSelectsOption;
  console.log('Ready for fortu.ai instance guidance:', ready);
  
  return ready;
}

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
