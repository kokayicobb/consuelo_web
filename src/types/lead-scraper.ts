// Updated types to match your SQL schema
export type PlatformType = "reddit" | "linkedin" | "website" | "hackernews" | "indiehackers" | "producthunt" | "twitter"

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "failed"

export type CampaignFrequency = "once" | "daily" | "weekly" | "monthly"

export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled"

export type LeadStatus = "new" | "qualified" | "contacted" | "nurturing" | "converted" | "disqualified"

export type EnrichmentStatus = "pending" | "enriched" | "failed" | "no_data"

export interface User {
  id: string
  clerk_id: string
  email: string
  name?: string
  organization_id?: string
  credits_remaining: number
  created_at: string
  updated_at: string
}

export interface ScrapingCampaign {
  id: string
  user_id: string
  name: string
  description?: string
  platforms: PlatformType[]
  keywords?: string[]
  negative_keywords?: string[]
  target_job_titles?: string[]
  target_industries?: string[]
  target_company_sizes?: string[]
  target_locations?: string[]
  frequency: CampaignFrequency
  schedule_config?: Record<string, any>
  filters?: Record<string, any>
  lead_scoring_rules?: Record<string, any>
  status: CampaignStatus
  last_run_at?: string
  next_run_at?: string
  total_leads_found: number
  created_at: string
  updated_at: string
   last_run?: string
  total_leads?: number; 
}

export interface PlatformConfiguration {
  id: string
  campaign_id: string
  platform: PlatformType
  config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ScrapingJob {
  id: string
  campaign_id: string
  job_type: string
  leads_found?: number
  status: JobStatus
  platforms_to_scrape?: PlatformType[]
  started_at?: string
  completed_at?: string
  error_message?: string
  stats?: Record<string, any>
  created_at: string
  campaign_name?: string // From join
}

export interface ScrapedLead {
  id: string;
  campaign_id: string;
  job_id?: string;
  platform: PlatformType;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  title?: string; // Add this
  company?: string; // Add this
  company_size?: string;
  industry?: string;
  location?: string;
  website?: string;
  linkedin_url?: string; // Add this
  twitter_handle?: string;
  reddit_username?: string;
  source_url: string;
  source_content?: string;
  scraped_data?: Record<string, any>;
  lead_score?: number;
  status: LeadStatus;
  is_duplicate: boolean;
  duplicate_of?: string;
  enrichment_status: EnrichmentStatus;
  enriched_at?: string;
  created_at: string;
  updated_at: string;

   work_email?: string; // Add this
  mobile_phone?: string; // Add this
}

export interface EnrichmentData {
  id: string
  lead_id: string
  provider: string
  work_email?: string
  personal_email?: string
  mobile_phone?: string
  office_phone?: string
  company_name?: string
  company_domain?: string
  company_size_range?: string
  company_revenue_range?: string
  company_industry?: string
  company_description?: string
  company_founded_year?: number
  company_employee_count?: number
  seniority_level?: string
  department?: string
  skills?: string[]
  education?: Record<string, any>[]
  work_history?: Record<string, any>[]
  social_profiles?: Record<string, any>
  technologies_used?: string[]
  raw_data?: Record<string, any>
  enriched_at: string
  created_at: string
}

export interface CreateCampaignRequest {
  targetCriteria: any
  schedule: any
  leadScoringRules: any
  platformConfigs: any
  name: string
  description?: string
  platforms: PlatformType[]
  keywords?: string[]
  negative_keywords?: string[]
  target_job_titles?: string[]
  target_industries?: string[]
  target_company_sizes?: string[]
  target_locations?: string[]
  frequency: CampaignFrequency
  schedule_config?: Record<string, any>
  filters?: Record<string, any>
  lead_scoring_rules?: Record<string, any>
  platform_configs: Array<{
    platform: PlatformType
    config: Record<string, any>
  }>
}

export interface UpdateCampaignRequest {
  name?: string
  description?: string
  status?: CampaignStatus
  platforms?: PlatformType[]
  keywords?: string[]
  negative_keywords?: string[]
  target_job_titles?: string[]
  target_industries?: string[]
  target_company_sizes?: string[]
  target_locations?: string[]
  frequency?: CampaignFrequency
  schedule_config?: Record<string, any>
  filters?: Record<string, any>
  lead_scoring_rules?: Record<string, any>
}

export interface LeadFilters {
  platform?: PlatformType
  status?: LeadStatus
  enrichment_status?: EnrichmentStatus
  date_range?: string
  campaign_id?: string
  has_email?: boolean
  has_phone?: boolean
  min_score?: number
}

export interface AnalyticsData {
  leadsOverTime: Array<{ date: string; leads: number }>
  platformDistribution: Array<{ name: string; count: number }>
  conversionRate: number
  totalLeads: number
  qualifiedLeads: number
  enrichedLeads: number
  creditsUsed: number
  creditsRemaining: number
}

export interface WebhookConfig {
  id: string
  user_id: string
  name: string
  url: string
  secret?: string
  events: string[]
  is_active: boolean
  headers?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PlatformApiConfig {
  id: string
  user_id: string
  platform: string
  api_key?: string
  config?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}
