// src/app/api/scraping/campaigns/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import type { ScrapingCampaign, CreateCampaignRequest } from '@/types/lead-scraper';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// The GET function remains the same.
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('scraping_campaigns')
      .select(`
        *,
        platform_configurations (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    return NextResponse.json({ campaigns: campaigns || [] });
  } catch (error) {
    console.error('Unexpected error in GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// The POST function is updated with proper type handling
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body: CreateCampaignRequest = await request.json();

    // --- LOGGING STEP 1: Log the exact data being used for the insert ---
    console.log("Attempting to create campaign with body:", JSON.stringify(body, null, 2));

    if (!body.name || !body.platforms || body.platforms.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one platform are required' },
        { status: 400 }
      );
    }

    const campaignToInsert = {
      user_id: user.id,
      name: body.name,
      description: body.description,
      platforms: body.platforms,
      keywords: body.keywords,
      // negative_keywords: body.targetCriteria?.negative_keywords,
      target_job_titles: body.targetCriteria?.job_titles,
      target_industries: body.targetCriteria?.industries,
      target_company_sizes: body.targetCriteria?.company_sizes,
      target_locations: body.targetCriteria?.locations,
      frequency: body.frequency,
      schedule_config: body.schedule,
      // filters: body.filters,
      // lead_scoring_rules: body.leadScoringRules,
      status: 'active' as const
    };

    // --- LOGGING STEP 2: Log the object that will be inserted into Supabase ---
    console.log("Inserting the following object into 'scraping_campaigns':", JSON.stringify(campaignToInsert, null, 2));

    const { data: campaign, error: campaignError } = await supabase
      .from('scraping_campaigns')
      .insert(campaignToInsert)
      .select()
      .single();

    if (campaignError) {
      // --- LOGGING STEP 3: THIS IS THE MOST IMPORTANT LOG ---
      console.error('💥 SUPABASE ERROR while creating campaign:', JSON.stringify(campaignError, null, 2));
      
      return NextResponse.json({
        error: 'Failed to create campaign in database.',
        details: campaignError.message,
        code: campaignError.code,
      }, { status: 500 });
    }

    // Handle platform configurations if provided
    if (body.platformConfigs && campaign) {
      const platformConfigs = Object.entries(body.platformConfigs).map(([platform, config]) => ({
        campaign_id: campaign.id,
        platform,
        config,
        is_active: true
      }));

      const { error: configError } = await supabase
        .from('platform_configurations')
        .insert(platformConfigs);

      if (configError) {
        console.error('Error creating platform configs:', JSON.stringify(configError, null, 2));
      }
    }
    
    // Create initial job for 'once' frequency
    if (body.frequency === 'once' && campaign) {
      const { error: jobError } = await supabase
        .from('scraping_jobs')
        .insert({
          campaign_id: campaign.id,
          job_type: 'manual' as const,
          status: 'pending' as const,
          platforms_to_scrape: body.platforms
        });

      if (jobError) {
        console.error('Error creating initial job:', JSON.stringify(jobError, null, 2));
      }
    }

    return NextResponse.json({
      campaign,
      message: 'Campaign created successfully'
    });
  } catch (error: any) {
    // --- LOGGING STEP 4: Catch any other unexpected errors ---
    console.error('💥 UNEXPECTED ERROR in POST route:', error);
    return NextResponse.json({
        error: 'An internal server error occurred.',
        details: error.message
    }, { status: 500 });
  }
}