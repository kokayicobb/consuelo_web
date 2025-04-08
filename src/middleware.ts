// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Define which routes require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  // '/klaviyo',
  '/settings',
];
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth-redirect', // Add this line
];
// Define routes that are only accessible when not authenticated
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Define the CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export async function middleware(request: NextRequest) {
  // Create a response object
  const res = NextResponse.next();
  
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/api/klaviyo')) {
    // Allow Klaviyo API routes to pass through
    return NextResponse.next();
  }
  
  // Exempt auth-redirect from authentication checks
  if (path.startsWith('/auth-redirect')) {
    return NextResponse.next();
  }
  
  // Check if the request is for the try-on API
  if (request.nextUrl.pathname.startsWith('/api/try-on')) {
    // Handle OPTIONS preflight - IMPORTANT to prevent redirects
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    // For other methods, continue with the request but prepare headers
    const response = NextResponse.next();
    
    // Add CORS headers to all responses
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  // Create a Supabase client for the middleware
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  const isAuthenticated = !!session;
  
  // Check if the path is a protected route and the user is not authenticated
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    // Create the URL for the login page with a redirect parameter
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // Check if the path is an auth route and the user is authenticated
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard if accessing auth routes while authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // For API routes that require authentication
  if (path.startsWith('/api/') && 
      !path.startsWith('/api/public') && 
      !path.startsWith('/api/auth') && 
      !path.startsWith('/api/try-on') && 
      !isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return res;
}

// Combined matcher configuration
export const config = {
  matcher: [
    // For the authentication middleware - exclude auth-redirect
    '/((?!_next/static|_next/image|favicon.ico|public/|api/public/|auth-redirect/).*)',
    // For the CORS middleware
    '/api/try-on',
    '/api/try-on/:path*'
  ],
};