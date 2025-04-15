// src/lib/supabase-config.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Default cookie options to ensure consistency across different client creation methods
export const defaultCookieOptions = {
  name: 'sb-auth',
  lifetime: 60 * 60 * 24 * 7, // 7 days
  domain: '',
  path: '/',
  sameSite: 'lax' as const
};

/**
 * Create a Supabase client for use in middleware
 */
export function createAuthMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient(
    { req, res },
    {
      options: {
        global: {
          fetch: fetch.bind(globalThis)
        }
      },
      cookieOptions: defaultCookieOptions
    }
  );
}

/**
 * Create a singleton Supabase client for use in client components
 * This helps prevent the "Multiple GoTrueClient instances detected" warning
 */
export function createBrowserClient() {
  return createClientComponentClient({
    options: {
      global: {
        fetch: fetch.bind(globalThis)
      }
    },
    cookieOptions: defaultCookieOptions,
    // Setting isSingleton to true prevents multiple instances
    isSingleton: true
  });
}

// A helper to create auth header from session
export function createAuthHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`
  };
}