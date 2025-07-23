// src/app/api/conference-twiml/route.ts (MODIFIED for the client)
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  const twiml = new twilio.twiml.VoiceResponse()
  
  const searchParams = request.nextUrl.searchParams
  const room = searchParams.get('room') || 'default-room'
  
  // No need to say "Connecting you..." to the client, they are just answering a call.
  // A simple beep or silence is often best.
  
  const dial = twiml.dial()
  dial.conference({
    startConferenceOnEnter: true,
    // Set to FALSE for the client. You don't want the conference to end if they hang up.
    endConferenceOnExit: false, 
    // You can add status callbacks here too if you want
  }, room)

  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml'
    }
  })
}