import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ScrapedLead, EnrichmentData } from "@/types/lead-scraper";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lead_ids } = await request.json();

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json({ error: "Invalid or empty lead_ids" }, { status: 400 });
    }

    // Get user's internal ID
    const [user] = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId}
    `;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // *** FIX IS HERE ***
    // We use a type assertion "as ScrapedLead[]" to tell TypeScript to trust the result of our query.
    // I also corrected the JOIN condition in the SQL.
    const leads = (await sql`
      SELECT sl.* FROM scraped_leads sl
      JOIN scraping_campaigns sc ON sl.campaign_id = sc.id
      WHERE sl.id = ANY(${lead_ids}) AND sc.user_id = ${user.id}
    `) as ScrapedLead[];

    if (leads.length === 0) {
      return NextResponse.json({ error: "No valid leads found for this user" }, { status: 404 });
    }

    let enrichedCount = 0;

    for (const lead of leads) {
      try {
        const apolloData = await enrichWithApollo(lead);

        if (apolloData) {
          // Insert enrichment data
          await sql`
            INSERT INTO enrichment_data (
              lead_id, provider, work_email, personal_email, mobile_phone, office_phone,
              company_name, company_domain, company_size_range, company_revenue_range,
              company_industry, company_description, company_founded_year, company_employee_count,
              seniority_level, department, skills, education, work_history,
              social_profiles, technologies_used, raw_data, enriched_at
            ) VALUES (
              ${lead.id}, 'apollo', ${apolloData.work_email}, ${apolloData.personal_email},
              ${apolloData.mobile_phone}, ${apolloData.office_phone},
              ${apolloData.company_name}, ${apolloData.company_domain},
              ${apolloData.company_size_range}, ${apolloData.company_revenue_range},
              ${apolloData.company_industry}, ${apolloData.company_description},
              ${apolloData.company_founded_year}, ${apolloData.company_employee_count},
              ${apolloData.seniority_level}, ${apolloData.department},
              ${apolloData.skills ? JSON.stringify(apolloData.skills) : null},
              ${apolloData.education ? JSON.stringify(apolloData.education) : '[]'},
              ${apolloData.work_history ? JSON.stringify(apolloData.work_history) : '[]'},
              ${apolloData.social_profiles ? JSON.stringify(apolloData.social_profiles) : '{}'},
              ${apolloData.technologies_used ? JSON.stringify(apolloData.technologies_used) : null},
              ${apolloData.raw_data ? JSON.stringify(apolloData.raw_data) : '{}'},
              NOW()
            )
          `;

          // Update lead enrichment status
          await sql`
            UPDATE scraped_leads
            SET
              enrichment_status = 'enriched',
              enriched_at = NOW(),
              email = COALESCE(email, ${apolloData.work_email || apolloData.personal_email}),
              phone = COALESCE(phone, ${apolloData.mobile_phone || apolloData.office_phone}),
              company = COALESCE(company, ${apolloData.company_name}),
              updated_at = NOW()
            WHERE id = ${lead.id}
          `;

          enrichedCount++;
        } else {
          // Mark as no data found
          await sql`
            UPDATE scraped_leads
            SET enrichment_status = 'no_data', updated_at = NOW()
            WHERE id = ${lead.id}
          `;
        }
      } catch (enrichError) {
        console.error(`Error enriching lead ${lead.id}:`, enrichError);
        // Mark as failed enrichment
        await sql`
          UPDATE scraped_leads
          SET enrichment_status = 'failed', updated_at = NOW()
          WHERE id = ${lead.id}
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Enriched ${enrichedCount} out of ${lead_ids.length} leads`,
      enriched_count: enrichedCount,
      total_requested: lead_ids.length,
    });
  } catch (error) {
    console.error("Error enriching leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Enriches a lead using the Apollo API.
 * @param lead The lead to enrich.
 * @returns A promise that resolves to an object with some or all properties of EnrichmentData, or null if no data is found.
 */
async function enrichWithApollo(lead: ScrapedLead): Promise<Partial<EnrichmentData> | null> {
  try {
    const apolloResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/apollo/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: lead.title,
        location: lead.location,
        industry: lead.industry,
        companySize: lead.company_size,
        fullName: lead.full_name,
        companyName: lead.company,
      }),
    });

    if (!apolloResponse.ok) {
      const errorBody = await apolloResponse.text();
      throw new Error(`Apollo API error: ${apolloResponse.status} - ${errorBody}`);
    }

    const apolloData = await apolloResponse.json();

    if (apolloData.people && apolloData.people.length > 0) {
      const bestMatch =
        apolloData.people.find(
          (person: any) =>
            (lead.full_name && person.name?.toLowerCase().includes(lead.full_name.toLowerCase())) ||
            (lead.company && person.organization?.name?.toLowerCase().includes(lead.company.toLowerCase()))
        ) || apolloData.people[0];

      return {
        work_email: bestMatch.email || null,
        personal_email: null,
        mobile_phone: bestMatch.phone || null,
        office_phone: null,
        company_name: bestMatch.organization?.name || null,
        company_domain: bestMatch.organization?.website_url || null,
        company_size_range: bestMatch.organization?.company_size_range || null,
        company_revenue_range: bestMatch.organization?.annual_revenue_range || null,
        company_industry: bestMatch.organization?.industry || null,
        company_description: bestMatch.organization?.short_description || null,
        company_founded_year: bestMatch.organization?.founded_year || null,
        company_employee_count: bestMatch.organization?.estimated_num_employees || null,
        seniority_level: bestMatch.seniority || null,
        department: bestMatch.department || null,
        skills: bestMatch.skills || null,
        education: bestMatch.education || [],
        work_history: bestMatch.employment_history || [],
        social_profiles: {
          linkedin: bestMatch.linkedin_url,
        },
        technologies_used: bestMatch.organization?.technologies || null,
        raw_data: bestMatch,
      };
    }

    return null;
  } catch (error) {
    console.error("Apollo enrichment error:", error);
    return null;
  }
}