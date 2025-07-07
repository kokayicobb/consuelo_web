// src/app/api/agent-prompt-twiml/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  const twiml = new twilio.twiml.VoiceResponse();
  const searchParams = request.nextUrl.searchParams;
  const room = searchParams.get('room') || 'default-room';
  
  const gather = twiml.gather({
    numDigits: 1,
    // This is the CRUCIAL "brain" endpoint
    action: `/api/connect-client?room=${room}`, 
    method: 'POST',
  });

  gather.say('You have a new lead. Press any key to connect to the client.');

  // If the agent doesn't press anything, hang up.
  twiml.say('We did not receive any input. Goodbye.');
  twiml.hangup();

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}