//src/lib/auth.ts
import { type User, type Session } from '@supabase/supabase-js';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { GetServerSidePropsContext } from 'next';

// Type for auth response
export type AuthResponse = {
  user: User | null;
  session: Session | null;
};

// Main auth function for server components and API routes in the Pages Router
export async function getServerSideAuth(context: GetServerSidePropsContext): Promise<AuthResponse> {
  const supabase = createPagesServerClient(context);
  
  try {
    // First get the session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    
    console.log("Server auth check:", {
      hasSession: !!session,
      userId: session?.user?.id || null,
      error: error?.message || null
    });
    
    if (error) {
      console.error('Error getting session:', error);
      return { user: null, session: null };
    }
    
    if (!session) {
      return { user: null, session: null };
    }
    
    // Use the existing session
    return { user: session.user, session };
  } catch (error) {
    console.error('Error in auth function:', error);
    return { user: null, session: null };
  }
}

// Shorthand to check if user is authenticated
export async function isAuthenticated(context: GetServerSidePropsContext): Promise<boolean> {
  const { user } = await getServerSideAuth(context);
  return !!user;
}

// Get user ID if authenticated
export async function getUserId(context: GetServerSidePropsContext): Promise<string | null> {
  const { user } = await getServerSideAuth(context);
  return user?.id || null;
}

// Get authenticated user
export async function getAuthenticatedUser(context: GetServerSidePropsContext): Promise<User | null> {
  const { user } = await getServerSideAuth(context);
  return user;
}

// Get access token for API calls
export async function getAccessToken(context: GetServerSidePropsContext): Promise<string | null> {
  const { session } = await getServerSideAuth(context);
  return session?.access_token || null;
}

// Helper for API routes
export async function getApiAuth(req: any, res: any): Promise<AuthResponse> {
  const supabase = createPagesServerClient({ req, res });
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('API auth error:', error);
      return { user: null, session: null };
    }
    
    return { 
      user: session?.user || null, 
      session: session || null 
    };
  } catch (error) {
    console.error('Error in API auth function:', error);
    return { user: null, session: null };
  }
}