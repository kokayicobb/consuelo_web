// src/components/auth/ResetPasswordForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isValidLink, setIsValidLink] = useState(true);
  
  const { updatePassword } = useAuth();
  const router = useRouter();
  
  // Verify that the reset password link is valid
  useEffect(() => {
    const checkResetLink = async () => {
      try {
        // Get the hash from the URL
        const hash = window.location.hash.substring(1);
        if (!hash) {
          setIsValidLink(false);
          setError('Invalid password reset link. Please request a new one.');
          return;
        }
        
        // Parse the hash to get access_token and type
        const params = new URLSearchParams(hash);
        const type = params.get('type');
        const accessToken = params.get('access_token');
        
        if (type !== 'recovery' || !accessToken) {
          setIsValidLink(false);
          setError('Invalid password reset link. Please request a new one.');
          return;
        }
        
        // The link is valid
        setIsValidLink(true);
      } catch (err) {
        console.error('Error checking reset link:', err);
        setIsValidLink(false);
        setError('An error occurred verifying your reset link. Please request a new one.');
      }
    };
    
    checkResetLink();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }
    
    try {
      await updatePassword(password);
      
      setSuccessMessage(
        'Your password has been successfully reset. You can now log in with your new password.'
      );
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'An error occurred resetting your password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isValidLink) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Reset password</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertTitle>Invalid Link</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Request a new password reset link
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Reset your password</h1>
        <p className="text-muted-foreground">Enter your new password below</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="default" className="border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || !!successMessage}
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters long
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading || !!successMessage}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !!successMessage}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </div>
  );
}