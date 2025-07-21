// src/app/api/scraping/campaigns/[id]/run/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get campaign and verify ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('scraping_campaigns')
      .select('*, platform_configurations(*)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Create scraping job
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .insert({
        campaign_id: campaign.id,
        job_type: 'manual',
        status: 'pending',
        platforms_to_scrape: campaign.platforms
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    // Trigger the scraping process asynchronously
    // In production, this would be handled by a job queue (e.g., BullMQ, Inngest, etc.)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scraping/process-job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({ jobId: job.id })
    }).catch(error => {
      console.error('Failed to trigger job processing:', error);
    });

    return NextResponse.json({
      job,
      message: 'Campaign run started successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}