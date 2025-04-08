'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context'; // Adjust import based on your auth setup

interface KlaviyoConnectButtonProps {
  size?: 'default' | 'sm' | 'lg';
}

export default function KlaviyoConnectButton({ size = 'default' }: KlaviyoConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth(); // Get auth state
  
  // Updated handleConnect function in KlaviyoConnectButton component
const handleConnect = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    console.log("Starting Klaviyo connection process...");
    
    const response = await fetch('/api/klaviyo/authorize', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      // Ensure cookies are sent with the request
      credentials: 'include'
    });
    
    console.log("Authorize response status:", response.status);
    
    // Get response text first for better debugging
    const responseText = await response.text();
    console.log("Response text:", responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`);
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please sign in to connect your Klaviyo account');
      }
      throw new Error(`Server error: ${data.error || response.statusText}`);
    }
    
    if (!data.authUrl) {
      throw new Error('No authorization URL received from server');
    }
    
    console.log("Redirecting to Klaviyo auth URL");
    
    // Redirect to Klaviyo's authorization page
    window.location.href = data.authUrl;
  } catch (error: any) {
    console.error('Klaviyo connection error:', error);
    setError(error.message || 'Failed to connect to Klaviyo');
  } finally {
    setIsLoading(false);
  }
};

  // Show a different state if auth is still loading
  if (authLoading) {
    return (
      <Button size={size} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <Button 
        onClick={handleConnect}
        size={size}
        disabled={isLoading || !user}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          'Connect Klaviyo'
        )}
      </Button>
    </div>
  );
}