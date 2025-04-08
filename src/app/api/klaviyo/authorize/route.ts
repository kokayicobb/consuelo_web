// src/app/api/klaviyo/authorize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import * as crypto from 'crypto';

// Function to generate PKCE challenge and verifier
function generatePKCE() {
  const verifierBytes = crypto.randomBytes(32);
  const codeVerifier = verifierBytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, 128);

  const challengeBytes = crypto.createHash('sha256')
    .update(codeVerifier)
    .digest();
  const codeChallenge = challengeBytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return { codeVerifier, codeChallenge };
}

export async function GET(request: NextRequest) {
  try {
    console.log("Klaviyo authorize endpoint called");
    
    // Get cookie store and create Supabase client
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Get session directly from Supabase with detailed logging
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log("Auth session check:", {
      hasSession: !!session,
      sessionError: sessionError?.message,
      userId: session?.user?.id ? session.user.id.substring(0, 8) + '...' : 'undefined...' 
    });

    // Additional debugging for cookie presence
    console.log("Auth cookie check:", {
      hasAuthCookie: !!cookieStore.get('supabase-auth-token'),
    });

    // Generate a unique state value
    const stateValue = crypto.randomBytes(16).toString('hex');
    
    // Generate PKCE challenge and verifier
    const { codeVerifier, codeChallenge } = generatePKCE();

    // Get Klaviyo OAuth configuration
    const clientId = process.env.KLAVIYO_CLIENT_ID;

    if (!clientId) {
      console.error("Klaviyo client ID not found in environment variables");
      return NextResponse.json({ error: 'Klaviyo integration not configured' }, { status: 500 });
    }

    // Your application's callback URL
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/klaviyo/callback`;

    // Define OAuth scopes needed for your integration
    const scopes = [
      'accounts:read',
      'campaigns:read',
      'campaigns:write',
      'events:read', 
      'events:write',
      'flows:read',
      'lists:read',
      'lists:write',
      'metrics:read',
      'profiles:read',
      'profiles:write'
    ].join(' ');

    // Store the PKCE data
    if (session?.user?.id) {
      // In production mode with authenticated user, store in database
      const { error: insertError } = await supabase
        .from('klaviyo_oauth_states')
        .insert({
          user_id: session.user.id,
          state: stateValue,
          code_verifier: codeVerifier,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Failed to store OAuth state:", insertError);
        return NextResponse.json(
          { error: 'Failed to prepare OAuth flow' }, 
          { status: 500 }
        );
      }
      
      console.log("Stored PKCE data in database for user:", session.user.id.substring(0, 8) + '...');
    } else {
      // No authenticated user, store in cookies
      cookieStore.set('klaviyo_dev_state', stateValue, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        sameSite: 'lax'
      });
      
      cookieStore.set('klaviyo_dev_verifier', codeVerifier, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10, // 10 minutes
        sameSite: 'lax'
      });
      
      console.log("DEVELOPMENT MODE: Storing verifier in cookies", { 
        state: stateValue, 
        codeVerifier: codeVerifier.substring(0, 10) + '...' 
      });
    }

    // Construct the Klaviyo authorization URL
    const authUrl = `https://www.klaviyo.com/oauth/authorize?` +
      `response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${encodeURIComponent(stateValue)}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}`;

    console.log("Generated Klaviyo auth URL with state:", stateValue.substring(0, 10) + '...');

    // Return the URL for redirection
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Klaviyo auth URL:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}