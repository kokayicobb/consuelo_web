// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.error(
      '⚠️ Supabase URL and Anon Key are required! Check your .env.local file.'
    );
  }
}

// Initialize the Supabase client with the public URL and anon key
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Create a Supabase client that accepts a Clerk token
export function createClerkSupabaseClient(clerkToken?: string | null) {
  return createClient(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      global: {
        headers: {
          Authorization: clerkToken ? `Bearer ${clerkToken}` : '',
        }
      }
    }
  )
}

// Create a function to get the admin client
// This ensures the Service Role Key is only used in server context
export function createAdminClient() {
  // This should only be called in server contexts
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient should only be called on the server');
  }
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  
  return createClient(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// For backward compatibility with your existing code
export const supabaseClient = supabase;

// Create a server-side client that uses the service role key
// This should ONLY be used in server components or API routes
// The null value is for client-side, you should check for null before using
export const supabaseAdmin = 
  typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        supabaseUrl || 'https://placeholder-url.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    : null;