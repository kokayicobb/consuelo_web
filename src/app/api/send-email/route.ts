// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Resend } from 'resend'

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { from, to, cc, bcc, subject, html } = body

    // Validate required fields
    if (!from || !to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      subject,
      html,
      // Optional: Add tags for tracking
      tags: [
        {
          name: 'user_id',
          value: userId,
        },
        {
          name: 'app',
          value: 'sales-ai-platform',
        },
      ],
    })
// In your API route (app/api/send-email/route.ts)
if (error) {
  console.error('Resend error:', error)
  
  // Check for domain verification error
  // Resend errors typically have a 'message' property
  if (error.message && error.message.includes('domain is not verified')) {
    return NextResponse.json(
      { 
        error: 'Email domain not verified. Please contact support@consuelohq.com for assistance.',
        isVerificationError: true 
      },
      { status: 403 }
    )
  }
  
  return NextResponse.json(
    { error: 'Failed to send email' },
    { status: 500 }
  )
}

    // Return success response with email ID
    return NextResponse.json({
      success: true,
      id: data?.id,
      message: 'Email sent successfully',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}