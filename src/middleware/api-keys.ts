// src/middleware/api-keys.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey, getKeyIdFromKey } from '@/utils/keys';
import { logApiUsage } from '@/utils/usage';

/**
 * Middleware to verify API key for protected routes
 */
export async function withApiKey(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const startTime = Date.now();
  
  // Check for API key in headers or query params
  const apiKey = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('api_key');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 401 }
    );
  }
  
  // Verify the key
  const isValid = await verifyApiKey(apiKey);
  
  if (!isValid) {
    // Log failed attempt
    const keyId = await getKeyIdFromKey(apiKey);
    if (keyId) {
      await logApiUsage({
        keyId,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode: 401,
        responseTimeMs: Date.now() - startTime,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }
  
  // Key is valid, proceed with the request
  try {
    const response = await handler(req);
    
    // Log successful request
    const keyId = await getKeyIdFromKey(apiKey);
    if (keyId) {
      await logApiUsage({
        keyId,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode: response.status,
        responseTimeMs: Date.now() - startTime,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      });
    }
    
    return response;
  } catch (error) {
    // Log error
    const keyId = await getKeyIdFromKey(apiKey);
    if (keyId) {
      await logApiUsage({
        keyId,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        statusCode: 500,
        responseTimeMs: Date.now() - startTime,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      });
    }
    
    throw error;
  }
}

/**
 * Example of how to use this middleware:
 * 
 * // In your API route file:
 * import { withApiKey } from '@/middleware/apiKey';
 * 
 * export async function GET(req: NextRequest) {
 *   return withApiKey(req, async (req) => {
 *     // Your API logic here
 *     return NextResponse.json({ data: 'Your protected data' });
 *   });
 * }
 */