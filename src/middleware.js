// src/middleware.js
import { NextResponse } from 'next/server';

// Define the same CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export function middleware(request) {
  // Only apply to the try-on API route
  if (request.nextUrl.pathname !== '/api/try-on') {
    return NextResponse.next();
  }
  
  // Handle OPTIONS preflight
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

// Configure the middleware to only run on the try-on API route
export const config = {
  matcher: '/api/try-on',
};