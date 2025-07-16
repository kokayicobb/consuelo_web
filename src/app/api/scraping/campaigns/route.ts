import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"
import type { CreateCampaignRequest } from "@/types/lead-scraper"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's internal ID
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const campaigns = await sql`
      SELECT 
        sc.*,
        cs.total_leads,
        cs.qualified_leads,
        cs.enriched_leads,
        cs.last_run_at as stats_last_run
      FROM scraping_campaigns sc
      LEFT JOIN campaign_statistics cs ON sc.id = cs.id
      WHERE sc.user_id = ${user.id}
      ORDER BY sc.created_at DESC
    `

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's internal ID
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const data: CreateCampaignRequest = await request.json()

    // Create the campaign with the correct column names from your schema
    const [campaign] = await sql`
      INSERT INTO scraping_campaigns (
        user_id, name, description, platform, frequency, config, filters, 
        total_leads, status, created_at, updated_at
      ) VALUES (
        ${user.id}, 
        ${data.name}, 
        ${data.description || null}, 
        ${data.platforms[0] || "website"}, 
        ${data.frequency}, 
        ${JSON.stringify({
          platforms: data.platforms,
          keywords: data.keywords,
          negative_keywords: data.negative_keywords,
          target_job_titles: data.target_job_titles,
          target_industries: data.target_industries,
          target_company_sizes: data.target_company_sizes,
          target_locations: data.target_locations,
          schedule_config: data.schedule_config,
          lead_scoring_rules: data.lead_scoring_rules,
        })}, 
        ${JSON.stringify(data.filters || {})}, 
        0,
        'draft',
        NOW(),
        NOW()
      ) RETURNING *
    `

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
