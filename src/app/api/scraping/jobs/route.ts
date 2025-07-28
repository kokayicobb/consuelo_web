// src/app/api/scraping/jobs/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/scraping/jobs called");
    
    const { userId } = await auth()
    if (!userId) {
      console.log("❌ No userId from auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("✅ User authenticated:", userId);

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      console.log("❌ User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("✅ User found in database:", user.id);

    // Get jobs with campaign details
    const { data: jobs, error } = await supabase
      .from('scraping_jobs')
      .select(`
        *,
        scraping_campaigns (
          name,
          platforms,
          description
        )
      `)
      .eq('scraping_campaigns.user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("❌ Error fetching jobs:", error);
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    console.log(`✅ Found ${jobs?.length || 0} jobs for user`);
    return NextResponse.json({ jobs: jobs || [] })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 POST /api/scraping/jobs called");
    
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId, jobType = 'manual', platforms } = body

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID required" }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('scraping_campaigns')
      .select('id, platforms')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Create new job
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .insert({
        campaign_id: campaignId,
        job_type: jobType,
        status: 'pending',
        platforms_to_scrape: platforms || campaign.platforms,
        stats: { leads_found: 0, pages_scraped: 0, errors: 0 }
      })
      .select()
      .single()

    if (jobError) {
      console.error("❌ Error creating job:", jobError);
      return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
    }

    console.log("✅ Job created:", job.id);
    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
