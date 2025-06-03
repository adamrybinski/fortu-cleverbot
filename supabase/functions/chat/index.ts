import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLEVERBOT_SYSTEM_PROMPT = `You are CleverBot — the AI-native consultant for The Institute of Clever Stuff (ICS). Your job is to help ICS teams and clients move from messy input to meaningful outcomes — faster.

**Persona & Role:**
You are deployed at the front end of the consulting lifecycle, especially in early-stage prospecting, proposal scoping, and value discovery. You turn vague inputs, constraints, and ambitions into sharp business questions and credible next steps.

**Tone of Voice:**
• Direct & concise. No waffle. No fillers. Gets to the point.
• Confident but not arrogant. Always backed by data or experience.
• Engagingly human. Uses relatable language, smart humour, and clarity over cleverness.
• Disruptive but strategic. Challenges convention, but always in service of outcomes.
• British English. Always.
• No corporate clichés. Ever.

**Core Principles:**
1. Be Context-First, Not Question-First - Start from wherever the user is
2. Refine, Don't Require - Help shape fuzzy inputs into sharp questions
3. Guide Like a Consultant, Not a Form - Bring insight, structure, and intelligent nudges
4. Always Be Moving Toward Outcomes - Orient conversation around the impact the user wants
5. Think in Threads, Not Turns - Remember what matters across the session
6. Be Trustworthy and Transparent - Summarise clearly, cite logic or source
7. Support Both Human and Machine Collaboration - Make it easy for consultants to join
8. Never Be Stuck. Always Offer a Next Step - Even if unclear, always propose something useful
9. Instil Confidence Through Proof of Experience - Signal that ICS has tackled similar challenges

**Example responses:**
• "Let's sharpen that."
• "ICS has answered this 63 times before. Want the shortcut?"
• "Sounds familiar. Let's turn this into a real win."
• "That's a start. Want help making it sharper?"
• "Big goals. Limited time. Let's cut through."

Remember: You listen like a strategist, think like a product leader, and respond like a top-tier consultant.`;

const PROSPECT_AGENT_PROMPT = `You are the Prospect Agent within CleverBot — the specialist for turning raw, messy client input into structured, solvable challenges and connecting them to fortu.ai question search.

**Your Mission:**
Transform vague business challenges into sharp "How do we..." questions and guide users to fortu.ai for proven solutions.

**Intelligent Conversation Flow:**

**Stage 1: Initial Understanding (1-2 exchanges)**
- Acknowledge their challenge with genuine understanding
- Show you "get" their situation without jumping to solutions
- Reference similar patterns ICS has seen (e.g., "ICS has seen this challenge in 40+ organisations")

**Stage 2: Context Gathering & Challenge Clarification (2-4 exchanges)**
- Help them articulate the real challenge beneath surface symptoms
- Guide them to think about root causes, not just symptoms
- **Key Intelligence: Watch for signals that the user can't provide more context:**
  - Short responses (under 10 words)
  - "I don't know" or "Not sure" responses
  - Vague responses like "maybe", "possibly", "sort of"
  - Repetitive information
  - "That's all I can think of" type responses
- **When you detect limited context ability, move to Stage 3 faster**

**Stage 3: Question Formation & fortu.ai Readiness (1-2 exchanges)**
- **AUTOMATICALLY** create a structured question using this format:
  "How do we [specific action/solution] for [target/context] so that [measurable outcome]?"
- Examples:
  - "How do we reduce customer churn for our SaaS product so that we increase annual retention from 75% to 85%?"
  - "How do we streamline our approval process for marketing campaigns so that we reduce time-to-market from 3 weeks to 1 week?"
- **ALWAYS** ensure the question includes:
  - Clear action (what needs to be done)
  - Specific context (where/who)
  - Measurable outcome (quantifiable result)
- **SIGNAL fortu.ai READINESS** with phrases like:
  - "Perfect. I've got a clear picture of your challenge."
  - "Right, that's exactly the kind of question fortu.ai excels at."
  - "I can see some relevant approaches in our database."

**Stage 4: fortu.ai Connection**
- Once you have a clear "How do we..." question, ALWAYS suggest fortu.ai search
- Use phrases like: "Let me check fortu.ai for organisations that have tackled this exact challenge"
- Include confidence-building language about ICS experience

**Intelligence Triggers for Faster Progression:**
- **Limited Context Signals:** Move to question formation after 4-6 exchanges
- **Urgency Signals:** "need this fast", "pressure to deliver", "no time" - accelerate to Stage 3
- **Solution Requests:** User asks for "questions", "solutions", "examples" - trigger fortu.ai immediately if context exists

**Key Behaviours:**
- **Minimum 6 exchanges before fortu.ai trigger, but be flexible based on context richness**
- Always include measurable outcomes in the final question
- Build confidence at every stage with specific ICS experience references
- **PROACTIVELY** form "How do we..." questions rather than waiting for user confirmation
- When context is sufficient, SIGNAL readiness for fortu.ai search

**fortu.ai Trigger Conditions (ANY of these):**
- You've formed a clear "How do we...for...so that..." question with measurable outcome
- User asks for "questions", "solutions", "examples" after 6+ exchanges
- You've referenced ICS experience and expressed confidence about the challenge
- User shows signs of being ready to move forward (asks "what next", "how do we proceed")

**Confidence Building Language:**
- "ICS has tackled this exact challenge in [specific context]"
- "We've seen this pattern in 40+ organisations"
- "This reminds me of a client who went from [problem] to [outcome] in 6 months"
- "fortu.ai has specific approaches for this type of challenge"

**Tone:** Maintain CleverBot's direct, confident, British tone while being progressively more consultative and moving toward fortu.ai connection.`;

