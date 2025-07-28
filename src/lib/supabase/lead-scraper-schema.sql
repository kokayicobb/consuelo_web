-- Lead Scraper Database Schema
-- Run this in your Supabase SQL editor to create the required tables

-- Users table (may already exist)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  organization_id TEXT,
  credits_remaining INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraping campaigns
CREATE TABLE IF NOT EXISTS scraping_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  platforms TEXT[] NOT NULL, -- ['reddit', 'website', 'linkedin']
  target_websites TEXT[], -- for website scraping
  target_subreddits TEXT[], -- for reddit scraping
  keywords TEXT[],
  negative_keywords TEXT[],
  target_job_titles TEXT[],
  target_industries TEXT[],
  target_company_sizes TEXT[],
  target_locations TEXT[],
  frequency TEXT NOT NULL DEFAULT 'once', -- 'once', 'daily', 'weekly', 'monthly'
  schedule_config JSONB,
  filters JSONB,
  lead_scoring_rules JSONB,
  status TEXT NOT NULL DEFAULT 'active', -- 'draft', 'active', 'paused', 'completed', 'failed'
  total_leads_found INTEGER DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform configurations for campaigns
CREATE TABLE IF NOT EXISTS platform_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES scraping_campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'reddit', 'website', 'linkedin'
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraping jobs (individual runs)
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES scraping_campaigns(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL DEFAULT 'manual', -- 'scheduled', 'manual', 'test'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
  platforms_to_scrape TEXT[] NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  stats JSONB, -- {leads_found: 0, pages_scraped: 0, errors: 0}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped leads
CREATE TABLE IF NOT EXISTS scraped_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES scraping_campaigns(id) ON DELETE CASCADE,
  job_id UUID REFERENCES scraping_jobs(id),
  platform TEXT NOT NULL, -- 'reddit', 'website', 'linkedin'
  
  -- Contact info
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  title TEXT,
  company TEXT,
  company_size TEXT,
  industry TEXT,
  location TEXT,
  website TEXT,
  
  -- Social profiles
  reddit_username TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  
  -- Source data
  source_url TEXT NOT NULL,
  source_content TEXT,
  scraped_data JSONB,
  
  -- Lead quality
  lead_score REAL DEFAULT 0,
  status TEXT DEFAULT 'new', -- 'new', 'qualified', 'contacted', 'nurturing', 'converted', 'disqualified'
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of UUID REFERENCES scraped_leads(id),
  
  -- Enrichment
  enrichment_status TEXT DEFAULT 'pending', -- 'pending', 'enriched', 'failed', 'no_data'
  enriched_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrichment data
CREATE TABLE IF NOT EXISTS enrichment_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES scraped_leads(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  
  -- Contact info
  work_email TEXT,
  personal_email TEXT,
  mobile_phone TEXT,
  office_phone TEXT,
  
  -- Company details
  company_name TEXT,
  company_domain TEXT,
  company_size_range TEXT,
  company_revenue_range TEXT,
  company_industry TEXT,
  company_description TEXT,
  company_founded_year INTEGER,
  company_employee_count INTEGER,
  
  -- Person details
  seniority_level TEXT,
  department TEXT,
  skills TEXT[],
  education JSONB,
  work_history JSONB,
  
  -- Additional
  social_profiles JSONB,
  technologies_used TEXT[],
  raw_data JSONB,
  
  enriched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scraping_campaigns_user_id ON scraping_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_campaigns_status ON scraping_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_platform_configurations_campaign_id ON platform_configurations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_campaign_id ON scraping_jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraped_leads_campaign_id ON scraped_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_scraped_leads_job_id ON scraped_leads(job_id);
CREATE INDEX IF NOT EXISTS idx_scraped_leads_platform ON scraped_leads(platform);
CREATE INDEX IF NOT EXISTS idx_scraped_leads_status ON scraped_leads(status);
CREATE INDEX IF NOT EXISTS idx_scraped_leads_email ON scraped_leads(email);
CREATE INDEX IF NOT EXISTS idx_enrichment_data_lead_id ON enrichment_data(lead_id);

-- Row Level Security (RLS) policies
ALTER TABLE scraping_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_data ENABLE ROW LEVEL SECURITY;

-- Policies for scraping_campaigns
CREATE POLICY "Users can view their own campaigns" ON scraping_campaigns
  FOR SELECT USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can create campaigns" ON scraping_campaigns
  FOR INSERT WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can update their own campaigns" ON scraping_campaigns
  FOR UPDATE USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can delete their own campaigns" ON scraping_campaigns
  FOR DELETE USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Policies for platform_configurations
CREATE POLICY "Users can view their campaign configs" ON platform_configurations
  FOR SELECT USING (campaign_id IN (
    SELECT id FROM scraping_campaigns WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY "Users can create campaign configs" ON platform_configurations
  FOR INSERT WITH CHECK (campaign_id IN (
    SELECT id FROM scraping_campaigns WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY "Users can update their campaign configs" ON platform_configurations
  FOR UPDATE USING (campaign_id IN (
    SELECT id FROM scraping_campaigns WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

-- Policies for scraping_jobs
CREATE POLICY "Users can view their campaign jobs" ON scraping_jobs
  FOR SELECT USING (campaign_id IN (
    SELECT id FROM scraping_campaigns WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY "Service role can manage all jobs" ON scraping_jobs
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for scraped_leads
CREATE POLICY "Users can view their campaign leads" ON scraped_leads
  FOR SELECT USING (campaign_id IN (
    SELECT id FROM scraping_campaigns WHERE user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY "Service role can manage all leads" ON scraped_leads
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for enrichment_data
CREATE POLICY "Users can view their lead enrichment data" ON enrichment_data
  FOR SELECT USING (lead_id IN (
    SELECT id FROM scraped_leads WHERE campaign_id IN (
      SELECT id FROM scraping_campaigns WHERE user_id IN (
        SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
      )
    )
  ));

CREATE POLICY "Service role can manage all enrichment data" ON enrichment_data
  FOR ALL USING (auth.role() = 'service_role');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_scraping_campaigns_updated_at 
  BEFORE UPDATE ON scraping_campaigns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraped_leads_updated_at 
  BEFORE UPDATE ON scraped_leads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_configurations_updated_at 
  BEFORE UPDATE ON platform_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();