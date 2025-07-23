// src/app/api/scraping/platforms/reddit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import FirecrawlApp from '@mendable/firecrawl-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!
});

interface RedditScrapingConfig {
  subreddits: string[];
  keywords?: string[];
  max_results?: number;
  include_comments?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, config }: { jobId: string; config: RedditScrapingConfig } = body;

    if (!jobId || !config || !config.subreddits || config.subreddits.length === 0) {
      return NextResponse.json(
        { error: 'Job ID and subreddit configuration required' },
        { status: 400 }
      );
    }

    // Update job status
    await supabase
      .from('scraping_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    const allLeads: any[] = [];
    const errors: string[] = [];

    // Process each subreddit
    for (const subreddit of config.subreddits) {
      try {
        // Build search query
        const searchTerms = config.keywords?.length 
          ? config.keywords.join(' OR ') 
          : 'looking for OR need OR recommend OR advice OR help';

        // Scrape subreddit posts
        const scrapeUrl = `https://www.reddit.com/r/${subreddit}/search/?q=${encodeURIComponent(searchTerms)}&restrict_sr=1&sort=new&t=week`;
        
        const result = await firecrawl.scrapeUrl(scrapeUrl, {
          formats: ['markdown'],
          onlyMainContent: true
        });

        if (!result.success) {
          throw new Error(`Failed to scrape r/${subreddit}`);
        }

        // Extract structured data from Reddit posts using the new format
        const extractPrompt = `Extract information about people looking for business services, products, or advice.
          For each relevant post, extract:
          - author_username: The Reddit username
          - post_title: The title of the post
          - post_content: Brief summary of what they're looking for
          - business_context: Any mentioned company, role, or business context
          - needs: Specific services or products they're seeking
          - contact_intent: Whether they seem ready to buy/hire (high/medium/low)
          - post_url: The URL to the specific post
          - engagement: Number of comments/upvotes if visible`;
        
        const extractSchema = z.object({
          posts: z.array(
            z.object({
              author_username: z.string(),
              post_title: z.string(),
              post_content: z.string(),
              business_context: z.string(),
              needs: z.array(z.string()),
              contact_intent: z.enum(['high', 'medium', 'low']),
              post_url: z.string(),
              engagement: z.object({}).passthrough()
            })
          )
        });

        const extractionResult = await firecrawl.scrapeUrl(scrapeUrl, {
          formats: ['extract'],
          extract: {
            prompt: extractPrompt,
            schema: extractSchema
          }
        });

        if (extractionResult.success && extractionResult.extract?.posts) {
          // Transform Reddit posts into leads
          const subredditLeads = extractionResult.extract.posts.map((post: any) => ({
            platform: 'reddit',
            reddit_username: post.author_username,
            full_name: post.author_username, // Reddit doesn't provide real names
            title: post.business_context || 'Reddit User',
            company: extractCompanyFromContext(post.business_context),
            source_url: post.post_url || scrapeUrl,
            source_content: post.post_content,
            scraped_data: {
              post_title: post.post_title,
              needs: post.needs,
              contact_intent: post.contact_intent,
              engagement: post.engagement,
              subreddit: subreddit
            },
            lead_score: calculateRedditLeadScore(post),
            status: post.contact_intent === 'high' ? 'qualified' : 'new'
          }));

          allLeads.push(...subredditLeads);
        }
      } catch (error) {
        console.error(`Error scraping r/${subreddit}:`, error);
        errors.push(`Failed to scrape r/${subreddit}: ${error.message}`);
      }
    }

    // Get job details to find campaign
    const { data: job } = await supabase
      .from('scraping_jobs')
      .select('campaign_id')
      .eq('id', jobId)
      .single();

    if (job && allLeads.length > 0) {
      // Insert leads into database
      const { error: insertError } = await supabase
        .from('scraped_leads')
        .insert(
          allLeads.map(lead => ({
            ...lead,
            campaign_id: job.campaign_id,
            job_id: jobId
          }))
        );

      if (insertError) {
        console.error('Error inserting leads:', insertError);
      }
    }

    // Update job with results
    await supabase
      .from('scraping_jobs')
      .update({
        status: errors.length > 0 && allLeads.length === 0 ? 'failed' : 'completed',
        completed_at: new Date().toISOString(),
        stats: {
          leads_found: allLeads.length,
          pages_scraped: config.subreddits.length,
          errors: errors.length
        },
        error_message: errors.length > 0 ? errors.join('; ') : null
      })
      .eq('id', jobId);

    // Log the scraping activity
    if (errors.length > 0) {
      await supabase
        .from('scraping_logs')
        .insert({
          job_id: jobId,
          campaign_id: job?.campaign_id,
          platform: 'reddit',
          log_level: 'error',
          message: 'Reddit scraping completed with errors',
          details: { errors, leads_found: allLeads.length }
        });
    }

    return NextResponse.json({
      success: true,
      leads_found: allLeads.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Reddit scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape Reddit', details: error.message },
      { status: 500 }
    );
  }
}

// Helper functions
function extractCompanyFromContext(context: string): string | null {
  if (!context) return null;
  
  // Look for patterns like "I work at X", "CEO of Y", "founder of Z"
  const patterns = [
    /(?:work(?:ing)?\s+(?:at|for)|employed\s+(?:at|by))\s+([A-Z][A-Za-z0-9\s&.]+)/i,
    /(?:CEO|CTO|founder|owner)\s+(?:of|at)\s+([A-Z][A-Za-z0-9\s&.]+)/i,
    /(?:my\s+company|our\s+startup),?\s+([A-Z][A-Za-z0-9\s&.]+)/i
  ];

  for (const pattern of patterns) {
    const match = context.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function calculateRedditLeadScore(post: any): number {
  let score = 0.5; // Base score

  // High intent signals
  if (post.contact_intent === 'high') score += 0.2;
  else if (post.contact_intent === 'medium') score += 0.1;

  // Has business context
  if (post.business_context) score += 0.1;

  // Has specific needs
  if (post.needs && post.needs.length > 0) score += 0.1;

  // Engagement level
  if (post.engagement?.comments > 5) score += 0.05;
  if (post.engagement?.upvotes > 10) score += 0.05;

  return Math.min(score, 1.0);
}