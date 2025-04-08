// src/hooks/use-klaviyo.ts
'use client';

import { KlaviyoAccount } from '@/lib/klaviyo/oath-utils';
import { useState, useEffect, useCallback } from 'react';

interface UseKlaviyoOptions {
  storeId?: string;
  autoFetch?: boolean;
}

interface UseKlaviyoResult {
  account: KlaviyoAccount | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  fetchAccount: () => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<boolean>;
}

export function useKlaviyo(options: UseKlaviyoOptions = {}): UseKlaviyoResult {
  const [account, setAccount] = useState<KlaviyoAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { storeId, autoFetch = true } = options;
  
  const fetchAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Construct the request URL
      const url = new URL('/api/klaviyo/account', window.location.origin);
      
      if (storeId) {
        url.searchParams.append('store_id', storeId);
      }
      
      const response = await fetch(url.toString());
      
      if (response.status === 404) {
        // Not found is not an error, just no account
        setAccount(null);
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Klaviyo account');
      }
      
      const data = await response.json();
      setAccount(data.account);
    } catch (error: any) {
      console.error('Error fetching Klaviyo account:', error);
      setError(error.message || 'Failed to load Klaviyo account information');
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);
  
  const disconnectAccount = useCallback(async (accountId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/klaviyo/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect Klaviyo account');
      }
      
      setAccount(null);
      return true;
    } catch (error: any) {
      console.error('Error disconnecting Klaviyo account:', error);
      setError(error.message || 'Failed to disconnect Klaviyo account');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (autoFetch) {
      fetchAccount();
    }
  }, [fetchAccount, autoFetch]);
  
  return {
    account,
    isConnected: !!account,
    isLoading,
    error,
    fetchAccount,
    disconnectAccount,
  };
}