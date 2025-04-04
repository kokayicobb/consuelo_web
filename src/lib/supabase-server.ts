// lib/supabase-server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Create a Supabase client for use in server components
export const createServerClient = () => {
  return createServerComponentClient({ cookies });
};