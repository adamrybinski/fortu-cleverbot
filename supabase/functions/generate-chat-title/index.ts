
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
    const { messages } = await req.json();
    
    console.log('Generating title for chat with', messages.length, 'messages');

    // Take first few messages to understand the conversation context
    const contextMessages = messages.slice(0, 4).map((msg: any) => ({
      role: msg.role === 'bot' ? 'assistant' : 'user',
      content: msg.text
    }));

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
            content: 'You are a helpful assistant that creates short, descriptive titles for chat conversations. Generate a concise title (2-6 words) that captures the main topic or challenge being discussed. Do not use quotes or special formatting. Examples: "Marketing Strategy Challenge", "Team Communication Issues", "Product Launch Planning"'
          },
          { 
            role: 'user', 
            content: `Generate a short title for this conversation:\n\n${contextMessages.map(m => `${m.role}: ${m.content}`).join('\n')}`
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const title = data.choices[0].message.content.trim();
    
    console.log('Generated title:', title);

    return new Response(JSON.stringify({ title }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-chat-title function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
