
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { CLEVERBOT_SYSTEM_PROMPT, PROSPECT_AGENT_PROMPT } from './prompts/index.ts';
import { shouldUseProspectAgent } from './agent-detection.ts';
import { 
  isReadyForFortuQuestions, 
  isReadyForFortuInstanceGuidance, 
  isReadyForMultiChallengeExploration,
  extractRefinedChallenge 
} from './fortu-detection.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], selectedQuestions = [], selectedAction } = await req.json();
    
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
    console.log('Selected action:', selectedAction);

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

    // Add selected questions context with simplified action guidance
    if (selectedQuestions.length > 0 && selectedAction) {
      const selectedQuestionsText = selectedQuestions.map((q: any) => 
        `- ${q.question} (from ${q.source})`
      ).join('\n');
      
      const themes = selectedQuestions.map((q: any) => q.source).join(', ');
      
      // Simplified action guidance for step 4
      const actionGuidance = `The user has selected these questions from the canvas and wants to proceed to step 4. Create a refined challenge statement that blends their original challenge with insights from these selected questions. Then present the 3 options for what to submit to their fortu.ai instance: (1) refined challenge, (2) selected questions, or (3) both.`;
      
      messages.push({
        role: 'system',
        content: `The user has returned from the canvas and selected the following questions:\n${selectedQuestionsText}\n\nUser's selected action: ${selectedAction}\n\n${actionGuidance}\n\nBased on their selections from ${themes}, create the refined challenge and present the fortu.ai instance options.`
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
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Truncate response to 200 characters maximum
    if (aiResponse.length > 200) {
      aiResponse = aiResponse.substring(0, 197) + '...';
    }

    console.log('AI response generated:', aiResponse);
    console.log('Agent used:', useProspectAgent ? 'Prospect Agent' : 'General CleverBot');

    // Simplified detection - only fortu questions and instance guidance
    const readyForFortu = useProspectAgent && isReadyForFortuQuestions(aiResponse, conversationHistory, message) && selectedQuestions.length === 0;
    console.log('Ready for fortu questions:', readyForFortu);

    // Check if ready for fortu.ai instance guidance (step 4)
    const readyForFortuInstance = useProspectAgent && isReadyForFortuInstanceGuidance(aiResponse, conversationHistory, message);
    console.log('Ready for fortu.ai instance guidance:', readyForFortuInstance);

    // Extract refined challenge if ready for fortu or instance guidance
    let refinedChallenge = '';
    if (readyForFortu || readyForFortuInstance) {
      refinedChallenge = extractRefinedChallenge(conversationHistory, aiResponse);
      console.log('Extracted refined challenge:', refinedChallenge);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage,
      agentUsed: useProspectAgent ? 'prospect' : 'general',
      readyForFortu: readyForFortu,
      readyForFortuInstance: readyForFortuInstance,
      readyForMultiChallenge: false, // Simplified flow - no multi-challenge
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
