// src/app/api/scraping/leads/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/scraping/leads called");
    
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const enrichmentStatus = searchParams.get('enrichment_status')
    const hasEmail = searchParams.get('has_email') === 'true'
    const hasPhone = searchParams.get('has_phone') === 'true'
    const minScore = searchParams.get('min_score')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build query
    let query = supabase
      .from('scraped_leads')
      .select(`
        *,
        scraping_campaigns (
          name,
          platforms
        ),
        scraping_jobs (
          id,
          status,
          created_at
        ),
        enrichment_data (
          provider,
          work_email,
          company_name,
          seniority_level
        )
      `)
      .eq('scraping_campaigns.user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }
    if (platform) {
      query = query.eq('platform', platform)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (enrichmentStatus) {
      query = query.eq('enrichment_status', enrichmentStatus)
    }
    if (hasEmail) {
      query = query.not('email', 'is', null)
    }
    if (hasPhone) {
      query = query.not('phone', 'is', null)
    }
    if (minScore) {
      query = query.gte('lead_score', parseFloat(minScore))
    }

    const { data: leads, error } = await query

    if (error) {
      console.error("❌ Error fetching leads:", error);
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('scraped_leads')
      .select('id', { count: 'exact', head: true })
      .eq('scraping_campaigns.user_id', user.id)

    if (campaignId) countQuery = countQuery.eq('campaign_id', campaignId)
    if (platform) countQuery = countQuery.eq('platform', platform)
    if (status) countQuery = countQuery.eq('status', status)
    if (enrichmentStatus) countQuery = countQuery.eq('enrichment_status', enrichmentStatus)
    if (hasEmail) countQuery = countQuery.not('email', 'is', null)
    if (hasPhone) countQuery = countQuery.not('phone', 'is', null)
    if (minScore) countQuery = countQuery.gte('lead_score', parseFloat(minScore))

    const { count, error: countError } = await countQuery

    console.log(`✅ Found ${leads?.length || 0} leads for user`);
    return NextResponse.json({ 
      leads: leads || [], 
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + (leads?.length || 0)
    })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 POST /api/scraping/leads called");
    
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      campaignId, 
      jobId,
      platform,
      leads 
    } = body

    if (!campaignId || !platform || !Array.isArray(leads)) {
      return NextResponse.json({ 
        error: "Campaign ID, platform, and leads array are required" 
      }, { status: 400 })
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
      .select('id, total_leads_found')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Prepare leads for insertion
    const leadsToInsert = leads.map(lead => ({
      campaign_id: campaignId,
      job_id: jobId || null,
      platform,
      ...lead,
      status: lead.status || 'new',
      lead_score: lead.lead_score || 0,
      is_duplicate: false,
      enrichment_status: 'pending'
    }))

    // Insert leads
    const { data: insertedLeads, error: insertError } = await supabase
      .from('scraped_leads')
      .insert(leadsToInsert)
      .select()

    if (insertError) {
      console.error("❌ Error inserting leads:", insertError);
      return NextResponse.json({ error: "Failed to insert leads" }, { status: 500 })
    }

    // Update campaign stats
    const { error: updateError } = await supabase
      .from('scraping_campaigns')
      .update({ 
        total_leads_found: (campaign.total_leads_found || 0) + (insertedLeads?.length || 0),
        last_run_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    if (updateError) {
      console.error("❌ Error updating campaign stats:", updateError);
    }

    console.log(`✅ Inserted ${insertedLeads?.length || 0} leads`);
    return NextResponse.json({ 
      success: true, 
      leads: insertedLeads,
      count: insertedLeads?.length || 0
    })
  } catch (error) {
    console.error("Error creating leads:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("🔄 PATCH /api/scraping/leads called");
    
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { leadId, updates } = body

    if (!leadId || !updates) {
      return NextResponse.json({ 
        error: "Lead ID and updates are required" 
      }, { status: 400 })
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

    // Verify lead ownership through campaign
    const { data: lead, error: leadError } = await supabase
      .from('scraped_leads')
      .select(`
        id,
        scraping_campaigns!inner (
          user_id
        )
      `)
      .eq('id', leadId)
      .eq('scraping_campaigns.user_id', user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Update lead
    const { data: updatedLead, error: updateError } = await supabase
      .from('scraped_leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Error updating lead:", updateError);
      return NextResponse.json({ error: "Failed to update lead" }, { status: 500 })
    }

    console.log("✅ Lead updated:", leadId);
    return NextResponse.json({ success: true, lead: updatedLead })
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}