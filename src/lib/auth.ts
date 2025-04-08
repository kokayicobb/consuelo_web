// src/lib/auth.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { type User, type Session } from '@supabase/supabase-js';

// Type for auth response
export type AuthResponse = {
  user: User | null;
  session: Session | null;
};

// Main auth function for server components and API routes
export async function auth(): Promise<AuthResponse> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  try {
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
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return { user: null, session: null };
    }
    
    return { user, session };
  } catch (error) {
    console.error('Error in auth function:', error);
    return { user: null, session: null };
  }
}

// Shorthand to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const { user } = await auth();
  return !!user;
}

// Get user ID if authenticated
export async function getUserId(): Promise<string | null> {
  const { user } = await auth();
  return user?.id || null;
}

// This function can be used with the `withAuth` HOC for protected pages
export async function getAuthenticatedUser(): Promise<User | null> {
  const { user } = await auth();
  return user;
}