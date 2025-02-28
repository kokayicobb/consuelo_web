// src/middleware/cors.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS middleware for Next.js API routes
 */
export function withCors(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    // Create a new response with CORS headers
    return new NextResponse(null, {
      status: 204, // No content for OPTIONS responses
      headers: {
        'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }

  // For actual requests, forward to the handler but ensure response has CORS headers
  return handler(req).then(response => {
    // Clone the response to add headers
    const newResponse = NextResponse.json(
      response.body,
      {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      }
    );

    // Add CORS headers to the response
    newResponse.headers.set('Access-Control-Allow-Origin', 'https://try-on-testing.myshopify.com');
    
    return newResponse;
  });
}