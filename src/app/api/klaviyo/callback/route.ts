// src/app/api/klaviyo/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const error = request.nextUrl.searchParams.get('error');
    const errorDescription = request.nextUrl.searchParams.get('error_description');

    // Error handling
    if (error) {
      console.error(`Klaviyo OAuth error: ${error} - ${errorDescription}`);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/klaviyo/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`);
    }

    if (!code || !state) {
      console.error('Invalid callback: missing code or state');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/klaviyo/error?error=invalid_callback&description=Missing+required+parameters`);
    }

    // Get cookie store and create Supabase client
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Get the current authentication state
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Additional debugging for cookie presence
    console.log("Auth cookie check:", {
      hasAuthCookie: !!cookieStore.get('supabase-auth-token'),
      cookieName: cookieStore.get('supabase-auth-token')?.name,
    });
    
    console.log('Auth check:', {
      hasSession: !!session,
      userId: session?.user?.id ? session.user.id.substring(0, 8) + '...' : null,
      sessionError: sessionError?.message
    });

    // Check if we're in development mode by looking for dev cookies
    const devStateCookie = cookieStore.get('klaviyo_dev_state');
    const devVerifierCookie = cookieStore.get('klaviyo_dev_verifier');
    const isDevelopmentMode = !session && devStateCookie && devVerifierCookie;

    let codeVerifier: string;
    let userId: string | null = null;

    if (isDevelopmentMode) {
      // Development mode - use cookie data
      console.log("Using development mode state handling");
      
      if (devStateCookie.value !== state) {
        console.error('Development mode: State mismatch', {
          cookieState: devStateCookie.value,
          returnedState: state
        });
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/klaviyo/error?error=state_mismatch&description=Invalid+state+parameter`);
      }
      
      codeVerifier = devVerifierCookie.value;
      
      // Clear the cookies
      cookieStore.set('klaviyo_dev_state', '', { maxAge: 0, path: '/' });
      cookieStore.set('klaviyo_dev_verifier', '', { maxAge: 0, path: '/' });
    } else {
      // Authenticated mode - check database
      let stateData;
      
      if (session?.user?.id) {
        // First try to find the state data for the authenticated user
        const { data, error } = await supabase
          .from('klaviyo_oauth_states')
          .select('code_verifier, user_id')
          .eq('state', state)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!error) {
          stateData = data;
        } else {
          console.log("Could not find state for authenticated user, trying without user filter");
        }
      }
      
      // If we couldn't find state data for the authenticated user, try to find any state data
      if (!stateData) {
        const { data, error } = await supabase
          .from('klaviyo_oauth_states')
          .select('code_verifier, user_id')
          .eq('state', state)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error || !data) {
          console.error('Invalid state parameter or state not found', error);
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/klaviyo/error?error=invalid_state&description=Invalid+or+expired+authorization+request`);
        }
        
        stateData = data;
      }

      codeVerifier = stateData.code_verifier;
      userId = stateData.user_id;
      
      console.log("Found state data in database:", {
        stateUserId: userId?.substring(0, 8) + '...',
        authUserId: session?.user?.id ? session.user.id.substring(0, 8) + '...' : null,
        match: userId === session?.user?.id
      });
    }

    // Use authenticated user's ID if available and matching
    if (session?.user?.id) {
      if (userId && userId !== session.user.id) {
        console.warn("User ID mismatch between state data and session");
      }
      userId = session.user.id;
      console.log("Using authenticated user ID:", userId.substring(0, 8) + '...');
    }

    // Get Klaviyo OAuth configuration
    const clientId = process.env.KLAVIYO_CLIENT_ID;
    const clientSecret = process.env.KLAVIYO_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/klaviyo/callback`;

    if (!clientId || !clientSecret) {
      console.error("Klaviyo client credentials not found in environment variables");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/klaviyo/error?error=configuration_error&description=Klaviyo+integration+not+properly+configured`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://a.klaviyo.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/klaviyo/error?error=token_exchange_failed&description=Failed+to+exchange+authorization+code+for+access+token`);
    }

    const tokenData = await tokenResponse.json();
    console.log("Received token data:", { ...tokenData, access_token: '***REDACTED***', refresh_token: '***REDACTED***' });

    // If we have a user ID, store the tokens in the database
    if (userId) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + tokenData.expires_in * 1000);

      try {
        console.log(`Storing Klaviyo account for user ${userId.substring(0, 8)}...`);
        
        // When using service role, need to bypass RLS
        const { data: accountData, error: accountError } = await supabase
          .from('klaviyo_accounts')
          .upsert({
            user_id: userId,
            client_id: clientId,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            token_expires_at: expiresAt.toISOString(),
            scopes: tokenData.scope,
            is_active: true,
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          })
          .select();

        if (accountError) {
          console.error('Failed to store Klaviyo account data:', accountError);
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/klaviyo/error?error=database_error&description=Failed+to+store+connection+details`);
        }
        
        console.log("Successfully stored Klaviyo account data for user:", userId.substring(0, 8) + '...');
        
        // Clean up the used state entry
        await supabase
          .from('klaviyo_oauth_states')
          .delete()
          .eq('state', state);
      } catch (dbError) {
        console.error('Database error while storing Klaviyo account:', dbError);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/klaviyo/error?error=database_error&description=Database+error+while+storing+connection+details`);
      }
    } else {
      // For development mode without authenticated user, store token info in a cookie temporarily
      console.log("No authenticated user, storing Klaviyo connection info in development cookie");
      
      cookieStore.set('klaviyo_dev_connected', 'true', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: 'lax'
      });
    }

    // Redirect to success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/klaviyo/success`);
  } catch (error) {
    console.error('Error handling Klaviyo callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/klaviyo/error?error=server_error&description=An+unexpected+error+occurred`);
  }
}