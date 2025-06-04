
// Enhanced agent detection function
export function shouldUseProspectAgent(message: string, conversationHistory: any[], selectedQuestions?: any[]): boolean {
  const lowerMessage = message.toLowerCase();
  
  // If selectedQuestions are present, always use prospect agent for refinement
  if (selectedQuestions && selectedQuestions.length > 0) {
    return true;
  }
  
  // Emotional/vague problem indicators
  const emotionalIndicators = [
    'stuck', 'struggling', 'confused', 'lost', 'unclear',
    'worried', 'concerned', 'frustrated', 'overwhelmed'
  ];
  
  // Business challenge indicators
  const challengeIndicators = [
    'churn', 'growth', 'revenue', 'customers', 'retention',
    'problem', 'issue', 'challenge', 'help', 'solution',
    'strategy', 'direction', 'planning', 'goals', 'objectives',
    'transformation', 'change', 'improve'
  ];
  
  // Vague language indicators
  const vagueIndicators = [
    'somehow', 'maybe', 'possibly', 'not sure', 'think',
    'probably', 'might', 'could be', 'sort of', 'kind of'
  ];
  
  // Check for emotional indicators
  const hasEmotionalLanguage = emotionalIndicators.some(indicator => 
    lowerMessage.includes(indicator)
  );
  
  // Check for business challenge language
  const hasChallengeLanguage = challengeIndicators.some(indicator => 
    lowerMessage.includes(indicator)
  );
  
  // Check for vague language
  const hasVagueLanguage = vagueIndicators.some(indicator => 
    lowerMessage.includes(indicator)
  );
  
  // Check conversation context - if early in conversation and asking for help
  const isEarlyConversation = conversationHistory.length < 10;
  const isAskingForHelp = lowerMessage.includes('help') || lowerMessage.includes('need');
  
  // Use Prospect Agent if:
  // 1. Emotional + challenge language
  // 2. Vague language + business context
  // 3. Early conversation asking for help
  // 4. Short, unclear messages (less than 20 words and no clear question)
  const messageWords = message.split(' ').length;
  const isShortUnclear = messageWords < 20 && !message.includes('?') && !message.includes('how');
  
  return (hasEmotionalLanguage && hasChallengeLanguage) ||
         (hasVagueLanguage && hasChallengeLanguage) ||
         (isEarlyConversation && isAskingForHelp) ||
         isShortUnclear;
}
