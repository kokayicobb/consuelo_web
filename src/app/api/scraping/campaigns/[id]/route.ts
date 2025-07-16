// import { type NextRequest, NextResponse } from "next/server"
// import { auth } from "@clerk/nextjs/server"
// import { neon } from "@neondatabase/serverless"

// const sql = neon(process.env.DATABASE_URL!)

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { userId } = await auth()
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const data = await request.json()
//     const campaignId = params.id

//     const [campaign] = await sql`
//       UPDATE scraping_campaigns
//       SET ${sql(data)}, updated_at = NOW()
//       WHERE id = ${campaignId} AND user_id = ${userId}
//       RETURNING *
//     `

//     if (!campaign) {
//       return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
//     }

//     return NextResponse.json({ campaign })
//   } catch (error) {
//     console.error("Error updating campaign:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { userId } = await auth()
//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const campaignId = params.id

//     // Delete related jobs and leads first
//     await sql`DELETE FROM scraping_jobs WHERE campaign_id = ${campaignId}`
//     await sql`DELETE FROM scraped_leads WHERE campaign_id = ${campaignId}`

//     const [campaign] = await sql`
//       DELETE FROM scraping_campaigns
//       WHERE id = ${campaignId} AND user_id = ${userId}
//       RETURNING *
//     `

//     if (!campaign) {
//       return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
//     }

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error("Error deleting campaign:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }