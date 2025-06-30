// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Dynamically import handleAuth to avoid build-time resolution issues
    const { handleAuth } = await import('@workos-inc/authkit-nextjs');
    const handler = handleAuth({
      returnPathname: '/app'
    });
    
    return handler(request);
  } catch (error) {
    console.error('Failed to load auth handler:', error);
    
    // Fallback to manual implementation if dynamic import fails
    return handleAuthFallback(request);
  }
}

// Fallback implementation
async function handleAuthFallback(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Manual token exchange
    const tokenResponse = await fetch('https://api.workos.com/sso/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.WORKOS_CLIENT_ID!,
        client_secret: process.env.WORKOS_CLIENT_SECRET!,
        redirect_uri: `${request.nextUrl.origin}/api/auth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenResponse.json();
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/app', request.url));
    
    // Set session cookie
    response.cookies.set('workos-session', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}