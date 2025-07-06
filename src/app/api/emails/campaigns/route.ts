
// app/api/emails/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { userId, getToken } = await  auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    const supabase = createClerkSupabaseClient(token);

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        emails(status, opens, clicks)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate stats for each campaign
    const campaignsWithStats = campaigns.map(campaign => {
      const emails = campaign.emails || [];
      const stats = {
        sent: emails.length,
        delivered: emails.filter((e: any) => ['delivered', 'opened', 'clicked', 'replied'].includes(e.status)).length,
        opened: emails.filter((e: any) => ['opened', 'clicked', 'replied'].includes(e.status)).length,
        clicked: emails.filter((e: any) => ['clicked', 'replied'].includes(e.status)).length,
        bounced: emails.filter((e: any) => e.status === 'bounced').length,
        totalOpens: emails.reduce((sum: number, e: any) => sum + (e.opens || 0), 0),
        totalClicks: emails.reduce((sum: number, e: any) => sum + (e.clicks || 0), 0),
      };

      const deliveryRate = stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0;
      const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
      const clickRate = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;

      return {
        ...campaign,
        stats: {
          ...stats,
          deliveryRate: deliveryRate.toFixed(1),
          openRate: openRate.toFixed(1),
          clickRate: clickRate.toFixed(1),
        },
        emails: undefined, // Remove emails array from response
      };
    });

    return NextResponse.json({ campaigns: campaignsWithStats });
  } catch (error) {
    console.error('Campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    const supabase = createClerkSupabaseClient(token);
    
    const body = await req.json();
    const { name, description, recipients, schedule_for } = body;

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        name,
        description,
        status: schedule_for ? 'scheduled' : 'draft',
        scheduled_for: schedule_for,
        total_recipients: recipients.length,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}