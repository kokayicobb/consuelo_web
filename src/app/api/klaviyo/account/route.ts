// src/app/api/klaviyo/account/route.ts
import { getKlaviyoAccountByUserId } from "@/lib/db/klaviyo-accounts";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get cookie store and create Supabase client
    const cookieStore = cookies();
    
    // Check for development mode cookies first
    const devConnectedCookie = cookieStore.get('klaviyo_dev_connected');
    const devAccessToken = cookieStore.get('klaviyo_dev_access_token');
    const devRefreshToken = cookieStore.get('klaviyo_dev_refresh_token');
    const devExpiresAt = cookieStore.get('klaviyo_dev_expires_at');
    
    const isDevelopmentMode = devConnectedCookie && devAccessToken && devRefreshToken && devExpiresAt;
    
    if (isDevelopmentMode) {
      console.log("Using development mode Klaviyo account from cookies");
      // Return the account from development cookies
      return NextResponse.json({
        account: {
          id: 'dev-account',
          userId: 'dev-user',
          storeId: null,
          clientId: process.env.KLAVIYO_CLIENT_ID,
          tokenExpiresAt: devExpiresAt.value,
          scopes: 'accounts:read campaigns:read campaigns:write events:read events:write flows:read lists:read lists:write metrics:read profiles:read profiles:write',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
    
    // Continue with normal flow for authenticated users
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Get session directly from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.error("API: No authenticated user found");
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the store ID from query parameters (optional)
    const storeId = request.nextUrl.searchParams.get('store_id') || undefined;
    
    // Get the Klaviyo account for this user
    const account = await getKlaviyoAccountByUserId(session.user.id, storeId);
    
    if (!account) {
      // This is EXPECTED for new users who haven't connected to Klaviyo yet
      console.log("API: No Klaviyo account found for user", session.user.id);
      return NextResponse.json(
        { account: null },
        { status: 404 }
      );
    }
    
    // Return the account
    return NextResponse.json({
      account: {
        id: account.id,
        userId: account.userId,
        storeId: account.storeId,
        clientId: account.clientId,
        tokenExpiresAt: account.tokenExpiresAt.toISOString(),
        scopes: account.scopes,
        isActive: account.isActive,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching Klaviyo account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Klaviyo account' },
      { status: 500 }
    );
  }
}