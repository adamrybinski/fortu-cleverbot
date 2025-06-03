
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QUESTION_STATUSES = ['Discovery', 'Explore', 'Journey', 'Equip'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { refinedChallenge } = await req.json();
    
    if (!refinedChallenge) {
      throw new Error('Refined challenge is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating questions for challenge:', refinedChallenge);

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
            content: `You are an expert business consultant. Generate 6 relevant "How do we..." questions that are similar to or related to the user's challenge. Each question should be practical, actionable, and something that real organisations would face.

Format your response as a JSON array of objects with this structure:
{
  "question": "How do we...",
  "relevance": number (85-98),
  "context": "brief industry/domain context",
  "organisations": number (15-50)
}

The questions should be realistic variations or related challenges that organisations in similar situations would face.`
          },
          {
            role: 'user',
            content: `Generate 6 relevant questions similar to this challenge: "${refinedChallenge}"`
          }
        ],
        temperature: 0.8,
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

    console.log('AI response:', aiResponse);

    // Parse the JSON response
    let questions;
    try {
      questions = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Failed to generate questions in proper format');
    }

    // Add IDs and statuses to the questions
    const enrichedQuestions = questions.map((q: any, index: number) => ({
      id: index + 1,
      question: q.question,
      relevance: q.relevance,
      context: q.context,
      organisations: q.organisations,
      status: QUESTION_STATUSES[index % QUESTION_STATUSES.length],
      insights: `${q.organisations} organisations tackled this`
    }));

    console.log('Generated questions:', enrichedQuestions);

    return new Response(JSON.stringify({ 
      questions: enrichedQuestions,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-fortu-questions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
