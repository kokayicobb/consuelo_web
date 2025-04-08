//src/components/Klaviyo/index.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import KlaviyoAccountCard from './account-card';
import KlaviyoConnectButton from './connect-button';
import { KlaviyoAccount } from '@/lib/klaviyo/oath-utils';
import { useAuth } from '@/lib/auth/auth-context';

export default function KlaviyoConnect() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<KlaviyoAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth(); // Add this line
  
  // Get query parameters
  const errorParam = searchParams.get('error');
  const messageParam = searchParams.get('message');
  const successParam = searchParams.get('success');
 
const fetchAccount = useCallback(async () => {
  if (!user) {
    console.log("No user in auth context, skipping API call");
    return;
  }

  try {
    setLoading(true);
    console.log("Fetching Klaviyo account with auth state:", { 
      userId: user.id,
      email: user.email 
    });
    
    const response = await fetch('/api/klaviyo/account', {
      credentials: 'include'
    });
    
    // For 401 or 404, just set account to null without showing an error
    // These are expected cases for new users or auth issues
    if (response.status === 401 || response.status === 404) {
      console.log(`Account API returned ${response.status} - No Klaviyo account yet`);
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
    // Don't show errors to the user for account fetching issues
    // Just silently set account to null
    setAccount(null);
  } finally {
    setLoading(false);
  }
}, [user, setAccount, setLoading]);

  useEffect(() => {
    // First, check authentication status
    if (!authLoading) {
      if (!user) {
        // Redirect to login with the current page as the redirect target
        router.push(`/login?redirect=${encodeURIComponent('/klaviyo')}`);
        return;
      } else {
        // Continue with normal initialization if user is authenticated
        // Handle query parameters
        if (errorParam) {
          setError(messageParam || 'An error occurred during Klaviyo integration');
        } else if (successParam === 'true') {
          setSuccess(messageParam || 'Klaviyo connected successfully');
        }
        
        // Fetch the current Klaviyo account status
        fetchAccount();
      }
    }
  }, 
	[authLoading, user, errorParam, messageParam, successParam, router, fetchAccount]);
  
  
  const handleDisconnect = () => {
    setAccount(null);
    setSuccess('Klaviyo account disconnected successfully');
    
    // Clear URL parameters
    router.replace('/klaviyo');
  };
  
  const clearNotifications = () => {
    setError(null);
    setSuccess(null);
  };
  
  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Klaviyo Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect your Klaviyo account to enable customer data synchronization and marketing automation.
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="animate-in fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="border-green-500 animate-in fade-in">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg text-muted-foreground">Loading...</span>
          </div>
        ) : account ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <KlaviyoAccountCard account={account} onDisconnect={handleDisconnect} />
          </div>
        ) : (
          <div className="bg-muted/40 rounded-lg p-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Connect Your Klaviyo Account</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Connect your Klaviyo account to enable seamless data synchronization and marketing automation for your fashion retail business.
              </p>
            </div>
            
            <KlaviyoConnectButton size="lg" />
            
            <div className="text-xs text-muted-foreground max-w-md text-center mt-4">
              By connecting, you authorize our application to access your Klaviyo data according to the permissions requested.
            </div>
          </div>
        )}
        
        <div className="bg-muted/40 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-medium mb-2">What happens when you connect Klaviyo?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Customer data will be synchronized between your store and Klaviyo</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Sales and marketing metrics will be tracked automatically</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Personalized marketing campaigns based on customer behavior</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Automated email flows for abandoned carts, post-purchase, and more</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}