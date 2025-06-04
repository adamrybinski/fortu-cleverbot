
export const isReadyForFortuQuestions = (
  response: string,
  conversationHistory: any[],
  userMessage: string
): boolean => {
  console.log('Checking readiness for fortu questions:');
  console.log('- Conversation history length:', conversationHistory.length);
  console.log('- Bot response contains fortu search promise:', response.toLowerCase().includes('search fortu') || response.toLowerCase().includes('checking our database'));
  console.log('- User message:', userMessage.toLowerCase());

  // Check if user explicitly requested question matching
  const userRequestsMatching = userMessage.toLowerCase().includes('match questions') || 
                               userMessage.toLowerCase().includes('search fortu') || 
                               userMessage.toLowerCase().includes('find similar') || 
                               userMessage.toLowerCase().includes('show examples') ||
                               userMessage.toLowerCase().includes('option 1') ||
                               (userMessage.toLowerCase() === 'yes' && response.toLowerCase().includes('search fortu'));

  // Bot actively promises to search fortu.ai
  const botPromisesFortuSearch = response.toLowerCase().includes('search fortu') || 
                                response.toLowerCase().includes('checking our database') ||
                                response.toLowerCase().includes('let me check fortu') ||
                                response.toLowerCase().includes('found some relevant');

  // If bot promises fortu search AND user has requested it, trigger regardless of exchange count
  if (botPromisesFortuSearch && userRequestsMatching) {
    console.log('User explicitly requested question matching and bot promises fortu search - triggering');
    return true;
  }

  console.log('Final readiness decision:', false);
  return false;
};

export const isReadyForFortuInstanceGuidance = (
  response: string,
  conversationHistory: any[],
  userMessage: string
): boolean => {
  console.log('Checking readiness for fortu.ai instance guidance:');
  
  // Check if user explicitly requested instance creation
  const userRequestsInstance = userMessage.toLowerCase().includes('create instance') ||
                              userMessage.toLowerCase().includes('setup fortu') ||
                              userMessage.toLowerCase().includes('take to fortu') ||
                              userMessage.toLowerCase().includes('option 2') ||
                              userMessage.toLowerCase().includes('ready for action');

  // Check if response contains ultra-refinement completion signals
  const responseContainsUltraRefinement = response.toLowerCase().includes('ultra-refined') ||
                                         response.toLowerCase().includes('based on your selections') ||
                                         response.toLowerCase().includes('refined challenge') ||
                                         response.toLowerCase().includes('crystal-clear challenge');

  console.log('- Response contains ultra-refinement completion signals:', responseContainsUltraRefinement);
  console.log('- User requests instance creation:', userRequestsInstance);

  const isReady = responseContainsUltraRefinement && userRequestsInstance;
  console.log('Ready for fortu.ai instance guidance:', isReady);
  
  return isReady;
};

export const isReadyForMultiChallengeExploration = (
  response: string,
  conversationHistory: any[],
  userMessage: string
): boolean => {
  console.log('Checking readiness for multi-challenge exploration:');
  
  // Check if user explicitly requested new challenge
  const userRequestsNewChallenge = userMessage.toLowerCase().includes('new challenge') ||
                                  userMessage.toLowerCase().includes('different challenge') ||
                                  userMessage.toLowerCase().includes('start fresh') ||
                                  userMessage.toLowerCase().includes('another question') ||
                                  userMessage.toLowerCase().includes('option 4');

  // Check if this follows fortu.ai instance guidance completion
  const followsInstanceGuidance = response.toLowerCase().includes('take this refined question') ||
                                 response.toLowerCase().includes('fortu.ai instance') ||
                                 response.toLowerCase().includes('crystal-clear challenge');

  console.log('- Looking for new challenge request:', userRequestsNewChallenge);
  console.log('- Follows instance guidance:', followsInstanceGuidance);

  const isReady = userRequestsNewChallenge || (followsInstanceGuidance && userRequestsNewChallenge);
  console.log('Ready for multi-challenge exploration:', isReady);
  
  return isReady;
};

export const extractRefinedChallenge = (conversationHistory: any[], currentResponse: string): string => {
  // Look for "How do we..." patterns in the current response and conversation
  const howDoWePattern = /How do we ([^?]+)\?/i;
  
  // First check current response
  const currentMatch = currentResponse.match(howDoWePattern);
  if (currentMatch) {
    return currentMatch[0];
  }
  
  // Then check recent conversation history (last 3 exchanges)
  const recentHistory = conversationHistory.slice(-6); // Last 3 exchanges (user + bot pairs)
  
  for (let i = recentHistory.length - 1; i >= 0; i--) {
    const message = recentHistory[i];
    if (message.role === 'assistant' || message.role === 'bot') {
      const match = message.text.match(howDoWePattern);
      if (match) {
        console.log('Extracted refined challenge:', match[0]);
        return match[0];
      }
    }
  }
  
  return '';
};
