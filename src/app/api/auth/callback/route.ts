// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Use dynamic import to avoid build-time module resolution
    const authModule = await import('@workos-inc/authkit-nextjs').catch(() => null);
    
    if (authModule && authModule.handleAuth) {
      const handler = authModule.handleAuth({
        returnPathname: '/app'
      });
      return handler(request);
    }
    
    // If dynamic import fails, use fallback
    return handleAuthManually(request);
  } catch (error) {
    console.error('Auth callback error:', error);
    return handleAuthManually(request);
  }
}

async function handleAuthManually(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const clientId = process.env.WORKOS_CLIENT_ID;
    const clientSecret = process.env.WORKOS_CLIENT_SECRET;
    const redirectUri = process.env.WORKOS_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/callback`;

    // Exchange authorization code for token
    const tokenResponse = await fetch('https://api.workos.com/sso/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://api.workos.com/sso/profile', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to get user profile');
      return NextResponse.redirect(new URL('/login?error=profile_failed', request.url));
    }

    const userData = await userResponse.json();
    
    // Create session cookie
    const sessionData = {
      accessToken: tokenData.access_token,
      user: userData,
      expiresAt: Date.now() + (tokenData.expires_in * 1000),
    };
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/app', request.url));
    
    // Set session cookie
    response.cookies.set('workos-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 60 * 60 * 24 * 7, // Use token expiry or 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Manual auth error:', error);
    return NextResponse.redirect(new URL('/login?error=unexpected', request.url));
  }
}