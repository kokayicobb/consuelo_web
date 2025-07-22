// src/app/api/scraping/jobs/route.ts
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

    // Get user's internal ID
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // AFTER
const jobs = await sql`
  SELECT 
    sj.*,
    sc.name as campaign_name,
    sc.platform -- <--- THIS IS THE FIX
  FROM scraping_jobs sj
  JOIN scraping_campaigns sc ON sj.campaign_id = sc.id
  WHERE sc.user_id = ${user.id}
`

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
