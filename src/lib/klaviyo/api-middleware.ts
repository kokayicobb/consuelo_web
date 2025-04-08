// src/lib/klaviyo/api-middleware.ts
import { updateKlaviyoAccountTokens } from '../db/klaviyo-accounts';

// Mutex to prevent multiple token refresh requests
const refreshMutex = new Map<string, Promise<string>>();

// API middleware for Klaviyo requests that handles token refreshing
export default async function withKlaviyoAuth(
  account: KlaviyoAccount,
  apiCall: (accessToken: string) => Promise<any>
): Promise<any> {
  try {
    // Check if the token is expired or will expire soon
    if (isTokenExpiredOrExpiringSoon(account.tokenExpiresAt)) {
      // If a refresh is already in progress for this account, wait for it
      if (refreshMutex.has(account.id)) {
        await refreshMutex.get(account.id);
        // After refresh completes, recursively call this function with the updated account
        const updatedAccount = await getKlaviyoAccountById(account.id);
        if (!updatedAccount) {
          throw new Error('Account not found after token refresh');
        }
        return withKlaviyoAuth(updatedAccount, apiCall);
      }
      
      // Set up a new refresh promise
      const refreshPromise = refreshAccessToken(account);
      refreshMutex.set(account.id, refreshPromise);
      
      try {
        // Await the refresh and get the new access token
        const newAccessToken = await refreshPromise;
        // Remove the mutex entry after completion
        refreshMutex.delete(account.id);
        // Make the API call with the new token
        return await apiCall(newAccessToken);
      } catch (error) {
        // Remove the mutex entry if refresh fails
        refreshMutex.delete(account.id);
        throw error;
      }
    }
    
    // If the token is still valid, use it directly
    return await apiCall(account.accessToken);
  } catch (error: any) {
    // Handle different error types
    if (error.message?.includes('invalid_grant')) {
      // The refresh token is invalid - the user needs to reconnect
      throw new Error('Klaviyo authorization expired. Please reconnect your account.');
    }
    
    throw error;
  }
}

// Function to refresh the access token
async function refreshAccessToken(account: KlaviyoAccount): Promise<string> {
  try {
    // Get client credentials
    const clientId = process.env.KLAVIYO_CLIENT_ID;
    const clientSecret = process.env.KLAVIYO_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Klaviyo integration is not properly configured');
    }
    
    // Make a request to refresh the token
    const response = await fetch('/api/klaviyo/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: account.id,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token refresh failed: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

// Import here to avoid circular dependency
import { getKlaviyoAccountById } from '../db/klaviyo-accounts';
import { KlaviyoAccount, isTokenExpiredOrExpiringSoon } from './oath-utils';
