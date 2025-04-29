// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET handler for retrieving current auth state
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[API] Auth error:', error.message);
      return NextResponse.json(
        { error: 'Failed to get session', message: error.message },
        { status: 500 }
      );
    }
    
    // Check if session exists
    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null, session: null }, 
        { status: 200 }
      );
    }
    
    // Return authenticated response with user data
    return NextResponse.json(
      { 
        authenticated: true, 
        user: session.user,
        session: {
          expires_at: session.expires_at,
          access_token: session.access_token, // This is safe as it's server-to-server
          refresh_token: session.refresh_token
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Unexpected auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST handler for refreshing the auth session
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the request body
    const { action } = await request.json();
    
    if (action === 'refresh') {
      // Force refresh the session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to refresh session', message: error.message },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          refreshed: true,
          authenticated: !!data.session,
          user: data.user,
          session: data.session ? {
            expires_at: data.session.expires_at,
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          } : null
        }, 
        { status: 200 }
      );
    }
    
    // Handle signout action
    if (action === 'signout') {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to sign out', message: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { signedOut: true },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] Unexpected auth error during POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}