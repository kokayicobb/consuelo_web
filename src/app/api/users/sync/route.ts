import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"
import { ExtendedUser } from "@/types/clerk"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    const { userId } = await auth()
    const user = await currentUser() as ExtendedUser;


    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Upsert user in database
    const [dbUser] = await sql`
      INSERT INTO users (clerk_id, email, name, organization_id)
      VALUES (${userId}, ${user.emailAddresses[0]?.emailAddress}, ${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || null}, ${user.organizationMemberships[0]?.organization?.id || null})
      ON CONFLICT (clerk_id) 
      DO UPDATE SET 
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        organization_id = EXCLUDED.organization_id,
        updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json({ user: dbUser })
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
