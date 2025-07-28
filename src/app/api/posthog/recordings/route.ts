import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json()
    
    const posthogApiKey = process.env.POSTHOG_PERSONAL_ACCESS_TOKEN
    const posthogProjectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID
    
    if (!posthogApiKey || !posthogProjectId) {
      return NextResponse.json(
        { error: 'PostHog configuration missing' },
        { status: 500 }
      )
    }

    // Build query parameters
    const params = new URLSearchParams({
      limit: '50',
      offset: '0',
    })

    if (filters.date_from) params.append('date_from', filters.date_from)
    if (filters.date_to) params.append('date_to', filters.date_to)
    
    const response = await fetch(
      `https://app.posthog.com/api/projects/${posthogProjectId}/session_recordings/?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${posthogApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`PostHog API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Filter based on duration and search if needed
    let filteredResults = data.results || []
    
    if (filters.duration_filter !== 'all') {
      filteredResults = filteredResults.filter((recording: any) => {
        const duration = recording.duration
        switch (filters.duration_filter) {
          case 'short': return duration < 60
          case 'medium': return duration >= 60 && duration <= 300
          case 'long': return duration > 300
          default: return true
        }
      })
    }
    
    if (filters.search) {
      filteredResults = filteredResults.filter((recording: any) => 
        recording.person?.properties?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        recording.distinct_id.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    return NextResponse.json({ results: filteredResults })
  } catch (error) {
    console.error('Error fetching recordings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    )
  }
}