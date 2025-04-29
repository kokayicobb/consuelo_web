// src/app/api/klaviyo/revoke/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getKlaviyoAccountById, deactivateKlaviyoAccount } from '@/lib/db/klaviyo-accounts';
import {  getServerSideAuth } from '@/lib/auth'; // Your authentication method
import { generateBasicAuthHeader, KLAVIYO_ENDPOINTS } from '@/lib/klaviyo/oath-utils';

export async function POST(request: NextRequest) {
  try {
   // Ensure the user is authenticated
   const context = {
    req: request as any, // Cast to 'any' to bypass type mismatch
    res: null,
    query: {},
    resolvedUrl: '',
    cookies: request.cookies || {}, // Add cookies property
  };
  const session = await getServerSideAuth(context as any); // Cast context to 'any'
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
    
    // Get request body
    const body = await request.json();
    const { accountId } = body;
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    // Get the account from the database
    const account = await getKlaviyoAccountById(accountId);
    
    if (!account) {
      return NextResponse.json(
        { error: 'Klaviyo account not found' },
        { status: 404 }
      );
    }
    
    // Verify the user owns this account
    if (account.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to this account' },
        { status: 403 }
      );
    }
    
    // Get client credentials
    const clientId = process.env.KLAVIYO_CLIENT_ID;
    const clientSecret = process.env.KLAVIYO_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Klaviyo integration is not properly configured' },
        { status: 500 }
      );
    }
    
    // Revoke the refresh token
    await revokeToken(
      account.refreshToken,
      'refresh_token',
      clientId,
      clientSecret
    );
    
    // Revoke the access token (optional, as it will expire anyway)
    await revokeToken(
      account.accessToken,
      'access_token',
      clientId,
      clientSecret
    );
    
    // Deactivate the account in the database
    const deactivated = await deactivateKlaviyoAccount(accountId);
    
    if (!deactivated) {
      return NextResponse.json(
        { error: 'Failed to deactivate account' },
        { status: 500 }
      );
    }
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Klaviyo account disconnected successfully',
    });
  } catch (error) {
    console.error('Token revocation error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke tokens' },
      { status: 500 }
    );
  }
}

// Helper function to revoke a token
async function revokeToken(
  token: string,
  tokenTypeHint: 'access_token' | 'refresh_token',
  clientId: string,
  clientSecret: string
): Promise<void> {
  const authHeader = generateBasicAuthHeader(clientId, clientSecret);
  
  const response = await fetch(KLAVIYO_ENDPOINTS.REVOKE, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      token_type_hint: tokenTypeHint,
      token: token,
    }),
  });
  
  // Even if revocation fails, we won't throw an error
  // as the token will eventually expire, and we're deactivating
  // the account in our database anyway
  if (!response.ok) {
    console.warn(`Token revocation returned status ${response.status}`, await response.text());
  }
}