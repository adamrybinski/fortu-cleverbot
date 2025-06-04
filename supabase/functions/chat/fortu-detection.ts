// Enhanced function to detect if ready for fortu questions - more flexible with exchange count
export function isReadyForFortuQuestions(response: string, conversationHistory: any[], userMessage: string): boolean {
  const lowerResponse = response.toLowerCase();
  const lowerUserMessage = userMessage.toLowerCase();
  
  console.log('Checking readiness for fortu questions:');
  console.log('- Conversation history length:', conversationHistory.length);
  console.log('- Bot response contains fortu search promise:', lowerResponse.includes('let me search fortu') || lowerResponse.includes('let me check fortu'));
  console.log('- User message:', lowerUserMessage);
  
  // Enhanced: Check if bot is actively promising to search fortu.ai (regardless of exchange count)
  const botPromisesToSearch = lowerResponse.includes('perfect. let me search fortu.ai') ||
                             lowerResponse.includes('perfect. let me check fortu.ai') ||
                             lowerResponse.includes('right, checking our database') ||
                             lowerResponse.includes('brilliant. i\'ve found some relevant questions') ||
                             lowerResponse.includes('let me search fortu.ai for relevant') ||
                             lowerResponse.includes('let me check fortu.ai for organisations');
  
  if (botPromisesToSearch) {
    console.log('Bot actively promises to search fortu.ai - triggering regardless of exchange count');
    return true;
  }
  
  // Minimum exchange requirement - reduced from 6 to 4 for more flexibility
  if (conversationHistory.length < 4) {
    console.log('Not enough exchanges yet (minimum 4)');
    return false;
  }
  
  // Check if bot presented a "How do we" question and user confirmed
  const botPresentedQuestion = lowerResponse.includes('how do we') && 
                              (lowerResponse.includes('does this capture') || 
                               lowerResponse.includes('if this looks right') ||
                               lowerResponse.includes('shall i search fortu'));
  
  // User confirmation indicators
  const userConfirmed = lowerUserMessage.includes('yes') || 
                       lowerUserMessage.includes('correct') ||
                       lowerUserMessage.includes('that\'s right') ||
                       lowerUserMessage.includes('looks good') ||
                       lowerUserMessage.includes('go ahead') ||
                       lowerUserMessage.includes('search fortu') ||
                       lowerUserMessage.includes('find questions') ||
                       lowerUserMessage.includes('check fortu');
  
  // Strong readiness indicators in bot response after user confirmation
  const readinessIndicators = [
    'perfect. let me search fortu.ai',
    'let me check fortu.ai',
    'checking our database',
    'i\'ve found some relevant questions',
    'brilliant. i\'ve found',
    'right, checking'
  ];
  
  const hasReadinessSignal = readinessIndicators.some(indicator => 
    lowerResponse.includes(indicator)
  );
  
  // Look for previous exchange where bot presented question
  const hasRecentQuestionPresentation = conversationHistory.slice(-4).some((msg: any) => 
    msg.role === 'assistant' && msg.text.toLowerCase().includes('how do we') &&
    (msg.text.toLowerCase().includes('does this capture') || 
     msg.text.toLowerCase().includes('shall i search'))
  );
  
  const isReady = (hasRecentQuestionPresentation && userConfirmed) || hasReadinessSignal;
  console.log('Final readiness decision:', isReady);
  
  return isReady;
}

