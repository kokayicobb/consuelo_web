import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's internal ID and credits
    const [user] = await sql`
      SELECT id, credits_remaining FROM users WHERE clerk_id = ${userId}
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get total leads
    const [totalLeadsResult] = await sql`
      SELECT COUNT(*) as total
      FROM scraped_leads sl
      JOIN scraping_campaigns sc ON sl.campaign_id = sc.id
      WHERE sc.user_id = ${user.id}
    `

    // Get qualified leads
    const [qualifiedLeadsResult] = await sql`
      SELECT COUNT(*) as total
      FROM scraped_leads sl
      JOIN scraping_campaigns sc ON sl.campaign_id = sc.id
      WHERE sc.user_id = ${user.id} AND sl.status IN ('qualified', 'contacted', 'nurturing', 'converted')
    `

    // Get enriched leads
    const [enrichedLeadsResult] = await sql`
      SELECT COUNT(*) as total
      FROM scraped_leads sl
      JOIN scraping_campaigns sc ON sl.campaign_id = sc.id
      WHERE sc.user_id = ${user.id} AND sl.enrichment_status = 'enriched'
    `

    // Get leads over time (last 30 days)
    const leadsOverTime = await sql`
      SELECT 
        DATE(sl.created_at) as date,
        COUNT(*) as leads
      FROM scraped_leads sl
      JOIN scraping_campaigns sc ON sl.campaign_id = sc.id
      WHERE sc.user_id = ${user.id} 
        AND sl.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(sl.created_at)
      ORDER BY date
    `

    // Get platform distribution
    const platformDistribution = await sql`
      SELECT 
        sl.platform as name,
        COUNT(*) as count
      FROM scraped_leads sl
      JOIN scraping_campaigns sc ON sl.campaign_id = sc.id
      WHERE sc.user_id = ${user.id}
      GROUP BY sl.platform
      ORDER BY count DESC
    `

    // Calculate credits used (assuming 1000 starting credits)
    const creditsUsed = 1000 - user.credits_remaining

    const totalLeads = Number.parseInt(totalLeadsResult.total)
    const qualifiedLeads = Number.parseInt(qualifiedLeadsResult.total)
    const enrichedLeads = Number.parseInt(enrichedLeadsResult.total)

    return NextResponse.json({
      totalLeads,
      qualifiedLeads,
      enrichedLeads,
      conversionRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
      creditsUsed,
      creditsRemaining: user.credits_remaining,
      leadsOverTime: leadsOverTime.map((row) => ({
        date: row.date,
        leads: Number.parseInt(row.leads),
      })),
      platformDistribution: platformDistribution.map((row) => ({
        name: row.name,
        count: Number.parseInt(row.count),
      })),
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
