import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Client = {
  "Client ID": string
  Client: string | null
  email: string | null
  phone: string | null
  "Last Visit": string | null
  "# Visits": number | null
  "Pricing Option": string | null
  "Expiration Date": string | null
  Staff: string | null
  "Cross Regional Visit": string | null
  "Visit Type": string | null
  "Booking Method": string | null
  "Referral Type": string | null
  created_at: string | null
  updated_at: string | null
  title: string | null
  company: string | null
  address: string | null
  linkedin: string | null
  priority: string | null
  status: string | null
  segment: string | null
  relationship_manager: string | null
  notes: string | null
  total_assets_under_management: number | null
  recent_deal_value: number | null
  product_interests: string[] | null
  last_review_date: string | null
  user_id: string
  twitter_handle: string | null
  facebook_profile: string | null
  reddit_username: string | null
  instagram_handle: string | null
  assigned_to: string | null
  tags: string[] | null
  last_contact_date: string | null
  first_contact_date: string | null
  total_messages_count: number | null
  engagement_score: number | null
  current_cadence_name: string | null
  next_contact_date: string | null
  user_profile_id: number | null
  company_id: number | null
}

export type BusinessKPI = {
  id: string
  metric_name: string
  metric_type: string
  value: number
  period_start: string
  period_end: string
  period_type: string
  department: string | null
  created_at: string | null
  updated_at: string | null
}
