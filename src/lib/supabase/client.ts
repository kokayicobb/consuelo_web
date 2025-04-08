// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  // In development, show a helpful error message
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.error(
      '⚠️ Supabase URL and Anon Key are required! Check your .env.local file.'
    );
  }
}

// Initialize the Supabase client with the public URL and anon key
export const supabaseClient = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Create a server-side client that uses the service role key
// This should ONLY be used in server components or API routes
// Check if we're on the server before trying to initialize this
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