// Enhanced function to detect if ready for fortu.ai instance guidance
export function isReadyForFortuInstanceGuidance(response: string, conversationHistory: any[], userMessage: string): boolean {
  const lowerResponse = response.toLowerCase();
  const lowerUserMessage = userMessage.toLowerCase();
  
  console.log('Checking readiness for fortu.ai instance guidance:');
  console.log('- Response contains ultra-refinement completion signals');
  
  // Check if the bot has completed ultra-refinement and provided next steps
  const completedRefinement = lowerResponse.includes('ultra-refined challenge') ||
                             lowerResponse.includes('based on your selections') ||
                             lowerResponse.includes('refined challenge statement') ||
                             lowerResponse.includes('here\'s how i\'d sharpen') ||
                             lowerResponse.includes('these selections tell me');
  
  // Check if bot is ready to provide fortu.ai guidance
  const readyForGuidance = lowerResponse.includes('next steps') ||
                          lowerResponse.includes('shall i search fortu.ai') ||
                          lowerResponse.includes('deeper exploration') ||
                          (lowerUserMessage.includes('yes') && completedRefinement) ||
                          (lowerUserMessage.includes('looks great') && completedRefinement) ||
                          (lowerUserMessage.includes('perfect') && completedRefinement);
  
  // Check for previous ultra-refinement in conversation
  const hasRecentRefinement = conversationHistory.slice(-2).some((msg: any) => 
    msg.role === 'assistant' && 
    (msg.text.toLowerCase().includes('ultra-refined') || 
     msg.text.toLowerCase().includes('based on your selections') ||
     msg.text.toLowerCase().includes('these selections tell me'))
  );
  
  const isReady = (completedRefinement && readyForGuidance) || (hasRecentRefinement && (lowerUserMessage.includes('yes') || lowerUserMessage.includes('looks great')));
  console.log('Ready for fortu.ai instance guidance:', isReady);
  
  return isReady;
}

// NEW: Function to detect if ready for multi-challenge exploration
export function isReadyForMultiChallengeExploration(response: string, conversationHistory: any[], userMessage: string): boolean {
  const lowerResponse = response.toLowerCase();
  const lowerUserMessage = userMessage.toLowerCase();
  
  console.log('Checking readiness for multi-challenge exploration:');
  console.log('- Looking for completion of fortu.ai instance guidance');
  
  // Check if the bot has completed fortu.ai instance guidance (Stage 6)
  const completedFortuGuidance = lowerResponse.includes('next step: take this refined question') ||
                                lowerResponse.includes('in fortu.ai, search for this question') ||
                                lowerResponse.includes('your refined challenge is now sharp') ||
                                lowerResponse.includes('crystal-clear challenge statement');
  
  // Check if user has acknowledged the guidance
  const userAcknowledged = lowerUserMessage.includes('yes') ||
                          lowerUserMessage.includes('got it') ||
                          lowerUserMessage.includes('understood') ||
                          lowerUserMessage.includes('what next') ||
                          lowerUserMessage.includes('thanks') ||
                          lowerUserMessage.includes('perfect') ||
                          lowerUserMessage.includes('great') ||
                          lowerUserMessage.includes('sounds good');
  
  // Check for previous fortu.ai guidance in conversation
  const hasRecentFortuGuidance = conversationHistory.slice(-2).some((msg: any) => 
    msg.role === 'assistant' && 
    (msg.text.toLowerCase().includes('take this refined question to your own fortu.ai') || 
     msg.text.toLowerCase().includes('next step: take this refined question') ||
     msg.text.toLowerCase().includes('crystal-clear challenge statement'))
  );
  
  const isReady = (completedFortuGuidance && userAcknowledged) || (hasRecentFortuGuidance && userAcknowledged);
  console.log('Ready for multi-challenge exploration:', isReady);
  
  return isReady;
}

// Function to extract the refined challenge from conversation
export function extractRefinedChallenge(conversationHistory: any[], currentResponse: string): string {
  // Look for "How do we..." in the current response first
  const howDoWeMatch = currentResponse.match(/"(How do we[^"]+)"/);
  if (howDoWeMatch) {
    return howDoWeMatch[1];
  }
  
  // Look for "How do we..." in recent conversation
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const msg = conversationHistory[i];
    if (msg.role === 'assistant') {
      const howDoWeMatch = msg.text.match(/(How do we[^.?!]+)/);
      if (howDoWeMatch) {
        return howDoWeMatch[1];
      }
    }
  }
  
  // Look for the last user message that describes their challenge
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const msg = conversationHistory[i];
    if (msg.role === 'user' && msg.text.length > 20) {
      return msg.text;
    }
  }
  
  // Fallback to a generic description
  return "Business transformation challenge requiring actionable solutions";
}
