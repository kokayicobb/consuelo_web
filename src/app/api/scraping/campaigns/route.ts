// src/app/api/scraping/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  console.log("🔍 GET /api/scraping/campaigns called");
  
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log("❌ No userId from auth");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("✅ User authenticated:", userId);

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      console.error("❌ User not found:", userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get campaigns
    const { data: campaigns, error } = await supabase
      .from('scraping_campaigns')
      .select(`
        *,
        platform_configurations (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching campaigns:', error);
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    console.log(`✅ Found ${campaigns?.length || 0} campaigns`);
    return NextResponse.json({ campaigns: campaigns || [] });

  } catch (error: any) {
    console.error('💥 Unexpected error in GET:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/scraping/campaigns called");
  console.log("🕐 Timestamp:", new Date().toISOString());
  
  try {
    // Log request details
    console.log("📋 Request headers:", Object.fromEntries(request.headers.entries()));
    console.log("📋 Request method:", request.method);
    console.log("📋 Request URL:", request.url);

    const { userId } = await auth();
    if (!userId) {
      console.log("❌ No userId from auth");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("✅ User authenticated:", userId);

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      console.error("❌ User not found in database:", userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log("✅ User found in database:", user.id);

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("📋 Request body received:", JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // Validate required fields
    if (!body.name || !body.platforms || body.platforms.length === 0) {
      console.log("❌ Validation failed: missing name or platforms");
      return NextResponse.json(
        { error: 'Name and at least one platform are required' },
        { status: 400 }
      );
    }

    // Prepare campaign data
    const campaignToInsert = {
      user_id: user.id,
      name: body.name,
      description: body.description || null,
      platforms: body.platforms,
      keywords: body.keywords || [],
      target_job_titles: body.targetCriteria?.job_titles || [],
      target_industries: body.targetCriteria?.industries || [],
      target_company_sizes: body.targetCriteria?.company_sizes || [],
      target_locations: body.targetCriteria?.locations || [],
      frequency: body.frequency,
      schedule_config: body.schedule || null,
      status: 'active',
      total_leads_found: 0
    };

    console.log("💾 Inserting campaign:", JSON.stringify(campaignToInsert, null, 2));

    // Insert campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('scraping_campaigns')
      .insert(campaignToInsert)
      .select()
      .single();

    if (campaignError) {
      console.error('💥 Supabase error creating campaign:', campaignError);
      return NextResponse.json({
        error: 'Failed to create campaign',
        details: campaignError.message,
        code: campaignError.code
      }, { status: 500 });
    }

    console.log("✅ Campaign created successfully:", campaign.id);

    // Handle platform configurations
    if (body.platformConfigs && campaign) {
      console.log("🔧 Creating platform configurations...");
      
      const platformConfigs = Object.entries(body.platformConfigs).map(([platform, config]) => ({
        campaign_id: campaign.id,
        platform,
        config,
        is_active: true
      }));

      console.log("🔧 Platform configs to insert:", JSON.stringify(platformConfigs, null, 2));

      const { error: configError } = await supabase
        .from('platform_configurations')
        .insert(platformConfigs);

      if (configError) {
        console.error('❌ Error creating platform configs:', configError);
      } else {
        console.log("✅ Platform configurations created");
      }
    }
    
    // Create initial job for one-time campaigns
    if (body.frequency === 'once' && campaign) {
      console.log("🎯 Creating initial job for one-time campaign...");
      
      const { error: jobError } = await supabase
        .from('scraping_jobs')
        .insert({
          campaign_id: campaign.id,
          job_type: 'manual',
          status: 'pending',
          platforms_to_scrape: body.platforms
        });

      if (jobError) {
        console.error('❌ Error creating initial job:', jobError);
      } else {
        console.log("✅ Initial job created");
      }
    }

    const response = {
      success: true,
      campaign,
      message: 'Campaign created successfully'
    };

    console.log("🎉 Sending successful response:", JSON.stringify(response, null, 2));

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('💥 Unexpected error in POST route:', error);
    console.error('💥 Error stack:', error.stack);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}