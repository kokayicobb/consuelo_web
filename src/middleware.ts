// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAuthMiddlewareClient } from './lib/supabase-config';

// Define which routes require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/app',
];

// Public routes that should bypass auth checks
const publicRoutes = [
  '/auth-redirect',
  '/',
  '/about',
  '/contact',
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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and non-essential paths
  const path = request.nextUrl.pathname;
  
  // Skip for static assets, images, etc.
  if (
    path.startsWith('/_next') || 
    path.includes('.') ||  // Files with extensions
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  console.log(`[Middleware] Processing path: ${path}`);
  
  // Create a response to modify
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies
  const supabase = createAuthMiddlewareClient(request, res);
  
  // Check if this is an auth callback
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
    // Redirect to dashboard or saved redirect after successful auth
    const redirectTo = requestUrl.searchParams.get("redirectTo") || "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
  
  // CRITICAL: Always refresh session before checking auth state
  await supabase.auth.getSession();
  
  // Allow API paths that should bypass auth redirects
  if (
    path.startsWith('/api/auth') || 
    path.startsWith('/api/public')
  ) {
    console.log(`[Middleware] Bypassing auth for API path: ${path}`);
    return NextResponse.next();
  }
  
  // For Klaviyo API routes, process auth but don't block
  if (path.startsWith('/api/klaviyo')) {
    console.log(`[Middleware] Processing auth for Klaviyo API path: ${path}`);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isAuthenticated = !!session;
      
      console.log(`[Middleware] Klaviyo API auth check: Authenticated=${isAuthenticated}, User=${session?.user?.email || 'none'}`);
      
      // Add auth headers but don't block the request
      if (isAuthenticated && session?.user) {
        res.headers.set('x-user-id', session.user.id);
        res.headers.set('x-user-email', session.user.email || '');
      }
      
      return res;
    } catch (error) {
      console.error('[Middleware] Klaviyo auth error:', error);
      return res;
    }
  }
  
  // Special handling for try-on API
  if (path.startsWith('/api/try-on')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.headers.set(key, value);
    });
    
    return res;
  }
  
  // Check if the path is public and should bypass auth checks
  if (publicRoutes.some(route => path === route || path.startsWith(route + '/'))) {
    console.log(`[Middleware] Public route, bypassing auth: ${path}`);
    return NextResponse.next();
  }
  
  try {
    // Get the session
    const { data: { session } } = await supabase.auth.getSession();
    
    const isAuthenticated = !!session;
    
    console.log(`[Middleware] Auth check for ${path}: Authenticated=${isAuthenticated}, User=${session?.user?.email || 'none'}`);
    
    // Check if the path is a protected route and the user is not authenticated
    const isProtectedRoute = protectedRoutes.some(route => path === route || path.startsWith(route + '/'));
    if (isProtectedRoute && !isAuthenticated) {
      console.log(`[Middleware] Protected route without auth, redirecting to login: ${path}`);
      
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('to', path);
      
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check if the path is an auth route and the user is authenticated
    const isAuthRoute = authRoutes.some(route => path === route || path.startsWith(route + '/'));
    if (isAuthRoute && isAuthenticated) {
      const redirectTo = request.nextUrl.searchParams.get('to') || '/dashboard';
      console.log(`[Middleware] Auth route with active session, redirecting to: ${redirectTo}`);
      
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    
    // Enhance the response with user info if authenticated
    if (isAuthenticated) {
      res.headers.set('x-user-id', session.user.id);
      res.headers.set('x-user-email', session.user.email || '');
    }
    
    return res;
  } catch (error) {
    console.error('[Middleware] Auth error:', error);
    // On error, still allow the request to proceed
    return NextResponse.next();
  }
}

// Updated matcher configuration
export const config = {
  matcher: [
    // Match everything except static files and specific API paths
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*|api/public).*)',
    // Include API paths that need auth or CORS
    '/api/:path*',
  ],
};