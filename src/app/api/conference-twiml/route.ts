// src/app/api/conference-twiml/route.ts
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'


export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const room = searchParams.get('room')
  const customerNumber = searchParams.get('customerNumber')

  if (!room) {
    return new NextResponse('Missing room parameter', { status: 400 })
  }

  const twiml = new twilio.twiml.VoiceResponse()
  twiml.say('Connecting you to the customer. Please wait.')

  const dial = twiml.dial()
  dial.conference(
    {
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/call-status`,
      statusCallbackEvent: ['start', 'end', 'join', 'leave', 'mute', 'hold'],
    },
    room
  )

  if (customerNumber) {
    // If the agent has answered, bridge the customer
    const customerDial = twiml.dial({ callerId: process.env.TWILIO_PHONE_NUMBER! })
    customerDial.number(customerNumber)
    twiml.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/api/conference-twiml?room=${room}`)
  }

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
