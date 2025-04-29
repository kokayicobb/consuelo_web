// // src/lib/auth/server-auth.ts
// import { cookies } from 'next/headers';
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// import { supabaseAdmin } from '@/lib/supabase/client';
// import { type User } from '@supabase/supabase-js';

// // For use in server components and API routes
// export async function auth() {
//   const cookieStore = cookies();
//   const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
//   try {
//     const {
//       data: { session },
//       error,
//     } = await supabase.auth.getSession();
    
//     if (error) {
//       console.error('Error getting session:', error);
//       return { user: null, session: null };
//     }
    
//     if (!session) {
//       return { user: null, session: null };
//     }
    
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
    
//     if (userError) {
//       console.error('Error getting user:', userError);
//       return { user: null, session: null };
//     }
    
//     return { user, session };
//   } catch (error) {
//     console.error('Error in auth function:', error);
//     return { user: null, session: null };
//   }
// }

// // Get user for API routes with admin privileges
// export async function getUserById(userId: string): Promise<User | null> {
//   try {
//     const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    
//     if (error) {
//       console.error('Error getting user by ID:', error);
//       return null;
//     }
    
//     return data.user;
//   } catch (error) {
//     console.error('Error in getUserById function:', error);
//     return null;
//   }
// }

// // Get user profile from database
// export async function getUserProfile(userId: string) {
//   try {
//     const { data, error } = await supabaseAdmin
//       .from('profiles')
//       .select('*')
//       .eq('id', userId)
//       .single();
    
//     if (error) {
//       console.error('Error getting user profile:', error);
//       return null;
//     }
    
//     return data;
//   } catch (error) {
//     console.error('Error in getUserProfile function:', error);
//     return null;
//   }
// }

// // Check if a user has a specific role
// export async function hasRole(userId: string, role: string): Promise<boolean> {
//   try {
//     const { data, error } = await supabaseAdmin
//       .from('user_roles')
//       .select('*')
//       .eq('user_id', userId)
//       .eq('role', role)
//       .single();
    
//     if (error) {
//       return false;
//     }
    
//     return !!data;
//   } catch (error) {
//     console.error('Error in hasRole function:', error);
//     return false;
//   }
// }