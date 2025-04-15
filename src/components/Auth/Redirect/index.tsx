// src/app/auth-redirect/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Loader2 } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';

export default function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  // IMPORTANT CHANGE: Accept both 'to' and 'redirect' parameters
  const redirect = searchParams.get('to') || searchParams.get('redirect') || '/dashboard';
  const [message, setMessage] = useState('Please wait while we redirect you...');
  const [verifyingSession, setVerifyingSession] = useState(true);
  const router = useRouter();

  // First, directly verify session with Supabase
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();
        console.log("Direct session verification:", {
          hasSession: !!data.session,
          userEmail: data.session?.user?.email || 'none'
        });
        setVerifyingSession(false);
      } catch (e) {
        console.error("Session verification error:", e);
        setVerifyingSession(false);
      }
    };
    
    verifySession();
  }, []);

  // Handle redirection based on auth state
  useEffect(() => {
    const redirectUser = async () => {
      console.log("AuthRedirect: Current state:", {
        userEmail: user?.email,
        isLoading,
        verifyingSession,
        redirect
      });
      
      // Only proceed when we're done loading and verifying
      if (!isLoading && !verifyingSession) {
        if (user) {
          setMessage(`User authenticated (${user.email}). Redirecting to dashboard...`);
          console.log(`Auth redirect: User authenticated, redirecting to: ${redirect}`);
          
          // CRITICAL CHANGE: Use window.location.href instead of router.push
          // This forces a full page refresh that synchronizes cookies
          window.location.href = redirect;
        } else {
          setMessage('Not authenticated. Redirecting to login...');
          console.log(`Auth redirect: Not authenticated, redirecting to login with to=${redirect}`);
          
          // IMPORTANT: Use 'to' parameter to match middleware
          window.location.href = `/login?to=${encodeURIComponent(redirect)}`;
        }
      }
    };
    
    // Only attempt to redirect when all checks are complete
    if (!isLoading && !verifyingSession) {
      redirectUser();
    }
  }, [isLoading, verifyingSession, user, redirect, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Redirecting...</h1>
        <p className="text-muted-foreground">{message}</p>
        <div className="text-sm mt-4 text-left p-4 bg-gray-100 rounded max-w-md mx-auto">
          <p><strong>Debug Info:</strong></p>
          <p>Loading auth state: {isLoading ? "Yes" : "No"}</p>
          <p>Verifying session: {verifyingSession ? "Yes" : "No"}</p>
          <p>User: {user ? user.email : "None"}</p>
          <p>Redirect Target: {redirect}</p>
        </div>
      </div>
    </div>
  );
}