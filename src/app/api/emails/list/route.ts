
// app/api/emails/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    const supabase = createClerkSupabaseClient(token);
    
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const campaignId = searchParams.get('campaignId');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('emails')
      .select(`
        *,
        client:clients(Client, email, company),
        campaign:campaigns(name, status)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    if (search) {
      query = query.or(`subject.ilike.%${search}%,to_addresses.cs.{${search}},from_address.ilike.%${search}%`);
    }

    const { data: emails, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      emails,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (error) {
    console.error('List emails error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
