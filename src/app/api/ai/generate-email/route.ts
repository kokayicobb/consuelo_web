// /app/api/ai/generate-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface GenerateEmailRequest {
  prompt?: string;
  recipientName?: string;
  recipientCompany?: string;
  recipientContext?: string;
  tone: 'professional' | 'friendly' | 'casual';
  emailType: 'cold' | 'follow-up' | 'meeting' | 'proposal';
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: GenerateEmailRequest = await request.json();

    // Build the system prompt
    const systemPrompt = `You are an expert sales email writer. Write compelling, personalized emails that get responses.

Key principles:
- Keep emails concise (under 150 words for cold emails)
- Lead with value, not your product
- Make it about them, not you
- Include a clear, soft call-to-action
- Use social proof when relevant
- Personalize based on context
- Match the requested tone exactly

Email Type: ${body.emailType}
Tone: ${body.tone}`;

    // Build the user prompt
    let userPrompt = `Write a ${body.tone} ${body.emailType} email`;

    if (body.recipientName) {
      userPrompt += ` to ${body.recipientName}`;
    }
    if (body.recipientCompany) {
      userPrompt += ` at ${body.recipientCompany}`;
    }
    if (body.recipientContext || body.prompt) {
      userPrompt += `.\n\nContext: ${body.recipientContext || body.prompt}`;
    }

    // Add specific instructions based on email type
    const emailTypeInstructions = {
      cold: '\n\nFor this cold email: Hook them with a specific observation about their business, present a clear value proposition, and end with a low-commitment ask.',
      'follow-up': '\n\nFor this follow-up: Reference the previous conversation, add new value or information, and suggest a specific next step.',
      meeting: '\n\nFor this meeting request: Reference a specific reason for meeting, propose 2-3 time options, and keep it brief.',
      proposal: '\n\nFor this proposal email: Summarize the key benefits, include clear pricing if appropriate, and outline next steps.',
    };

    userPrompt += emailTypeInstructions[body.emailType];

    // Create messages array for AI SDK
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      {
        role: 'user' as const,
        content: userPrompt,
      },
    ];

    // Generate email using AI SDK
    const result = streamText({
      model: groq("deepseek-r1-distill-llama-70b"),
      messages,
      maxTokens: 500,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Email generation error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}

// Generate subject lines - keeping this as a separate endpoint with JSON response
export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { emailBody, context } = await request.json();

    // For subject lines, we can use generateText instead of streamText for simpler JSON response
    const { generateText } = await import('ai');

    const { text } = await generateText({
      model: groq("deepseek-r1-distill-llama-70b"),
      prompt: `You are an expert at writing email subject lines that get high open rates. Generate 3 compelling subject lines for the given email. Make them specific, intriguing, and under 50 characters. Return only the subject lines, one per line.

Email content:
${emailBody}

Context: ${context || 'Business email'}`,
      temperature: 0.8,
      maxTokens: 150,
    });

    const subjects = text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[\d\.\-\*]\s*/, '').trim())
      .slice(0, 3);

    return NextResponse.json({ subjects });

  } catch (error) {
    console.error('Subject generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate subjects' },
      { status: 500 }
    );
  }
}