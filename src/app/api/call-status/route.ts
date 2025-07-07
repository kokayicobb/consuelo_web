// src/app/api/call-status/route.ts
import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const callSid = formData.get('CallSid') as string
    const callStatus = formData.get('CallStatus') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string

    // Log call status changes
    console.log(`Call ${callSid} status: ${callStatus}`)

    // You can update your database here based on status changes
    // For example, when call is 'completed', mark it as ended

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Call status webhook error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}