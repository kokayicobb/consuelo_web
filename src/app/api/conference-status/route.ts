// src/app/api/conference-status/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const conferenceSid = formData.get('ConferenceSid') as string
    const statusCallbackEvent = formData.get('StatusCallbackEvent') as string
    const participantCallSid = formData.get('CallSid') as string

    console.log(`Conference ${conferenceSid} event: ${statusCallbackEvent}`)

    // Handle conference events
    switch (statusCallbackEvent) {
      case 'participant-join':
        console.log(`Participant ${participantCallSid} joined`)
        break
      case 'participant-leave':
        console.log(`Participant ${participantCallSid} left`)
        break
      case 'conference-end':
        console.log(`Conference ${conferenceSid} ended`)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Conference status webhook error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}