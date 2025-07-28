import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    
    const posthogApiKey = process.env.POSTHOG_PERSONAL_ACCESS_TOKEN
    const posthogProjectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID
    
    if (!posthogApiKey || !posthogProjectId) {
      return NextResponse.json(
        { error: 'PostHog configuration missing' },
        { status: 500 }
      )
    }

    // Calculate date range
    const getDateRange = (period: string) => {
      const now = new Date()
      const start = new Date()
      
      switch (period) {
        case '1d':
          start.setDate(now.getDate() - 1)
          break
        case '7d':
          start.setDate(now.getDate() - 7)
          break
        case '30d':
          start.setDate(now.getDate() - 30)
          break
        case '90d':
          start.setDate(now.getDate() - 90)
          break
        default:
          start.setDate(now.getDate() - 7)
      }
      
      return {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      }
    }

    const { start, end } = getDateRange(period)

    // Fetch real PostHog web analytics data
    const [
      pageviews,
      uniqueVisitors,
      sessions,
      bounceRate,
      avgSessionDuration,
      topPages,
      trafficSources,
      deviceTypes,
      browserTypes,
      locations
    ] = await Promise.all([
      fetchPageviews(posthogApiKey, posthogProjectId, start, end),
      fetchUniqueVisitors(posthogApiKey, posthogProjectId, start, end),
      fetchSessions(posthogApiKey, posthogProjectId, start, end),
      fetchBounceRate(posthogApiKey, posthogProjectId, start, end),
      fetchAvgSessionDuration(posthogApiKey, posthogProjectId, start, end),
      fetchTopPages(posthogApiKey, posthogProjectId, start, end),
      fetchTrafficSources(posthogApiKey, posthogProjectId, start, end),
      fetchDeviceTypes(posthogApiKey, posthogProjectId, start, end),
      fetchBrowserTypes(posthogApiKey, posthogProjectId, start, end),
      fetchLocations(posthogApiKey, posthogProjectId, start, end)
    ])

    return NextResponse.json({
      period,
      date_range: { start, end },
      metrics: {
        pageviews,
        unique_visitors: uniqueVisitors,
        sessions,
        bounce_rate: bounceRate,
        avg_session_duration: avgSessionDuration,
        top_pages: topPages,
        traffic_sources: trafficSources,
        device_types: deviceTypes,
        browser_types: browserTypes,
        locations
      }
    })
  } catch (error) {
    console.error('Error fetching web analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch web analytics' },
      { status: 500 }
    )
  }
}

// PostHog API helper functions
async function fetchPageviews(apiKey: string, projectId: string, start: string, end: string) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', name: '$pageview', type: 'events' }],
        date_from: start,
        date_to: end,
        interval: 'day',
        display: 'ActionsLineGraph'
      })
    }
  )
  
  const data = await response.json()
  return {
    total: data.result?.[0]?.count || 0,
    timeline: data.result?.[0]?.data || [],
    labels: data.result?.[0]?.labels || []
  }
}

async function fetchUniqueVisitors(apiKey: string, projectId: string, start: string, end: string) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', name: '$pageview', type: 'events' }],
        date_from: start,
        date_to: end,
        interval: 'day',
        math: 'dau' // Daily Active Users
      })
    }
  )
  
  const data = await response.json()
  return {
    total: data.result?.[0]?.count || 0,
    timeline: data.result?.[0]?.data || [],
    labels: data.result?.[0]?.labels || []
  }
}

