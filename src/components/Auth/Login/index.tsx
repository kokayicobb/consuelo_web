// src/components/Auth/Login/index.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  
  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Redirect to WorkOS AuthKit hosted login
      // The state parameter will be used to redirect back after auth
      const authUrl = `/api/auth/login?redirect_uri=${encodeURIComponent(window.location.origin)}/callback&state=${encodeURIComponent(redirect)}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to initiate sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Redirect to WorkOS AuthKit hosted signup
      const authUrl = `/api/auth/login?redirect_uri=${encodeURIComponent(window.location.origin)}/callback&state=${encodeURIComponent(redirect)}&screen_hint=sign-up`;
      window.location.href = authUrl;
    } catch (error) {
      console.error("Signup error:", error);
      setError("Failed to initiate sign up. Please try again.");
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">Sign in to your account or create a new one</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <Button 
          onClick={handleSignIn} 
          className="w-full" 
          disabled={isLoading}
          variant="default"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        <Button 
          onClick={handleSignUp} 
          className="w-full" 
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>
      
      <div className="text-center">
        <Link 
          href="/forgot-password" 
          className="text-sm text-primary hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}