// src/app/api/scraping/process-job/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(request: NextRequest) {
try {
console.log("🔄 Processing job request received");
const { jobId } = await request.json();

if (!jobId) {
  console.error("❌ No job ID provided");
  return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
}

console.log("📋 Processing job ID:", jobId);

// Get job details with campaign and platform configurations
const { data: job, error: jobError } = await supabase
  .from('scraping_jobs')
  .select(`
    *,
    scraping_campaigns (
      *,
      platform_configurations (*)
    )
  `)
  .eq('id', jobId)
  .single();

if (jobError || !job) {
  console.error("❌ Job not found:", jobError);
  return NextResponse.json({ error: 'Job not found' }, { status: 404 });
}

console.log("✅ Job found:", job.id, "Campaign:", job.scraping_campaigns.name);
console.log("🌐 Platforms to scrape:", job.platforms_to_scrape);

// Update job status to running
await supabase
  .from('scraping_jobs')
  .update({ 
    status: 'running',
    started_at: new Date().toISOString()
  })
  .eq('id', jobId);

console.log("🚀 Job status updated to running");

// Process each platform
const platformResults = [];
let totalLeads = 0;
let totalPages = 0;
let totalErrors = 0;

for (const platform of job.platforms_to_scrape) {
  console.log(`🌐 Starting ${platform} scraping...`);
  
  try {
    // Get platform-specific configuration
    const platformConfig = job.scraping_campaigns.platform_configurations
      .find((config: any) => config.platform === platform);

    console.log(`⚙️ ${platform} config:`, platformConfig?.config);

    let platformResult = null;

    switch (platform) {
      case 'reddit':
        platformResult = await processRedditScraping(jobId, platformConfig);
        break;
      case 'linkedin':
        platformResult = await processLinkedInScraping(jobId, platformConfig);
        break;
      case 'website':
        platformResult = await processWebsiteScraping(jobId, platformConfig);
        break;
      default:
        console.log(`⚠️ Platform ${platform} not implemented yet`);
        platformResults.push({
          platform,
          success: false,
          error: 'Platform not implemented',
          leads_found: 0
        });
        continue;
    }

    if (platformResult) {
      console.log(`✅ ${platform} completed:`, platformResult);
      platformResults.push({
        platform,
        success: platformResult.success,
        leads_found: platformResult.leads_found || 0,
        error: platformResult.error
      });

      if (platformResult.success) {
        totalLeads += platformResult.leads_found || 0;
        totalPages += 1;
      } else {
        totalErrors += 1;
      }
    }

  } catch (platformError) {
    console.error(`❌ Error processing ${platform}:`, platformError);
    platformResults.push({
      platform,
      success: false,
      error: platformError instanceof Error ? platformError.message : 'Unknown error',
      leads_found: 0
    });
    totalErrors += 1;
  }
}

// Determine final job status
const jobStatus = totalErrors > 0 && totalLeads === 0 ? 'failed' : 'completed';
const completedAt = new Date().toISOString();

console.log("📊 Final results:", {
  status: jobStatus,
  totalLeads,
  totalPages,
  totalErrors,
  platformResults
});

// Update job with completion status
await supabase
  .from('scraping_jobs')
  .update({
    status: jobStatus,
    completed_at: completedAt,
    stats: {
      leads_found: totalLeads,
      pages_scraped: totalPages,
      errors: totalErrors,
      platform_results: platformResults
    },
    error_message: totalErrors > 0 ? `${totalErrors} platform(s) failed` : null
  })
  .eq('id', jobId);

// Update campaign stats
const { data: currentCampaign } = await supabase
  .from('scraping_campaigns')
  .select('total_leads_found')
  .eq('id', job.campaign_id)
  .single();

await supabase
  .from('scraping_campaigns')
  .update({
    total_leads_found: (currentCampaign?.total_leads_found || 0) + totalLeads,
    last_run_at: completedAt
  })
  .eq('id', job.campaign_id);

// Log the activity
await supabase
  .from('scraping_logs')
  .insert({
    job_id: jobId,
    campaign_id: job.campaign_id,
    platform: 'orchestrator',
    log_level: jobStatus === 'failed' ? 'error' : 'info',
    message: `Job ${jobStatus} with ${totalLeads} leads found`,
    details: {
      platforms_processed: job.platforms_to_scrape,
      platform_results: platformResults,
      total_leads: totalLeads,
      total_errors: totalErrors
    }
  });

console.log(`🎉 Job ${jobId} ${jobStatus}! Total leads: ${totalLeads}`);

return NextResponse.json({
  success: true,
  job_status: jobStatus,
  stats: {
    leads_found: totalLeads,
    pages_scraped: totalPages,
    errors: totalErrors
  },
  platform_results: platformResults
});
} catch (error) {
console.error("💥 Error processing job:", error);
// Try to update job status to failed if we have a jobId
try {
  const body = await request.json();
  if (body.jobId) {
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error processing job'
      })
      .eq('id', body.jobId);
  }
} catch (updateError) {
  console.error("Failed to update job status:", updateError);
}

return NextResponse.json({ 
  error: 'Internal server error', 
  details: error instanceof Error ? error.message : 'Unknown error'
}, { status: 500 });
}
}
// Platform processing functions
async function processRedditScraping(jobId: string, platformConfig: any) {
console.log("🔍 Calling Reddit scraping API...");
try {
const config = {
subreddits: platformConfig?.config?.subreddits || ['startups'],
keywords: platformConfig?.config?.keywords || [],
max_results: platformConfig?.config?.max_results || 50,
include_comments: platformConfig?.config?.include_comments || false
};
const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scraping/platforms/reddit`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    jobId, 
    config 
  })
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.error || 'Reddit scraping failed');
}

return result;
} catch (error) {
console.error("❌ Reddit scraping failed:", error);
return {
success: false,
error: error instanceof Error ? error.message : 'Reddit scraping failed',
leads_found: 0
};
}
}
async function processLinkedInScraping(jobId: string, platformConfig: any) {
console.log("🔗 Calling LinkedIn scraping API...");
try {
const config = {
company_urls: platformConfig?.config?.company_urls || [],
search_keywords: platformConfig?.config?.search_keywords || [],
target_titles: platformConfig?.config?.target_titles || [],
target_industries: platformConfig?.config?.target_industries || [],
max_results: platformConfig?.config?.max_results || 50
};
const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scraping/platforms/linkedin`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    jobId, 
    config 
  })
});

const result = await response.json();

if (!response.ok) {
  throw new Error(result.error || 'LinkedIn scraping failed');
}

return result;
} catch (error) {
console.error("❌ LinkedIn scraping failed:", error);
return {
success: false,
error: error instanceof Error ? error.message : 'LinkedIn scraping failed',
leads_found: 0
};
}
}
async function processWebsiteScraping(jobId: string, platformConfig: any) {
console.log("🌐 Website scraping not yet implemented");
return {
success: false,
error: 'Website scraping not implemented',
leads_found: 0
};
}
// Health check endpoint
export async function GET() {
return NextResponse.json({
status: 'healthy',
service: 'job-processor',
timestamp: new Date().toISOString()
});
}