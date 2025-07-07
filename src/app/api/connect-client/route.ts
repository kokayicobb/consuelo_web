// src/app/api/connect-client/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize the Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Your Twilio phone number
const CLIENT_PHONE_NUMBER = process.env.CLIENT_PHONE_NUMBER; // The client's number to dial

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const room = searchParams.get('room') || 'default-room';

  // 1. Use the REST API to create a NEW call to the client
  try {
    await client.calls.create({
      to: CLIENT_PHONE_NUMBER,
      from: twilioPhoneNumber,
      // This URL tells the CLIENT's call what to do: join the conference
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/conference-twiml?room=${room}`,
    });
  } catch (error) {
    console.error("Error calling the client:", error);
    // Handle the error, maybe return TwiML saying the call failed
    const errorTwiml = new twilio.twiml.VoiceResponse();
    errorTwiml.say('Sorry, we could not connect to the client. Please try again later.');
    errorTwiml.hangup();
    return new NextResponse(errorTwiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
    });
  }

  // 2. Return TwiML to the AGENT's call, telling them to join the conference
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Connecting you to the client. Please wait.');
  const dial = twiml.dial();

  dial.conference(
    {
      startConferenceOnEnter: true,
      // This is important: now the conference only ends if the AGENT hangs up.
      endConferenceOnExit: true, 
      waitUrl: 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical',
    },
    room
  );

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}