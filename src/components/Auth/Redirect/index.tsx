// src/app/auth-redirect/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Loader2 } from 'lucide-react';

export default function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('to') || '/dashboard';
  const [message, setMessage] = useState('Please wait while we redirect you...');

  useEffect(() => {
    // Add debug logging
    console.log("AuthRedirect: Auth state:", { 
      user: user?.email, 
      isLoading, 
      redirect 
    });

    if (!isLoading) {
      if (user) {
        setMessage(`User authenticated (${user.email}). Redirecting...`);
        console.log("Auth redirect: User is authenticated, redirecting to:", redirect);
        
        // Small delay to ensure everything is synced
        setTimeout(() => {
          window.location.replace(redirect);
        }, 1000); // Longer delay for testing
      } else {
        setMessage('Not authenticated. Redirecting to login...');
        console.log("Auth redirect: User is not authenticated, redirecting to login");
        window.location.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      }
    }
  }, [isLoading, user, redirect]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">{message}</p>
        <p className="text-sm mt-4">Debug: {isLoading ? "Loading..." : (user ? `User: ${user.email}` : "No user")}</p>
      </div>
    </div>
  );
}