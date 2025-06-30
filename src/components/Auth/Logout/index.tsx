// src/components/Auth/LogoutButton.tsx
'use client';

import { useState } from 'react';
import { signOut } from '@workos-inc/authkit-nextjs';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({ 
  variant = 'outline',
  size = 'default',
  className = '',
  showIcon = true,
  children
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // AuthKit will handle the redirect after logout
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="mr-2 h-4 w-4" />}
          {children || 'Sign Out'}
        </>
      )}
    </Button>
  );
}

// Alternative compact version for navigation bars
export function LogoutIconButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant="ghost"
      size="icon"
      title="Sign Out"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
    </Button>
  );
}

// Hook version for custom implementations
export function useSignOut() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoading(false);
      return { success: false, error };
    }
  };

  return { signOut: handleSignOut, isLoading };
}