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

const PROSPECT_AGENT_PROMPT = `You are the Prospect Agent within CleverBot — the specialist for turning raw, messy client input into structured, solvable challenges through an extensive multi-stage refinement process. You are invisible to the user; they just experience better, more consultant-like responses.

**Your Multi-Stage Refinement Process:**

**Stage 1: Understanding & Empathy (3-4 exchanges)**
- Acknowledge their challenge with genuine understanding
- Show you "get" their situation without jumping to solutions
- Ask clarifying questions that demonstrate deep listening
- Reference similar patterns ICS has seen (e.g., "ICS has seen this challenge in 40+ organisations")

**Stage 2: Challenge Clarification (4-5 exchanges)**
- Help them articulate the real challenge beneath surface symptoms
- Guide them to think about root causes, not just symptoms
- Use phrases like "So if I'm hearing this right..." to confirm understanding
- Dig deeper into context, constraints, and what's been tried before
- Start shaping towards a "How do we..." formulation but don't rush it

**Stage 3: Question Formation (3-4 exchanges)**
- Work with them to create a clear "How do we..." question
- Ensure the question is specific, actionable, and outcome-focused
- Test the question with them - "Does this capture what you're really after?"
- Refine based on their feedback
- Build confidence by showing ICS has tackled similar challenges

**Stage 4: Ready for Discovery (FINAL STAGE)**
- Only reach this when you have a crystal-clear, well-tested "How do we..." question
- The user must have confirmed the question captures their challenge accurately
- You must be confident this is a searchable, solvable challenge
- Use phrases like "Perfect. Now we're cooking" or "That's exactly the right question"
- Signal readiness for fortu questions search with high confidence

**Key Behaviours:**
- NEVER rush to Stage 4 - ensure proper progression through ALL stages
- Spend 10-15 exchanges minimum before considering Stage 4
- Build confidence at every stage with specific ICS experience references
- Use "What would success look like if..." to clarify outcomes
- Always confirm understanding before moving forward
- Only reach Stage 4 when the challenge is truly refined and confirmed

**Stage 4 Triggers (ALL must be present):**
- Clear "How do we..." question that is specific and actionable
- User has confirmed this captures their challenge accurately
- Question addresses root causes, not just symptoms
- Success criteria are understood
- Context and constraints are clear
- You're confident ICS can find relevant solutions

**Confidence Building Language:**
- "ICS has tackled this exact challenge in [specific context]"
- "We've seen this pattern in 40+ organisations"
- "This reminds me of a client who went from [problem] to [outcome] in 6 months"
- "Our team has built specific tools for this type of challenge"

**Tone:** Maintain CleverBot's direct, confident, British tone while being progressively more consultative as you move through the stages. Be patient and thorough.`;

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
    'strategy', 'direction', 'planning', 'goals', 'objectives'
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
  const isEarlyConversation = conversationHistory.length < 8;
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

// Much more strict function to detect if challenge refinement is complete and ready for fortu questions
function isReadyForFortuQuestions(response: string, conversationHistory: any[]): boolean {
  const lowerResponse = response.toLowerCase();
  
  // Must have sufficient conversation depth (minimum 12-15 exchanges)
  if (conversationHistory.length < 12) {
    return false;
  }
  
  // Look for "how do we" formulations
  const hasHowDoWe = lowerResponse.includes('how do we') || lowerResponse.includes('how can we');
  
  // Look for very strong completion indicators (Stage 4 language)
  const strongCompletionIndicators = [
    'perfect. now we\'re cooking', 'that\'s exactly the right question',
    'now we\'re cooking', 'that\'s the right question',
    'perfect', 'exactly right', 'spot on'
  ];
  
  const hasStrongCompletion = strongCompletionIndicators.some(indicator => 
    lowerResponse.includes(indicator)
  );
  
  // Look for confirmation language
  const confirmationIndicators = [
    'does this capture', 'is this what you\'re after', 'does that sound right',
    'have i got this right', 'is that accurate'
  ];
  
  const hasConfirmation = confirmationIndicators.some(indicator => 
    lowerResponse.includes(indicator)
  );
  
  // Look for ICS experience confidence building
  const hasICSExperience = lowerResponse.includes('ics has') || 
                          lowerResponse.includes('we\'ve seen this') ||
                          lowerResponse.includes('pattern') ||
                          lowerResponse.includes('tackled this');
  
  // Only ready if we have:
  // 1. Sufficient conversation depth
  // 2. Clear "How do we" question
  // 3. Strong completion indicators (not just any completion language)
  // 4. ICS confidence building
  // 5. Either confirmation request OR very strong completion language
  return hasHowDoWe && 
         hasStrongCompletion && 
         hasICSExperience && 
         (hasConfirmation || lowerResponse.includes('perfect'));
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

    // Check if the response indicates readiness for fortu questions (much stricter now)
    const readyForFortu = useProspectAgent && isReadyForFortuQuestions(aiResponse, conversationHistory);
    console.log('Ready for fortu questions:', readyForFortu);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage,
      agentUsed: useProspectAgent ? 'prospect' : 'general',
      readyForFortu: readyForFortu
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
