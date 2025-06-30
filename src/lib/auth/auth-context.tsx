// src/lib/auth/auth-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WorkOS } from '@workos-inc/node';

// Define User type to match your existing interface
type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Define Session type to match your existing interface
type Session = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: User;
};

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
};

export type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // This logs the auth state whenever it changes
    console.log("Auth state changed:", { user: authState.user?.email, isLoading: authState.isLoading });
  }, [authState.user, authState.isLoading]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check for existing session in cookies/localStorage
        const sessionData = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (sessionData.ok) {
          const { user, session } = await sessionData.json();
          
          if (user && session) {
            setAuthState({
              user,
              session,
              isLoading: false,
              error: null,
            });
          } else {
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              error: null,
            });
          }
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          error: error as Error,
        });
      }
    };

    getInitialSession();

    // Set up periodic session validation
    const sessionCheckInterval = setInterval(async () => {
      if (authState.session) {
        try {
          const response = await fetch('/api/auth/validate', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (!response.ok) {
            // Session is invalid, clear auth state
            setAuthState({
              user: null,
              session: null,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Session validation error:', error);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [authState.session]);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign in');
      }

      const { user, session } = await response.json();

      // Introduce slight delay to ensure cookies are set
      await new Promise((resolve) => setTimeout(resolve, 200));

      setAuthState({
        user,
        session,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error signing in:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign up');
      }

      const { user, session } = await response.json();
      
      setAuthState({
        user,
        session,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error signing up:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Error during signout API call');
      }
      
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          redirectUrl: `${window.location.origin}/reset-password`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }
      
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error resetting password:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
      
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error updating password:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const value = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};