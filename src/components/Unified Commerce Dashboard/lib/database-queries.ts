import { supabase, type Client, type BusinessKPI }from "./supabase"


export async function queryClients(filters: any = {}, limit = 50): Promise<Client[]> {
  try {
    let query = supabase.from("clients").select("*").eq("status", "active").limit(limit)

    // Apply filters
    if (filters.last_contact_days) {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - filters.last_contact_days)
      query = query.lt("last_contact_date", daysAgo.toISOString())
    }

    if (filters.engagement_score_below) {
      query = query.lt("engagement_score", filters.engagement_score_below)
    }

    if (filters.min_deal_value) {
      query = query.gte("recent_deal_value", filters.min_deal_value)
    }

    if (filters.expiring_soon) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      query = query.lt("Expiration Date", futureDate.toISOString().split("T")[0])
    }

    const { data, error } = await query

    if (error) {
      console.error("Error querying clients:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function queryBusinessKPIs(
  metricType?: string,
  periodType = "monthly",
  limit = 12,
): Promise<BusinessKPI[]> {
  try {
    let query = supabase
      .from("business_kpis")
      .select("*")
      .eq("period_type", periodType)
      .order("period_start", { ascending: false })
      .limit(limit)

    if (metricType) {
      query = query.eq("metric_type", metricType)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error querying KPIs:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function generateSQLFromNaturalLanguage(query: string): Promise<string> {
  // This would typically use an AI service to convert natural language to SQL
  // For now, we'll return some common patterns
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("haven't been contacted") && lowerQuery.includes("30 days")) {
    return `SELECT * FROM clients WHERE last_contact_date < NOW() - INTERVAL '30 days' AND status = 'active'`
  }

  if (lowerQuery.includes("high-value") && lowerQuery.includes("engagement")) {
    return `SELECT * FROM clients WHERE recent_deal_value > 50000 AND engagement_score < 50 AND status = 'active'`
  }

  if (lowerQuery.includes("revenue trends")) {
    return `SELECT * FROM business_kpis WHERE metric_type = 'revenue' ORDER BY period_start DESC LIMIT 12`
  }

  if (lowerQuery.includes("expiring") && lowerQuery.includes("month")) {
    return `SELECT * FROM clients WHERE "Expiration Date" BETWEEN NOW() AND NOW() + INTERVAL '30 days' AND status = 'active'`
  }

  // Default query
  return `SELECT * FROM clients WHERE status = 'active' LIMIT 10`
}

export async function executeGeneratedSQL(sqlQuery: string): Promise<any[]> {
  try {
    // For security, we'll map common queries to safe Supabase calls
    // In production, you'd want a more sophisticated SQL parser/validator

    if (sqlQuery.includes("last_contact_date < NOW() - INTERVAL '30 days'")) {
      return await queryClients({ last_contact_days: 30 })
    }

    if (sqlQuery.includes("recent_deal_value > 50000 AND engagement_score < 50")) {
      return await queryClients({ min_deal_value: 50000, engagement_score_below: 50 })
    }

    if (sqlQuery.includes("business_kpis") && sqlQuery.includes("revenue")) {
      return await queryBusinessKPIs("revenue")
    }

    if (sqlQuery.includes('"Expiration Date"') && sqlQuery.includes("30 days")) {
      return await queryClients({ expiring_soon: true })
    }

    // Default fallback
    return await queryClients()
  } catch (error) {
    console.error("Error executing SQL:", error)
    throw error
  }
}

export async function getKPIData(kpiType: string, period = "monthly", limit = 12): Promise<any[]> {
  try {
    const kpis = await queryBusinessKPIs(kpiType, period, limit)

    // Transform data for charts
    return kpis
      .map((kpi) => ({
        name: new Date(kpi.period_start).toLocaleDateString("en-US", {
          month: "short",
          year: period === "monthly" ? "2-digit" : undefined,
        }),
        value: Number(kpi.value),
        period_start: kpi.period_start,
        period_end: kpi.period_end,
        metric_name: kpi.metric_name,
      }))
      .reverse() // Reverse to show chronological order
  } catch (error) {
    console.error("Error getting KPI data:", error)
    // Return mock data as fallback
    return [
      { name: "Jan", value: 4000 },
      { name: "Feb", value: 3000 },
      { name: "Mar", value: 5000 },
      { name: "Apr", value: 4500 },
      { name: "May", value: 6000 },
      { name: "Jun", value: 5500 },
    ]
  }
}
