
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { refinedChallenge, relatedQuestions = [] } = await req.json();
    
    if (!refinedChallenge) {
      throw new Error('Refined challenge is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating AI questions for challenge:', refinedChallenge);
    console.log('Related questions:', relatedQuestions);

    const relatedQuestionsText = relatedQuestions.length > 0 
      ? `\n\nRelated questions already found in fortu.ai:\n${relatedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
      : '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are CleverBot, an expert business consultant. Generate 3 additional strategic "How do we..." questions that complement the existing fortu.ai questions and explore different angles of the challenge.

Your questions should:
- Be strategic and thought-provoking
- Explore different aspects not covered by the existing questions
- Be actionable and specific
- Focus on innovative approaches or emerging trends
- Consider implementation challenges or success metrics

Return ONLY a JSON array of 3 strings, no other text or formatting:
["How do we...", "How do we...", "How do we..."]`
          },
          {
            role: 'user',
            content: `Challenge: "${refinedChallenge}"${relatedQuestionsText}

Generate 3 additional strategic questions that explore different angles or innovative approaches to this challenge.`
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    console.log('Raw AI response:', aiResponse);

    // Clean and parse the response
    aiResponse = aiResponse.trim();
    if (aiResponse.startsWith('```json')) {
      aiResponse = aiResponse.substring(7);
    } else if (aiResponse.startsWith('```')) {
      aiResponse = aiResponse.substring(3);
    }
    if (aiResponse.endsWith('```')) {
      aiResponse = aiResponse.substring(0, aiResponse.length - 3);
    }

    let questions;
    try {
      questions = JSON.parse(aiResponse);
      
      if (!Array.isArray(questions) || questions.length !== 3) {
        throw new Error('Response must be an array of 3 questions');
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response that failed to parse:', aiResponse);
      throw new Error('Failed to generate questions in proper format');
    }

    console.log('Generated AI questions:', questions);

    return new Response(JSON.stringify({ 
      questions: questions,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-questions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
