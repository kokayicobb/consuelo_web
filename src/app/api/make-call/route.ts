// src/app/api/make-call/route.ts
import { initiateCall } from '@/components/Unified Commerce Dashboard/lib/actions/phone-call-actions'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sales_agent_number, customer_number } = body

    const result = await initiateCall(sales_agent_number, customer_number)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error ' },
      { status: 500 }
    )
  }
} 
