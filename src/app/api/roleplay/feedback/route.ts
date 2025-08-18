import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

// Helper for exponential backoff retry mechanism (same as in chat route)
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
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

export async function POST(req: Request) {
  try {
    const { history, scenario } = await req.json();

    if (!history || history.length === 0) {
      return NextResponse.json({ error: 'No conversation history provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

    // Convert conversation history into a readable string for the AI
    let conversationString = '';
    history.forEach((entry: { role: string; text: string }) => {
      conversationString += `${entry.role === 'user' ? 'Sales Agent' : 'Prospect'}: ${entry.text}\n`;
    });

    const feedbackPrompt = `
      Analyze the following sales roleplay conversation based on the scenario: '${scenario}'.
      Provide constructive feedback focusing on the sales agent's performance in the following areas.
      Format your response as a JSON object with the specified keys.

      **Feedback Categories:**
      - **opening**: How well did the sales agent initiate the call and gain attention?
      - **discovery_questions**: Were effective questions asked to understand the prospect's needs and pain points?
      - **handling_objections**: How effectively were any objections from the prospect addressed and overcome?
      - **value_proposition**: Was the product/service value clearly and compellingly communicated?
      - **closing**: How was the attempt to close the deal or set clear next steps?
      - **overall_effectiveness**: A summary of overall performance and 1-2 key areas for improvement.

      **Conversation History:**
      ${conversationString}

      **JSON Structure Example:**
      \`\`\`json
      {
        "opening": "...",
        "discovery_questions": "...",
        "handling_objections": "...",
        "value_proposition": "...",
        "closing": "...",
        "overall_effectiveness": "..."
      }
      \`\`\`
    `;

    // Define the JSON schema for the expected feedback structure
    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        opening: { type: SchemaType.STRING },
        discovery_questions: { type: SchemaType.STRING },
        handling_objections: { type: SchemaType.STRING },
        value_proposition: { type: SchemaType.STRING },
        closing: { type: SchemaType.STRING },
        overall_effectiveness: { type: SchemaType.STRING }
      },
      required: [
        "opening",
        "discovery_questions",
        "handling_objections",
        "value_proposition",
        "closing",
        "overall_effectiveness"
      ]
    };

    const result = await retryOperation(() => model.generateContent({
      contents: [{ role: "user", parts: [{ text: feedbackPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      },
      safetySettings,
    }));

    const feedbackJson = JSON.parse(result.response.text());

    return NextResponse.json(feedbackJson);
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json({ error: 'Failed to generate feedback', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
