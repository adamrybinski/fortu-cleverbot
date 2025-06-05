
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, source } = await req.json();
    
    console.log('Generating summary for question:', question);
    console.log('Source:', source);

    let systemPrompt = '';
    if (source === 'fortu') {
      systemPrompt = `You are an expert business consultant summarising a question from fortu.ai's database. 
      Create a realistic 100-word summary that includes:
      - Backstory: Why this challenge emerged
      - Context: Industry/company situation  
      - Outcomes: What results were achieved
      
      Write in a professional, insightful tone as if summarising real case study data.`;
    } else {
      systemPrompt = `You are an AI assistant explaining why this question was suggested by CleverBot. 
      Create a 100-word summary that explains:
      - Why this question is relevant to the user's challenge
      - What insights it could provide
      - How it complements other questions
      
      Write in a helpful, analytical tone.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const summary = data.choices[0].message.content;
    
    console.log('Generated summary:', summary);

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-question-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
