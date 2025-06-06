
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to detect if a conversation is just testing
const isTestConversation = (messages: any[]): boolean => {
  const userMessages = messages.filter(msg => msg.role === 'user');
  if (userMessages.length === 0) return true;
  
  const firstUserMessage = userMessages[0].content.toLowerCase().trim();
  
  // Common test patterns
  const testPatterns = [
    /^test$/,
    /^testing$/,
    /^hello$/,
    /^hi$/,
    /^hey$/,
    /^test\s*\d*$/,
    /^1$/,
    /^a$/,
    /^abc$/,
    /^123$/,
    /^\w{1,3}$/,  // Very short single words
  ];
  
  return testPatterns.some(pattern => pattern.test(firstUserMessage)) || 
         firstUserMessage.length <= 3;
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

    // Check if this is a test conversation
    if (isTestConversation(contextMessages)) {
      console.log('Detected test conversation, using fallback title');
      return new Response(JSON.stringify({ title: 'Test Chat' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
          { 
            role: 'system', 
            content: `You are a helpful assistant that creates short, descriptive titles for chat conversations. 

IMPORTANT RULES:
1. Generate a concise title (2-6 words) that captures the main topic or challenge being discussed
2. Do NOT use quotes or special formatting
3. If the conversation appears to be testing (words like "test", "hello", very short responses), return "Test Chat"
4. Only generate meaningful titles for conversations with substantial content
5. Focus on the actual user's challenge or topic, not generic business terms

Examples of good titles:
- "Marketing Strategy Challenge"
- "Team Communication Issues"  
- "Product Launch Planning"
- "Test Chat" (for test conversations)

Examples of bad titles:
- "Understanding Customer Satisfaction" (when user just said "test")
- Generic business phrases unrelated to user input`
          },
          { 
            role: 'user', 
            content: `Generate a short title for this conversation. If this appears to be a test conversation or lacks substantial content, respond with "Test Chat":\n\n${contextMessages.map(m => `${m.role}: ${m.content}`).join('\n')}`
          }
        ],
        max_tokens: 50,
        temperature: 0.3, // Lower temperature for more consistent results
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    let title = data.choices[0].message.content.trim();
    
    // Additional fallback check - if the generated title seems inappropriate for simple input
    const userMessages = contextMessages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      const firstUserMessage = userMessages[0].content.toLowerCase().trim();
      if (firstUserMessage.length <= 5 && !title.toLowerCase().includes('test')) {
        title = 'Test Chat';
      }
    }
    
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
