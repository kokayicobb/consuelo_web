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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🚀 Running campaign:", id);
    
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    console.log("✅ Campaign found:", campaign.name);

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
      console.error('❌ Error creating job:', jobError);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    console.log("✅ Job created:", job.id);

    // Trigger the scraping process - with better error handling
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const processUrl = `${baseUrl}/api/scraping/process-job`;
    
    console.log("🔄 Triggering job processing at:", processUrl);

    // Use a more robust fetch with timeout and error handling
    const triggerJobProcessing = async () => {
      try {
        const response = await fetch(processUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId: job.id }),
          // Add timeout
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        console.log("🔄 Process-job response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Process-job failed:", errorText);
          
          // Update job status to failed
          await supabase
            .from('scraping_jobs')
            .update({
              status: 'failed',
              error_message: `Failed to trigger processing: ${response.status} ${errorText}`
            })
            .eq('id', job.id);
        } else {
          const result = await response.json();
          console.log("✅ Process-job triggered successfully:", result);
        }
      } catch (error) {
        console.error('❌ Failed to trigger job processing:', error);
        
        // Update job status to failed
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            error_message: `Failed to trigger processing: ${error.message}`
          })
          .eq('id', job.id);
      }
    };

    // Don't await this - let it run in the background
    triggerJobProcessing();

    return NextResponse.json({
      job,
      message: 'Campaign run started successfully'
    });
  } catch (error) {
    console.error('💥 Unexpected error in campaign run:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}