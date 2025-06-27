// app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Lead {
  place_id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types?: string[];
  location?: {
    lat: number;
    lng: number;
  };
  opening_hours?: any;
  price_level?: number;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  industry?: string;
  company_size?: string;
  revenue?: string;
  decision_makers?: any[];
  notes?: string;
  status?: string;
  assigned_to?: string;
  tags?: string[];
}

// Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body: Lead = await request.json();
    
    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('place_id', body.place_id)
      .single();

    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead already exists', leadId: existingLead.id },
        { status: 409 }
      );
    }

    // Insert the lead
    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...body,
        status: body.status || 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving lead:', error);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    // Create initial activity
    await supabase.from('lead_activities').insert({
      lead_id: data.id,
      activity_type: 'created',
      description: 'Lead created from Places search',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ lead: data });
  } catch (error) {
    console.error('Error in save lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all leads with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assigned_to');
    const tags = searchParams.get('tags')?.split(',');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leads: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in get leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a lead
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    // Log the update activity
    await supabase.from('lead_activities').insert({
      lead_id: id,
      activity_type: 'updated',
      description: `Lead information updated`,
      metadata: updates,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ lead: data });
  } catch (error) {
    console.error('Error in update lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete leads
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get('ids')?.split(',');

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: 'Lead IDs are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting leads:', error);
      return NextResponse.json(
        { error: 'Failed to delete leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error('Error in delete leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}