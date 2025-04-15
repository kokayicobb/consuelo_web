// src/app/api/klaviyo/account/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('Klaviyo account API route handler called');
  
  try {
    // Create a Supabase client with the cookies
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the session and user info
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session check:', { 
      hasSession: !!session, 
      error: sessionError?.message,
      userId: session?.user?.id?.substring(0, 8) + '...'
    });
    
    // If no session is found, check for development mode cookie
    if (!session || !session.user) {
      // Check for dev mode cookie
      const devModeCookie = cookies().get('klaviyo_dev_account');
      
      if (devModeCookie) {
        try {
          const devAccount = JSON.parse(devModeCookie.value);
          console.log('Using development mode Klaviyo account');
          return NextResponse.json({ account: devAccount });
        } catch (e) {
          console.error('Failed to parse dev mode cookie:', e);
        }
      }
      
      console.log('API: No authenticated user found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Query the database for the user's Klaviyo account
    const { data: accountData, error: dbError } = await supabase
      .from('klaviyo_integrations')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (dbError) {
      console.error('Database error fetching Klaviyo account:', dbError);
      throw dbError;
    }
    
    // If no account found
    if (!accountData) {
      console.log('No Klaviyo account found for user:', session.user.id);
      return NextResponse.json(
        { message: 'No Klaviyo account connected' },
        { status: 404 }
      );
    }
    
    // Format the account data for the response
    const account = {
      id: accountData.id,
      status: accountData.status,
      lastSync: accountData.last_sync,
      accountName: accountData.account_name || 'Klaviyo Account',
      createdAt: accountData.created_at,
    };
    
    console.log('Returning Klaviyo account for user:', session.user.id);
    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error in Klaviyo account API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Klaviyo account' },
      { status: 500 }
    );
  }
}