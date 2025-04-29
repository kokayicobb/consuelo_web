
// src/app/api/klaviyo/integrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const GET = async (request: NextRequest) => {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    // Fetch all integrations for the user from the view we created
    const { data: integrations, error: integrationError } = await supabase
      .from('integration_status_view')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (integrationError) {
      throw integrationError;
    }
    
    return NextResponse.json(
      { integrations }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to fetch integrations' }, 
      { status: 500 }
    );
  }
};