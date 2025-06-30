// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSignInUrl } from '@workos-inc/authkit-nextjs';

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

    // Generate the AuthKit sign-in URL
    const authUrl = await getSignInUrl({
      redirectUri,
      ...(screenHint && { screenHint: screenHint as 'sign-up' | 'sign-in' }),
    });

    // Redirect the user to the AuthKit hosted login page
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error('Error generating sign-in URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate sign-in URL' },
      { status: 500 }
    );
  }
}