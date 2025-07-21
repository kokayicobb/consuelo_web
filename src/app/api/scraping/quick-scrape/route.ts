// src/app/api/scraping/quick-scrape/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { PlatformType } from '@/types/lead-scraper';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_id: userId,
          email: '', // Will be updated from Clerk
          credits_remaining: 1000
        })
        .select()
        .single();

      if (createError || !newUser) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    const { searchTerm, platforms } = await request.json();

    if (!searchTerm || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Search term and platforms are required' },
        { status: 400 }
      );
    }

    // Create a quick campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('scraping_campaigns')
      .insert({
        user_id: user?.id,
        name: `Quick Scrape: ${searchTerm}`,
        description: `Quick scrape for "${searchTerm}" on ${platforms.join(', ')}`,
        platforms: platforms,
        keywords: [searchTerm],
        frequency: 'once',
        status: 'active'
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }

    // Create platform configurations
    const platformConfigs = platforms.map((platform: PlatformType) => {
      const config: any = {
        campaign_id: campaign.id,
        platform,
        is_active: true
      };

      // Platform-specific configs
      switch (platform) {
        case 'reddit':
          config.config = {
            subreddits: ['entrepreneur', 'startups', 'smallbusiness'],
            reddit_search_terms: [searchTerm],
            max_results: 25
          };
          break;
        case 'linkedin':
          config.config = {
            search_keywords: [searchTerm],
            max_results: 25
          };
          break;
        case 'hackernews':
          config.config = {
            search_terms: [searchTerm],
            max_results: 25
          };
          break;
        default:
          config.config = {
            keywords: [searchTerm],
            max_results: 25
          };
      }

      return config;
    });

    await supabase
      .from('platform_configurations')
      .insert(platformConfigs);

    // Create and start job
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .insert({
        campaign_id: campaign.id,
        job_type: 'manual',
        status: 'pending',
        platforms_to_scrape: platforms
      })
      .select()
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    // Process each platform
    for (const platform of platforms) {
      const platformConfig = platformConfigs.find(p => p.platform === platform);
      
      // Call platform-specific scraping endpoint
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scraping/platforms/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
        },
        body: JSON.stringify({
          jobId: job.id,
          config: platformConfig.config
        })
      }).catch(error => {
        console.error(`Failed to trigger ${platform} scraping:`, error);
      });
    }

    return NextResponse.json({
      success: true,
      campaign_id: campaign.id,
      job_id: job.id,
      message: `Started quick scrape on ${platforms.length} platforms`
    });
  } catch (error) {
    console.error('Quick scrape error:', error);
    return NextResponse.json(
      { error: 'Failed to start quick scrape' },
      { status: 500 }
    );
  }
}