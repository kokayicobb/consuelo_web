import { NextRequest, NextResponse } from 'next/server';

// Helper for exponential backoff retry mechanism
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 5,
  delay = 1000 // initial delay in ms
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential increase
      } else {
        throw error; // Re-throw if max retries reached
      }
    }
  }
  throw new Error("Max retries exceeded");
}

export async function POST(req: Request) {
  try {
    console.log('🤖 Chat API called');
    const body = await req.json();
    console.log('🤖 Chat request body:', body);
    
    const { message, history, scenario } = body;
    console.log('🤖 Message:', message, 'Type:', typeof message, 'Length:', message?.length);
    console.log('🤖 History length:', history?.length);
    console.log('🤖 Scenario:', scenario);

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not found in environment variables');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Build messages array for Groq
    const messages: any[] = [];
    
    // Add system message
    const systemMessage = `You are a prospect for a cold call. The scenario is: ${scenario}. Your goal is to act as a realistic, challenging, or open prospect based on the scenario. Do not break character. Respond concisely as a person would in a real conversation. Keep responses under 50 words.`;
    messages.push({
      role: 'system',
      content: systemMessage
    });

    // Add conversation history
    if (history && history.length > 0) {
      for (const entry of history) {
        messages.push({
          role: entry.role === 'user' ? 'user' : 'assistant',
          content: entry.text
        });
      }
    }

    // Add current user message
    const userMessage = message.trim() === "" 
      ? "Hello, I'm calling about a business opportunity. Do you have a moment to chat?"
      : message;
    
    messages.push({
      role: 'user',
      content: userMessage
    });

    console.log('🤖 Messages for Groq:', messages);

    // Call Groq API using direct fetch
    console.log('🤖 Calling Groq API...');
    const response = await retryOperation(async () => {
      return await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          model: "llama3-70b-8192", // Use Llama 3 70B for better responses
          temperature: 0.7,
          max_tokens: 150,
          top_p: 0.9,
        }),
      });
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const chatCompletion = await response.json();
    const responseText = chatCompletion.choices[0]?.message?.content;
    console.log('🤖 Groq response:', responseText);
    
    if (!responseText || responseText.trim() === '') {
      console.error('❌ Empty response from Groq');
      
      // Fallback response
      const fallbackResponse = "Hello, you've reached me at a bit of a busy time. What's this regarding?";
      console.log('🤖 Using fallback response:', fallbackResponse);
      return NextResponse.json({ response: fallbackResponse });
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('❌ Error in chat API:', error);
    return NextResponse.json({ 
      error: 'Failed to get AI response', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}