import { NextResponse } from 'next/server';

// Define the same CORS headers
const corsHeaders = {

  'Access-Control-Allow-Origin': '*',

  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export function middleware(request) {
  // Check if the request is for the try-on API
  if (!request.nextUrl.pathname.startsWith('/api/try-on')) {
    return NextResponse.next();
  }
  
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

// Configure the middleware to match any path starting with /api/try-on
export const config = {
  matcher: ['/api/try-on', '/api/try-on/:path*'],
};