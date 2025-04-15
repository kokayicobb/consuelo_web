// src/lib/auth-client.ts
import { User, Session } from '@supabase/supabase-js';
import { createBrowserClient } from './supabase-config';

// Type definitions
export type AuthStatus = {
  authenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
};

// Create a Supabase client for client components
// Use the singleton version to prevent multiple instances warning
export const createClient = () => createBrowserClient();

/**
 * Synchronizes the client session state with the server session state
 * This is useful when client and server get out of sync
 */
export async function syncSession(): Promise<{
  authenticated: boolean;
  user: User | null;
  session: Partial<Session> | null;
}> {
  try {
    // Fetch the latest auth state from our API endpoint
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include credentials for cookies
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to sync session: ${response.statusText}`);
    }

    const sessionData = await response.json();
    const authenticated = !!sessionData.user;

    // Convert from our API format back to Supabase format if needed
    let supabaseUser = null;
    if (authenticated && sessionData.user) {
      supabaseUser = {
        id: sessionData.user.id,
        email: sessionData.user.email,
        user_metadata: {
          full_name: sessionData.user.name,
          avatar_url: sessionData.user.image
        }
      } as unknown as User;
    }

    return { 
      authenticated,
      user: supabaseUser,
      session: authenticated ? { expires_at: new Date(sessionData.expires).getTime() } : null
    };
  } catch (error) {
    console.error('Error syncing session:', error);
    return { authenticated: false, user: null, session: null };
  }
}

/**
 * Force a refresh of the session from the server
 */
export async function refreshSession(): Promise<{
  refreshed: boolean;
  authenticated: boolean;
  user: User | null;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return { refreshed: false, authenticated: false, user: null };
    }
    
    return {
      refreshed: true,
      authenticated: !!data.session,
      user: data.user
    };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return { refreshed: false, authenticated: false, user: null };
  }
}

/**
 * Sign out the user from both client and server
 */
export async function signOut(): Promise<boolean> {
  try {
    // Sign out on the client
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
}

/**
 * Check authentication status on the client side
 * This is a convenience wrapper around the Supabase client
 */
export async function checkAuth(): Promise<AuthStatus> {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Client auth check error:', error);
      return { 
        authenticated: false, 
        user: null, 
        loading: false, 
        error: error.message 
      };
    }
    
    // If we don't have a session on the client but might have one on the server,
    // try to sync with the server
    if (!session) {
      console.log('No session on client, checking server...');
      const serverSync = await syncSession();
      
      if (serverSync.authenticated) {
        console.log('Session found on server, updating client...');
        return {
          authenticated: true,
          user: serverSync.user,
          loading: false,
          error: null
        };
      }
    }
    
    return {
      authenticated: !!session,
      user: session?.user || null,
      loading: false,
      error: null
    };
  } catch (error) {
    console.error('Unexpected client auth error:', error);
    return {
      authenticated: false,
      user: null,
      loading: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}