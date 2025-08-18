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
    const { message, history, scenario } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

    // Construct the initial system instruction for the AI's persona
    const systemInstruction = `You are a prospect for a cold call. The scenario is: ${scenario}. Your goal is to act as a realistic, challenging, or open prospect based on the scenario. Do not break character. Respond concisely as a person would in a real conversation.`;

    // Format history for Gemini API: [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
    const formattedHistory = history.map((entry: { role: string; text: string }) => ({
      role: entry.role === 'user' ? 'user' : 'model',
      parts: [{ text: entry.text }],
    }));

    // Start a chat session with the full history and system instruction
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig,
      safetySettings,
    });

    // Send the current user message to the AI
    const result = await retryOperation(() => chat.sendMessage(systemInstruction + "\n\nSales Agent: " + message));
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to get AI response', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}