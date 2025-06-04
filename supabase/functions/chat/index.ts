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

**Stage 3: Question Formation & User Confirmation (1-2 exchanges)**
- **AUTOMATICALLY** create a structured question using this format:
  "How do we [specific action/solution] for [target/context] so that [measurable outcome]?"
- Examples:
  - "How do we reduce customer churn for our SaaS product so that we increase annual retention from 75% to 85%?"
  - "How do we streamline our approval process for marketing campaigns so that we reduce time-to-market from 3 weeks to 1 week?"
- **ALWAYS** ensure the question includes:
  - Clear action (what needs to be done)
  - Specific context (where/who)
  - Measurable outcome (quantifiable result)
- **PRESENT THE QUESTION TO THE USER** and ask for confirmation:
  - "Based on our chat, I'd frame your challenge as: '[How do we question]'"
  - "Does this capture what you're trying to solve?"
  - "If this looks right, I can search fortu.ai for organisations that have tackled this exact challenge."

**Stage 4: fortu.ai Search Trigger (Only after user confirmation)**
- Only proceed when user confirms the "How do we..." question is accurate
- Use phrases like:
  - "Perfect. Let me search fortu.ai for relevant approaches."
  - "Right, checking our database for organisations with similar challenges."
  - "Brilliant. I've found some relevant questions in fortu.ai that match your challenge."

**Stage 5: Post-Canvas Question Refinement (ENHANCED)**
- **DETECT when user returns from canvas with selected questions**
- **Key indicators:**
  - Message contains selectedQuestions data
  - User mentions specific questions from the canvas
  - User says they've "selected" or "chosen" questions
  - Message starts with "I've selected these" or similar
- **When detected, respond with enhanced refinement:**
  - "Excellent choices! I can see you've identified [X] questions that really resonate with your situation."
  - "These selections tell me you're particularly focused on [identify themes from selected questions]."
  - "Based on your selections, let me refine your challenge even further..."
- **Use selected questions to create ultra-refined "How do we..." statement**
- **Ask targeted follow-up questions based on the selected questions' themes**
- **Provide specific next steps or deeper exploration paths**

**Intelligence Triggers for Faster Progression:**
- **Limited Context Signals:** Move to question formation after 4-6 exchanges
- **Urgency Signals:** "need this fast", "pressure to deliver", "no time" - accelerate to Stage 3
- **Solution Requests:** User asks for "questions", "solutions", "examples" - trigger fortu.ai immediately if context exists
- **Canvas Return Signals:** Detect selectedQuestions data - trigger Stage 5 with enhanced refinement

**Key Behaviours:**
- **Minimum 4 exchanges before fortu.ai trigger, but be flexible based on context richness**
- Always include measurable outcomes in the final question
- Build confidence at every stage with specific ICS experience references
- **ALWAYS** present the "How do we..." question to the user before proceeding
- **WAIT** for user confirmation before triggering fortu.ai search
- When context is sufficient, PRESENT the question and ASK for confirmation
- **ENHANCED: When selectedQuestions detected, provide deep analysis and ultra-refined challenge**

**fortu.ai Trigger Conditions (ALL of these must be met):**
- You've formed a clear "How do we...for...so that..." question with measurable outcome
- You've presented the question to the user for confirmation
- User has confirmed the question is accurate (or asked to proceed to fortu.ai)
- You've referenced ICS experience and expressed confidence about the challenge

**Post-Canvas Enhanced Refinement Conditions:**
- selectedQuestions data is present in the conversation
- User has returned from canvas interaction
- Provide thematic analysis of their selections
- Create ultra-refined challenges based on their chosen focus areas
- Guide towards more targeted solutions and deeper exploration

**Confirmation Language Examples:**
- "Based on our chat, I'd frame your challenge as: 'How do we...'"
- "Does this capture what you're trying to solve?"
- "If this looks right, shall I search fortu.ai for matching approaches?"
- "Perfect. Let me check fortu.ai for organisations that have tackled this."

**Post-Canvas Enhanced Language Examples:**
- "Brilliant selections! These [X] questions reveal you're focused on [theme analysis]."
- "Based on your choices, I can see [specific insights about their priorities]."
- "Your selections suggest you're particularly interested in [specific areas]. Let me refine your challenge to focus on these areas..."
- "These questions tell me [analytical insight]. Here's how I'd sharpen your challenge based on what you've chosen..."

**Confidence Building Language:**
- "ICS has tackled this exact challenge in [specific context]"
- "We've seen this pattern in 40+ organisations"
- "This reminds me of a client who went from [problem] to [outcome] in 6 months"
- "fortu.ai has specific approaches for this type of challenge"

**Tone:** Maintain CleverBot's direct, confident, British tone while being progressively more consultative and always seeking user confirmation before fortu.ai connection.`;

// Enhanced agent detection function
function shouldUseProspectAgent(message: string, conversationHistory: any[], selectedQuestions?: any[]): boolean {
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

// Enhanced function to detect if ready for fortu questions - more flexible with exchange count
function isReadyForFortuQuestions(response: string, conversationHistory: any[], userMessage: string): boolean {
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

// Function to extract the refined challenge from conversation
function extractRefinedChallenge(conversationHistory: any[], currentResponse: string): string {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], selectedQuestions = [] } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing message:', message);
    console.log('Conversation history length:', conversationHistory.length);
    console.log('Selected questions:', selectedQuestions);

    // Determine which agent to use - include selectedQuestions in detection
    const useProspectAgent = shouldUseProspectAgent(message, conversationHistory, selectedQuestions);
    const systemPrompt = useProspectAgent ? PROSPECT_AGENT_PROMPT : CLEVERBOT_SYSTEM_PROMPT;
    
    console.log('Using agent:', useProspectAgent ? 'Prospect Agent' : 'General CleverBot');

    // Build messages array with appropriate system prompt and conversation history
    let messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.text
      }))
    ];

    // Add selected questions context if present with enhanced guidance
    if (selectedQuestions.length > 0) {
      const selectedQuestionsText = selectedQuestions.map((q: any) => 
        `- ${q.question} (from ${q.source})`
      ).join('\n');
      
      const themes = selectedQuestions.map((q: any) => q.source).join(', ');
      
      messages.push({
        role: 'system',
        content: `The user has just returned from the canvas and selected the following questions that are relevant to their challenge:\n${selectedQuestionsText}\n\nBased on their selections from ${themes}, provide detailed analysis of what these choices reveal about their priorities and focus areas. Use these selections to create an ultra-refined challenge statement and suggest specific next steps for deeper exploration. This is a key refinement moment - be insightful and analytical about their choices.`
      });
    }

    messages.push({ role: 'user', content: message });

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

    // Check if the response indicates readiness for fortu questions (now with improved detection)
    const readyForFortu = useProspectAgent && isReadyForFortuQuestions(aiResponse, conversationHistory, message) && selectedQuestions.length === 0;
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