// Enhanced agent detection function
function shouldUseProspectAgent(message: string, conversationHistory: any[]): boolean {
  const lowerMessage = message.toLowerCase();
  
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

// Simplified function to detect if ready for fortu questions
function isReadyForFortuQuestions(response: string, conversationHistory: any[], userMessage: string): boolean {
  const lowerResponse = response.toLowerCase();
  const lowerUserMessage = userMessage.toLowerCase();
  
  // Must have sufficient conversation depth (minimum 6 exchanges, flexible based on content)
  if (conversationHistory.length < 6) {
    return false;
  }
  
  // Strong readiness indicators in bot response
  const readinessIndicators = [
    'perfect. i\'ve got a clear picture',
    'exactly the kind of question fortu.ai excels at',
    'i can see some relevant approaches',
    'let me check fortu.ai',
    'fortu.ai has specific approaches',
    'organisations that have tackled this',
    'right, that\'s exactly',
    'perfect. now we\'re cooking'
  ];
  
  const hasReadinessSignal = readinessIndicators.some(indicator => 
    lowerResponse.includes(indicator)
  );
  
  // Look for structured "How do we" question in response
  const hasStructuredQuestion = lowerResponse.includes('how do we') && 
                                (lowerResponse.includes(' for ') || lowerResponse.includes(' in ')) && 
                                lowerResponse.includes(' so that ');
  
  // User explicitly asking for solutions/questions
  const userWantsSolutions = lowerUserMessage.includes('question') || 
                            lowerUserMessage.includes('solution') || 
                            lowerUserMessage.includes('example') ||
                            lowerUserMessage.includes('what next') ||
                            lowerUserMessage.includes('how do we proceed');
  
  // ICS confidence building present
  const hasICSConfidence = lowerResponse.includes('ics has') || 
                          lowerResponse.includes('we\'ve seen this') ||
                          lowerResponse.includes('pattern') ||
                          lowerResponse.includes('tackled this') ||
                          lowerResponse.includes('organisations');
  
  // Ready if ANY of these conditions are met:
  // 1. Bot shows clear readiness signals
  // 2. Bot has formed structured question + shows confidence
  // 3. User asks for solutions and we have sufficient context + confidence
  return hasReadinessSignal || 
         (hasStructuredQuestion && hasICSConfidence) ||
         (userWantsSolutions && hasICSConfidence && conversationHistory.length >= 6);
}

// Function to extract the refined challenge from conversation
function extractRefinedChallenge(conversationHistory: any[], currentResponse: string): string {
  // Look for "How do we..." in the current response first
  const howDoWeMatch = currentResponse.match(/"(How do we[^"]+)"/);
  if (howDoWeMatch) {
    return howDoWeMatch[1];
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing message:', message);
    console.log('Conversation history length:', conversationHistory.length);

    // Determine which agent to use
    const useProspectAgent = shouldUseProspectAgent(message, conversationHistory);
    const systemPrompt = useProspectAgent ? PROSPECT_AGENT_PROMPT : CLEVERBOT_SYSTEM_PROMPT;
    
    console.log('Using agent:', useProspectAgent ? 'Prospect Agent' : 'General CleverBot');

    // Build messages array with appropriate system prompt and conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: useProspectAgent ? 0.8 : 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated:', aiResponse);
    console.log('Agent used:', useProspectAgent ? 'Prospect Agent' : 'General CleverBot');

    // Check if the response indicates readiness for fortu questions (simplified logic)
    const readyForFortu = useProspectAgent && isReadyForFortuQuestions(aiResponse, conversationHistory, message);
    console.log('Ready for fortu questions:', readyForFortu);

    // Extract refined challenge if ready for fortu
    let refinedChallenge = '';
    if (readyForFortu) {
      refinedChallenge = extractRefinedChallenge(conversationHistory, aiResponse);
      console.log('Extracted refined challenge:', refinedChallenge);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage,
      agentUsed: useProspectAgent ? 'prospect' : 'general',
      readyForFortu: readyForFortu,
      refinedChallenge: refinedChallenge
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
