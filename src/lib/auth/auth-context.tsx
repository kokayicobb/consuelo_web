// src/lib/auth/auth-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase/client';

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
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
          
          if (userError) {
            throw userError;
          }
          
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

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: { user }, error } = await supabaseClient.auth.getUser();
          
          if (error) {
            console.error('Error getting user:', error);
            setAuthState((prev) => ({ ...prev, error }));
            return;
          }
          
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
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
//Introduce slight delay
 await new Promise((resolve) => setTimeout(resolve, 200));
      // Wait a moment for cookies to be properly set (CRITICAL!)

      setAuthState({
        user: data.user,
        session: data.session,
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
      
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      setAuthState({
        user: data.user,
        session: data.session,
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
      
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        throw error;
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
      
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
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
      
      const { error } = await supabaseClient.auth.updateUser({
        password,
      });
      
      if (error) {
        throw error;
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