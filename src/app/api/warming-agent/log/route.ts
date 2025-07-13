// app/api/warming-agent/log/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { getToken } = await auth()
    const token = await getToken()
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create authenticated Supabase client
    const supabase = createClerkSupabaseClient(token)

    // Fetch warming logs with client information
    const { data: logEntries, error } = await supabase
      .from('warming_log')
      .select(`
        id,
        created_at,
        status,
        generated_subject,
        generated_body,
        error_message,
        cadence_name,
        cadence_step_prompt,
        clients!inner (
          "Client ID",
          "Client",
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching warming logs:', error)
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      logEntries: logEntries || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Trigger the warming agent manually (for testing)
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId, getToken } = await auth()
    const token = await getToken()
    
    if (!token || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Optional: Add role-based access control
    // You could check if user has admin role or specific permissions here
    // const supabase = createClerkSupabaseClient(token)
    // const { data: userProfile } = await supabase
    //   .from('user_profiles')
    //   .select('role')
    //   .eq('clerk_user_id', userId)
    //   .single()
    // 
    // if (userProfile?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    // }

    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration not found')
    }

    console.log('Triggering warming agent for user:', userId)
    console.log('Calling Edge Function:', `${supabaseUrl}/functions/v1/warming-agent`)
    
    // Call the Edge Function with anon key (Edge Function uses service role internally)
    const response = await fetch(`${supabaseUrl}/functions/v1/warming-agent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        triggered_by: userId, // Track who triggered it
        timestamp: new Date().toISOString()
      })
    })

    console.log('Response status:', response.status)
    
    const result = await response.json()
    console.log('Response body:', result)

    if (!response.ok) {
      console.error('Edge function error:', result)
      throw new Error(result.error || 'Failed to trigger warming agent')
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      processed: result.processed,
      successful: result.successful,
      triggered_by: userId
    })

  } catch (error: any) {
    console.error('Error triggering warming agent:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to trigger warming agent'
    }, { status: 500 })
  }
}