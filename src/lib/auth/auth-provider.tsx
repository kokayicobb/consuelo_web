"use client"
// src/lib/auth/auth-provider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient, checkAuth, refreshSession, signOut, AuthStatus } from '../auth-client';

// Create auth context
const AuthContext = createContext<{
  authStatus: AuthStatus;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}>({
  authStatus: { authenticated: false, user: null, loading: true, error: null },
  refreshAuth: async () => {},
  logout: async () => {},
});

// Custom hook to access auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  // Function to refresh authentication state
  const refreshAuth = async () => {
    setAuthStatus(prev => ({ ...prev, loading: true, error: null }));
    try {
      const status = await checkAuth();
      setAuthStatus(status);
    } catch (error) {
      setAuthStatus({
        authenticated: false,
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check authentication',
      });
    }
  };

  // Function to handle logout
  const logout = async () => {
    setAuthStatus(prev => ({ ...prev, loading: true }));
    try {
      await signOut();
      setAuthStatus({
        authenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to log out',
      }));
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const supabase = createClient();
    
    // Initial auth check
    refreshAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_IN') {
          // Wait a bit for cookies to be set properly
          setTimeout(() => {
            setAuthStatus({
              authenticated: true,
              user: session?.user || null,
              loading: false,
              error: null
            });
          }, 500);
        } else if (event === 'SIGNED_OUT') {
          setAuthStatus({
            authenticated: false,
            user: null,
            loading: false,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          // Refresh the auth state when token is refreshed or user is updated
          setAuthStatus({
            authenticated: true,
            user: session?.user || null,
            loading: false,
            error: null
          });
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ authStatus, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// HOC to protect client components
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const { authStatus } = useAuth();
    
    if (authStatus.loading) {
      return <div>Loading...</div>;
    }
    
    if (!authStatus.authenticated) {
      // You could redirect here using router if needed
      return <div>Please log in to access this content.</div>;
    }
    
    return <Component {...props} />;
  };
}