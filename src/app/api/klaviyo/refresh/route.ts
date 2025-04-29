// import { auth } from '@/lib/auth/auth-context.tsx';
// // src/app/api/klaviyo/refresh/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { getKlaviyoAccountById, updateKlaviyoAccountTokens } from '@/lib/db/klaviyo-accounts';

// import { TokenResponse, generateBasicAuthHeader, KLAVIYO_ENDPOINTS } from '@/lib/klaviyo/oath-utils';


// export async function POST(request: NextRequest) {
//   try {
//     // Ensure the user is authenticated
//     const session = await auth();
//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Authentication required' },
//         { status: 401 }
//       );
//     }
    
//     // Get request body
//     const body = await request.json();
//     const { accountId } = body;
    
//     if (!accountId) {
//       return NextResponse.json(
//         { error: 'Account ID is required' },
//         { status: 400 }
//       );
//     }
    
//     // Get the account from the database
//     const account = await getKlaviyoAccountById(accountId);
    
//     if (!account) {
//       return NextResponse.json(
//         { error: 'Klaviyo account not found' },
//         { status: 404 }
//       );
//     }
    
//     // Verify the user owns this account
//     if (account.userId !== session.user.id) {
//       return NextResponse.json(
//         { error: 'Unauthorized access to this account' },
//         { status: 403 }
//       );
//     }
    
//     // Get client credentials
//     const clientId = process.env.KLAVIYO_CLIENT_ID;
//     const clientSecret = process.env.KLAVIYO_CLIENT_SECRET;
    
//     if (!clientId || !clientSecret) {
//       return NextResponse.json(
//         { error: 'Klaviyo integration is not properly configured' },
//         { status: 500 }
//       );
//     }
    
//     // Request a new access token using the refresh token
//     const tokenResponse = await refreshAccessToken(
//       account.refreshToken,
//       clientId,
//       clientSecret
//     );
    
//     // Update the account in the database with new tokens
//     const updatedAccount = await updateKlaviyoAccountTokens(
//       accountId,
//       tokenResponse
//     );
    
//     if (!updatedAccount) {
//       return NextResponse.json(
//         { error: 'Failed to update account tokens' },
//         { status: 500 }
//       );
//     }
    
//     // Return success with updated token information
//     return NextResponse.json({
//       success: true,
//       expires_at: updatedAccount.tokenExpiresAt.toISOString(),
//       scopes: updatedAccount.scopes,
//     });
//   } catch (error: any) {
//     // Check if it's an invalid grant error (refresh token invalid/expired)
//     if (error.message?.includes('invalid_grant')) {
//       return NextResponse.json(
//         { 
//           error: 'invalid_refresh_token',
//           message: 'The refresh token is invalid or expired. Please reconnect your Klaviyo account.'
//         },
//         { status: 401 }
//       );
//     }
    
//     console.error('Token refresh error:', error);
//     return NextResponse.json(
//       { error: 'Failed to refresh access token' },
//       { status: 500 }
//     );
//   }
// }

// // Helper function to refresh an access token
// async function refreshAccessToken(
//   refreshToken: string,
//   clientId: string,
//   clientSecret: string
// ): Promise<TokenResponse> {
//   const authHeader = generateBasicAuthHeader(clientId, clientSecret);
  
//   const response = await fetch(KLAVIYO_ENDPOINTS.TOKEN, {
//     method: 'POST',
//     headers: {
//       'Authorization': authHeader,
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body: new URLSearchParams({
//       grant_type: 'refresh_token',
//       refresh_token: refreshToken,
//     }),
//   });
  
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(`Token refresh failed: ${JSON.stringify(errorData)}`);
//   }
  
//   return await response.json();
// }