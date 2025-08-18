import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Define generation configuration for the AI
const generationConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 200, // Limit response length for roleplay
};

// Define safety settings to block harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

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

    if (message === undefined || message === null) {
      console.error('❌ No message provided to chat API');
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    console.log('🤖 Creating Gemini model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Construct the initial system instruction for the AI's persona
    const systemInstruction = `You are a prospect for a cold call. The scenario is: ${scenario}. Your goal is to act as a realistic, challenging, or open prospect based on the scenario. Do not break character. Respond concisely as a person would in a real conversation.`;
    console.log('🤖 System instruction:', systemInstruction);

    // Format history for Gemini API: [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
    const formattedHistory = history.map((entry: { role: string; text: string }) => ({
      role: entry.role === 'user' ? 'user' : 'model',
      parts: [{ text: entry.text }],
    }));
    console.log('🤖 Formatted history:', formattedHistory);

    // Start a chat session with the full history and system instruction
    console.log('🤖 Starting chat session...');
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig,
      safetySettings,
    });

    // Send the current user message to the AI
    const userMessage = message.trim() === "" ? "[This is the start of the conversation - please greet the sales agent as the prospect]" : message;
    console.log('🤖 Sending message to Gemini:', userMessage);
    
    const result = await retryOperation(() => chat.sendMessage(userMessage));
    console.log('🤖 Raw Gemini result:', JSON.stringify(result, null, 2));
    
    const responseText = result.response.text();
    console.log('🤖 Gemini response text:', responseText);
    console.log('🤖 Response length:', responseText?.length);
    
    if (!responseText || responseText.trim() === '') {
      console.error('❌ Empty response from Gemini');
      console.log('🤖 Full result object:', JSON.stringify(result, null, 2));
      
      // Try to provide a fallback response
      const fallbackResponse = "Hello, you've reached me at a bit of a busy time. What's this regarding?";
      console.log('🤖 Using fallback response:', fallbackResponse);
      return NextResponse.json({ response: fallbackResponse });
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to get AI response', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}