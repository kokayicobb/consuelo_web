// src/app/api/talking-points/route.ts
import { generateTalkingPoints } from '@/components/Unified Commerce Dashboard/lib/actions/phone-call-actions'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const callSid = searchParams.get('call_sid')

    const result = await generateTalkingPoints(callSid || undefined)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}