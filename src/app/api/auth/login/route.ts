// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || '/dashboard';
    const screenHint = searchParams.get('screen_hint'); // 'sign-up' for signup flow
    
    // Construct the redirect URI based on the current request
    // This ensures it matches the actual domain being used
    const origin = request.nextUrl.origin;
    const redirectUri = searchParams.get('redirect_uri') || 
                       process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI ||
                       `${origin}/api/auth/callback`;
    
    console.log('Login route - Origin:', origin);
    console.log('Login route - Redirect URI:', redirectUri);

    try {
      // Dynamic import to avoid build-time module resolution
      const authModule = await import('@workos-inc/authkit-nextjs');
      const { getSignInUrl } = authModule;
      
      // Generate the AuthKit sign-in URL
      const authUrl = await getSignInUrl({
        redirectUri,
        ...(screenHint && { screenHint: screenHint as 'sign-up' | 'sign-in' }),
      });

      console.log('AuthKit generated URL:', authUrl);

      // Redirect the user to the AuthKit hosted login page
      return NextResponse.redirect(authUrl);
      
    } catch (importError) {
      console.error('Failed to import authkit, using fallback:', importError);
      
      // Fallback: manually construct WorkOS auth URL
      const clientId = process.env.WORKOS_CLIENT_ID;
      
      if (!clientId) {
        return NextResponse.json(
          { error: 'WorkOS client ID not configured' },
          { status: 500 }
        );
      }
      
      // Log the redirect URI being used
      console.log('Fallback - Using redirect URI:', redirectUri);
      console.log('Fallback - Client ID:', clientId);
      
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        state: state,
        ...(screenHint && { screen_hint: screenHint }),
      });
      
      const authUrl = `https://api.workos.com/user_management/authorize?${params.toString()}`;
      console.log('Fallback - Full auth URL:', authUrl);
      
      return NextResponse.redirect(authUrl);
    }

  } catch (error) {
    console.error('Error generating sign-in URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate sign-in URL' },
      { status: 500 }
    );
  }
}