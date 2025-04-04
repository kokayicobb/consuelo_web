import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define the CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export async function middleware(req: NextRequest) {
  // Handle try-on API CORS
  if (req.nextUrl.pathname.startsWith('/api/try-on')) {
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    // For other methods, continue with the request but prepare headers
    const response = NextResponse.next();
    
    // Add CORS headers to the response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  // For all other routes, handle Supabase auth
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh session if expired
  await supabase.auth.getSession();
  
  return res;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // CORS middleware for try-on API
    '/api/try-on', 
    '/api/try-on/:path*',
    
    // Auth middleware for all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|api/public).*)',
  ],
};