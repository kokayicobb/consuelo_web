// src/app/api/conference-twiml/route.ts
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  const twiml = new twilio.twiml.VoiceResponse()
  
  const searchParams = request.nextUrl.searchParams
  const room = searchParams.get('room') || 'default-room'
  
  // Add a greeting for the first person (agent)
  twiml.say({
    voice: 'alice'
  }, 'Connecting you to the call. Please wait.')
  
  // Create the conference
  const dial = twiml.dial()
  dial.conference({
    startConferenceOnEnter: true,
    endConferenceOnExit: true,
    waitUrl: 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical',
    statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/conference-status`,
    statusCallbackEvent: ['start', 'end', 'join', 'leave', 'mute'],
    record: 'record-from-start',
    recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/recording-status`
  }, room)

  return new NextResponse(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml'
    }
  })
}