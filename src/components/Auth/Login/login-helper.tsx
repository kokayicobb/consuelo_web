// src/components/auth/login-handler.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase/client';

export default function LoginHandler({ onLogin }: { onLogin?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('to') || '/dashboard';
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        // Get current session
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsChecking(false);
          return;
        }
        
        if (data.session) {
          console.log("Session found, redirecting to:", redirectTo);
          
          // Critical: Force a complete page refresh to sync cookies
          window.location.href = redirectTo;
          
          // Don't call router.push as it doesn't refresh the page
          // router.push(redirectTo);
        } else {
          console.log("No active session found");
          setIsChecking(false);
        }
      } catch (e) {
        console.error("Auth check error:", e);
        setIsChecking(false);
      }
    };
    
    checkAndRedirect();
  }, [redirectTo, router]);

  return isChecking ? (
    <div className="text-center p-4">
      <p>Checking authentication...</p>
    </div>
  ) : null;
}