"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Create a Supabase client for use in client components
export const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});