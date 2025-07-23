// PASTE THIS ENTIRE BLOCK INTO YOUR FILE

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's internal ID
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");
    const enrichmentStatus = searchParams.get("enrichment_status");
    const dateRange = searchParams.get("date_range") || "7d";
    const campaignId = searchParams.get("campaign_id");
    const hasEmail = searchParams.get("has_email");
    const hasPhone = searchParams.get("has_phone");
    const minScore = searchParams.get("min_score");

    // >>> THIS IS THE FIX <<<
    // We use parseInt() to convert the string values from the URL into numbers.
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    // Dynamically build the WHERE clause for filtering
    const whereConditions = [`sc.user_id = '${user.id}'`];

    if (platform && platform !== "all") {
      whereConditions.push(`sl.platform = '${platform}'`);
    }

    if (status && status !== "all") {
      whereConditions.push(`sl.status = '${status}'`);
    }

    if (enrichmentStatus && enrichmentStatus !== "all") {
      whereConditions.push(`sl.enrichment_status = '${enrichmentStatus}'`);
    }

    if (campaignId) {
      whereConditions.push(`sl.campaign_id = '${campaignId}'`);
    }

    if (hasEmail === "true") {
      whereConditions.push("sl.email IS NOT NULL AND sl.email != ''");
    }

    if (hasPhone === "true") {
      whereConditions.push("sl.phone IS NOT NULL AND sl.phone != ''");
    }

    if (minScore) {
      whereConditions.push(`sl.lead_score >= ${Number.parseFloat(minScore)}`);
    }

    const daysBack = parseInt(dateRange.replace("d", ""), 10);
    if (!isNaN(daysBack)) {
      whereConditions.push(`sl.created_at >= NOW() - INTERVAL '${daysBack} days'`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Get leads with enrichment data using the corrected query
    const leads = await sql`
      SELECT 
        sl.*,
        sc.name as campaign_name,
        ed.work_email,
        ed.mobile_phone
      FROM 
        scraped_leads sl
      JOIN 
        scraping_campaigns sc ON sl.campaign_id = sc.id
      LEFT JOIN
        enrichment_data ed ON sl.id = ed.lead_id
      WHERE 
        ${sql.unsafe(whereClause)}
      ORDER BY 
        sl.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count with the same filters
    const [countResult] = await sql`
      SELECT COUNT(*) as total
      FROM scraped_leads sl
      JOIN scraping_campaigns sc ON sl.campaign_id = sc.id
      WHERE ${sql.unsafe(whereClause)}
    `;

    const totalLeads = Number(countResult.total || 0);

    return NextResponse.json({
      leads,
      pagination: {
        total: totalLeads,
        limit,
        offset,
        hasMore: totalLeads > offset + leads.length,
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}