async function fetchSessions(apiKey: string, projectId: string, start: string, end: string) {
  // Use PostHog's session-based query
  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/query/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            SELECT 
              toDate(min(timestamp)) as date,
              uniq(\$session_id) as sessions,
              avg(session_duration) as avg_duration
            FROM (
              SELECT 
                \$session_id,
                min(timestamp) as session_start,
                max(timestamp) as session_end,
                dateDiff('second', min(timestamp), max(timestamp)) as session_duration
              FROM events 
              WHERE event = '\$pageview' 
                AND timestamp >= '${start}' 
                AND timestamp <= '${end}'
              GROUP BY \$session_id
            )
            GROUP BY date
            ORDER BY date
          `
        }
      })
    }
  )
  
  const data = await response.json()
  return {
    total: data.results?.reduce((sum: number, row: any) => sum + (row[1] || 0), 0) || 0,
    timeline: data.results?.map((row: any) => row[1] || 0) || [],
    avg_duration: data.results?.reduce((sum: number, row: any) => sum + (row[2] || 0), 0) / (data.results?.length || 1) || 0
  }
}

async function fetchBounceRate(apiKey: string, projectId: string, start: string, end: string) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/query/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            SELECT 
              countIf(page_count = 1) as bounced_sessions,
              count() as total_sessions,
              countIf(page_count = 1) / count() as bounce_rate
            FROM (
              SELECT 
                \$session_id,
                count() as page_count
              FROM events 
              WHERE event = '\$pageview' 
                AND timestamp >= '${start}' 
                AND timestamp <= '${end}'
              GROUP BY \$session_id
            )
          `
        }
      })
    }
  )
  
  const data = await response.json()
  const result = data.results?.[0] || [0, 0, 0]
  return {
    bounce_rate: result[2] || 0,
    bounced_sessions: result[0] || 0,
    total_sessions: result[1] || 0
  }
}

async function fetchAvgSessionDuration(apiKey: string, projectId: string, start: string, end: string) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/query/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            SELECT avg(session_duration) as avg_duration
            FROM (
              SELECT 
                \$session_id,
                dateDiff('second', min(timestamp), max(timestamp)) as session_duration
              FROM events 
              WHERE event = '\$pageview' 
                AND timestamp >= '${start}' 
                AND timestamp <= '${end}'
              GROUP BY \$session_id
              HAVING session_duration > 0
            )
          `
        }
      })
    }
  )
  
  const data = await response.json()
  return data.results?.[0]?.[0] || 0
}

async function fetchTopPages(apiKey: string, projectId: string, start: string, end: string) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', name: '$pageview', type: 'events' }],
        date_from: start,
        date_to: end,
        breakdown: '$current_url',
        breakdown_type: 'event'
      })
    }
  )
  
  const data = await response.json()
  return data.result?.map((item: any) => ({
    page: item.breakdown_value,
    views: item.count,
    percentage: 0 // Calculate after getting total
  })).slice(0, 10) || []
}

async function fetchTrafficSources(apiKey: string, projectId: string, start: string, end: string) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', name: '$pageview', type: 'events' }],
        date_from: start,
        date_to: end,
        breakdown: '$referring_domain',
        breakdown_type: 'event'
      })
    }
  )
  
  const data = await response.json()
  return data.result?.map((item: any) => ({
    source: item.breakdown_value || 'Direct',
    visitors: item.count,
    percentage: 0 // Calculate after getting total
  })).slice(0, 10) || []
}

async function fetchDeviceTypes(apiKey: string, projectId: string, start: string, end: string) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', name: '$pageview', type: 'events' }],
        date_from: start,
        date_to: end,
        breakdown: '$device_type',
        breakdown_type: 'event'
      })
    }
  )
  
  const data = await response.json()
  return data.result?.map((item: any) => ({
    device: item.breakdown_value,
    count: item.count,
    percentage: 0 // Calculate after getting total
  })) || []
}

async function fetchBrowserTypes(apiKey: string, projectId: string, start: string, end: string) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', name: '$pageview', type: 'events' }],
        date_from: start,
        date_to: end,
        breakdown: '$browser',
        breakdown_type: 'event'
      })
    }
  )
  
  const data = await response.json()
  return data.result?.map((item: any) => ({
    browser: item.breakdown_value,
    count: item.count,
    percentage: 0 // Calculate after getting total
  })).slice(0, 10) || []
}

async function fetchLocations(apiKey: string, projectId: string, start: string, end: string) {
  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{ id: '$pageview', name: '$pageview', type: 'events' }],
        date_from: start,
        date_to: end,
        breakdown: '$geoip_country_name',
        breakdown_type: 'event'
      })
    }
  )
  
  const data = await response.json()
  return data.result?.map((item: any) => ({
    country: item.breakdown_value,
    visitors: item.count,
    percentage: 0 // Calculate after getting total
  })).slice(0, 10) || []
}