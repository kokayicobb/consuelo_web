import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { event_name, properties, distinct_id } = await request.json()
    
    const posthogProjectKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com'
    
    if (!posthogProjectKey) {
      return NextResponse.json(
        { error: 'PostHog project key missing' },
        { status: 500 }
      )
    }

    // Send event to PostHog capture endpoint
    const response = await fetch(`${posthogHost}/i/v0/e/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: posthogProjectKey,
        event: event_name,
        distinct_id: distinct_id || 'anonymous',
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          $lib: 'web-analytics-api',
          $lib_version: '1.0.0'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`PostHog capture failed: ${response.status}`)
    }

    return NextResponse.json({ success: true, event_captured: event_name })
  } catch (error) {
    console.error('Error capturing event:', error)
    return NextResponse.json(
      { error: 'Failed to capture event' },
      { status: 500 }
    )
  }
}