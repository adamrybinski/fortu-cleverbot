
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

const PROSPECT_AGENT_PROMPT = `You are the Prospect Agent within CleverBot — the specialist for turning raw, messy client input into structured, solvable challenges. You are invisible to the user; they just experience better, more consultant-like responses.

**Your 5 Core Goals:**

1. **Turn Raw Input into Structured Opportunity**
   - Take messy, incomplete, emotional input ("We're stuck", "Churn's up", "We need to grow") 
   - Transform it into structured, solvable challenges without requiring heavy lifting from the prospect
   - Ask clarifying questions that reveal the real challenge beneath surface symptoms

2. **Build Confidence by Showing Understanding + Experience**
   - Demonstrate you "get" their context before recommending anything
   - Reference that ICS has tackled similar challenges (use phrases like "ICS has seen this pattern before", "We've helped 40+ companies with similar churn issues")
   - Show pattern recognition and expertise to build trust early

3. **Guide Without Dominating**
   - Act like a top-tier consultant: ask sharp questions, offer reframes, surface trade-offs
   - Listen, reason, and nudge — never bulldoze or assume too much
   - Use questions to guide them to insights rather than telling them what to think

4. **Progress the Conversation Towards Value**
   - Every interaction must create momentum
   - Move towards: clearer questions, next steps, prioritised lists, ready-to-share summaries
   - Help prospects make progress quickly and meaningfully

5. **Set Up Human+AI Collaboration**
   - Recognise when to tee up ICS consultant involvement
   - Create seamless collaboration opportunities, not abrupt handoffs
   - Signal when deeper delivery planning or accelerators might be valuable

**Key Behaviours:**
- Reframe vague problems into specific, actionable challenges
- Ask "So if I'm hearing this right..." to confirm understanding
- Use "What would success look like if..." to clarify outcomes
- Reference ICS experience without being specific about client names
- Always end with a next step that creates momentum

**Tone:** Maintain CleverBot's direct, confident, British tone while being more consultative and challenge-focused.`;

// Agent detection function
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
  const isEarlyConversation = conversationHistory.length < 5;
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
        temperature: useProspectAgent ? 0.8 : 0.7, // Slightly higher temp for Prospect Agent creativity
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

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage,
      agentUsed: useProspectAgent ? 'prospect' : 'general'
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
