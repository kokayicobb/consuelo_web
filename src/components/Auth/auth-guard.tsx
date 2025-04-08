// src/components/auth/AuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // If auth is not loading anymore and user is not authenticated
    if (!isLoading && !user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (!isLoading && user) {
      // User is authenticated
      setIsAuthorized(true);
    }
  }, [user, isLoading, router, pathname]);

  // Show loading state while determining auth state
  if (isLoading || isAuthorized === null) {
    return (
      fallback || (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg text-muted-foreground">Loading...</span>
        </div>
      )
    );
  }

  // If authorized, show children
  return <>{children}</>;
}