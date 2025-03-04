// src/middleware/cors.ts
import { NextRequest, NextResponse } from 'next/server';

export const corsHeaders = {

  'Access-Control-Allow-Origin': '*',


  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function middleware(req: NextRequest) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  const response = NextResponse.next();
  
  // Add CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}