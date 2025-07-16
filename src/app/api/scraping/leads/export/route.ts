import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const ids = searchParams.get("ids")

    let whereClause = "sc.user_id = $1"
    const params = [user.id]

    if (ids) {
      const leadIds = ids.split(",")
      whereClause += " AND sl.id = ANY($2)"
      params.push(leadIds)
    }

    const leads = await sql`
      SELECT 
        sl.full_name as name,
        COALESCE(sl.email, ed.work_email, ed.personal_email) as email,
        COALESCE(sl.phone, ed.mobile_phone, ed.office_phone) as phone,
        sl.title,
        COALESCE(sl.company, ed.company_name) as company,
        sl.location,
        sl.platform,
        sl.status,
        sl.enrichment_status,
        sl.lead_score,
        sl.source_url,
        sl.linkedin_url,
        sl.twitter_handle,
        sc.name as campaign_name,
        sl.created_at
      FROM scraped_leads sl
      JOIN scraping_campaigns sc ON sl.campaign_id = sc.id
      LEFT JOIN enrichment_data ed ON sl.id = ed.lead_id
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY sl.created_at DESC
    `

    if (format === "csv") {
      const csv = convertToCSV(leads)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="leads.csv"',
        },
      })
    } else {
      return new NextResponse(JSON.stringify(leads, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="leads.json"',
        },
      })
    }
  } catch (error) {
    console.error("Error exporting leads:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function convertToCSV(data: any[]) {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(",")

  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ""
      })
      .join(","),
  )

  return [csvHeaders, ...csvRows].join("\n")
}
