
// app/api/emails/stats/route.ts
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
    
    const searchParams = req.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('emails')
      .select('status, sent_at, opens, clicks')
      .eq('user_id', userId);

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    if (startDate) {
      query = query.gte('sent_at', startDate);
    }

    if (endDate) {
      query = query.lte('sent_at', endDate);
    }

    const { data: emails, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate stats
    const stats = {
      total: emails.length,
      sent: emails.filter(e => e.status === 'sent').length,
      delivered: emails.filter(e => ['delivered', 'opened', 'clicked', 'replied'].includes(e.status)).length,
      opened: emails.filter(e => ['opened', 'clicked', 'replied'].includes(e.status)).length,
      clicked: emails.filter(e => ['clicked', 'replied'].includes(e.status)).length,
      bounced: emails.filter(e => e.status === 'bounced').length,
      complained: emails.filter(e => e.status === 'complained').length,
      totalOpens: emails.reduce((sum, e) => sum + (e.opens || 0), 0),
      totalClicks: emails.reduce((sum, e) => sum + (e.clicks || 0), 0),
    };

    const deliveryRate = stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0;
    const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
    const clickRate = stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0;

    return NextResponse.json({
      stats: {
        ...stats,
        deliveryRate: deliveryRate.toFixed(1),
        openRate: openRate.toFixed(1),
        clickRate: clickRate.toFixed(1),
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
