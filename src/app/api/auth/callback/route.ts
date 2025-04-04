// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
      
      // Log for debugging
      console.log('Successfully exchanged code for session');
    } catch (error) {
      console.error('Error exchanging code for session:', error);
    }
  }

  // Redirect to the dashboard or home page
  return NextResponse.redirect(new URL('/dashboard', request.url));
}