// src/types/lead-scraper.ts

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed';
export type CampaignFrequency = 'once' | 'daily' | 'weekly' | 'monthly';
export type PlatformType = 'reddit' | 'linkedin' | 'website' | 'hackernews' | 'indiehackers' | 'producthunt' | 'twitter';
export type LeadStatus = 'new' | 'qualified' | 'contacted' | 'nurturing' | 'converted' | 'disqualified';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type EnrichmentStatus = 'pending' | 'enriched' | 'failed' | 'no_data';

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name?: string;
  organization_id?: string;
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface ScrapingCampaign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  platforms: PlatformType[];
  keywords?: string[];
  negative_keywords?: string[];
  target_job_titles?: string[];
  target_industries?: string[];
  target_company_sizes?: string[];
  target_locations?: string[];
  frequency: CampaignFrequency;
  schedule_config?: any;
  filters?: any;
  lead_scoring_rules?: any;
  status: CampaignStatus;
  last_run_at?: string;
  next_run_at?: string;
  total_leads_found: number;
  created_at: string;
  updated_at: string;
}

export interface PlatformConfiguration {
  id: string;
  campaign_id: string;
  platform: PlatformType;
  config: {
    // Reddit specific
    subreddits?: string[];
    reddit_search_terms?: string[];
    
    // LinkedIn specific
    linkedin_search_url?: string;
    connection_degree?: number[];
    
    // Website specific
    website_urls?: string[];
    crawl_depth?: number;
    
    // Common
    max_results?: number;
    include_comments?: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScrapingJob {
  id: string;
  campaign_id: string;
  job_type: 'scheduled' | 'manual' | 'test';
  status: JobStatus;
  platforms_to_scrape: PlatformType[];
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  stats?: {
    leads_found: number;
    pages_scraped: number;
    errors: number;
  };
  created_at: string;
}

export interface ScrapedLead {
  id: string;
  campaign_id: string;
  job_id?: string;
  platform: PlatformType;
  
  // Basic info
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  title?: string;
  company?: string;
  company_size?: string;
  industry?: string;
  location?: string;
  website?: string;
  
  // Social profiles
  linkedin_url?: string;
  twitter_handle?: string;
  reddit_username?: string;
  
  // Metadata
  source_url: string;
  source_content?: string;
  scraped_data?: any;
  
  // Quality
  lead_score?: number;
  status: LeadStatus;
  is_duplicate: boolean;
  duplicate_of?: string;
  
  // Enrichment
  enrichment_status: EnrichmentStatus;
  enriched_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface EnrichmentData {
  id: string;
  lead_id: string;
  provider: string;
  
  // Contact info
  work_email?: string;
  personal_email?: string;
  mobile_phone?: string;
  office_phone?: string;
  
  // Company details
  company_name?: string;
  company_domain?: string;
  company_size_range?: string;
  company_revenue_range?: string;
  company_industry?: string;
  company_description?: string;
  company_founded_year?: number;
  company_employee_count?: number;
  
  // Person details
  seniority_level?: string;
  department?: string;
  skills?: string[];
  education?: any[];
  work_history?: any[];
  
  // Additional
  social_profiles?: any;
  technologies_used?: string[];
  raw_data?: any;
  
  enriched_at: string;
  created_at: string;
}

export interface FirecrawlWebhookPayload {
  success: boolean;
  type: 'crawl.page' | 'crawl.completed' | 'crawl.failed';
  id: string;
  data?: any[];
  metadata?: any;
  error?: string;
}

// Firecrawl types
export interface FirecrawlScrapeOptions {
  formats?: string[];
  onlyMainContent?: boolean;
  waitFor?: number;
  headers?: Record<string, string>;
}

export interface FirecrawlExtractOptions {
  prompt: string;
  schema?: any;
  formats?: string[];
  onlyMainContent?: boolean;
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  platforms: PlatformType[];
  platformConfigs: Partial<Record<PlatformType, any>>;
  keywords?: string[];
  targetCriteria?: {
    job_titles?: string[];
    industries?: string[];
    company_sizes?: string[];
    locations?: string[];
  };
  frequency: CampaignFrequency;
  schedule?: {
    time?: string;
    timezone?: string;
    days_of_week?: number[];
  };
}