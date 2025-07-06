// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client for server-side operations
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    // cookies: {
    //   get(name: string) {
    //     return cookies().get(name)?.value;
    //   },
    // },
  });
}

// Create an admin client with service role key
// This should ONLY be used in secure server-side contexts
export function createServiceRoleClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper to create a client with a Clerk token for server-side operations
export function createClerkSupabaseServerClient(clerkToken?: string | null) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: clerkToken ? `Bearer ${clerkToken}` : '',
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export { createClient };
