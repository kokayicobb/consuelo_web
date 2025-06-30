// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri') || process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI;
    const state = searchParams.get('state') || '/dashboard';
    const screenHint = searchParams.get('screen_hint'); // 'sign-up' for signup flow

    if (!redirectUri) {
      return NextResponse.json(
        { error: 'Missing redirect_uri parameter' },
        { status: 400 }
      );
    }

    try {
      // Dynamic import to avoid build-time module resolution
      const authModule = await import('@workos-inc/authkit-nextjs');
      const { getSignInUrl } = authModule;
      
      // Generate the AuthKit sign-in URL
      const authUrl = await getSignInUrl({
        redirectUri,
        ...(screenHint && { screenHint: screenHint as 'sign-up' | 'sign-in' }),
      });

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
      
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        state: state,
        ...(screenHint && { screen_hint: screenHint }),
      });
      
      const authUrl = `https://api.workos.com/user_management/authorize?${params.toString()}`;
      
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