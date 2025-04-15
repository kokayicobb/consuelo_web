// src/pages/api/auth/session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

/**
 * API endpoint to get the current session
 * This supports NextAuth-style session endpoint
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createPagesServerClient({ req, res });
    
    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session API error:', error.message);
      return res.status(500).json({ error: 'Failed to get session' });
    }
    
    // Format response to match NextAuth's session endpoint format
    // This allows compatibility with apps that expect NextAuth
    if (!session) {
      return res.status(200).json({ user: null });
    }
    
    return res.status(200).json({
      user: {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || null,
        email: session.user.email,
        image: session.user.user_metadata?.avatar_url || null
      },
      expires: new Date(session.expires_at! * 1000).toISOString()
    });
  } catch (error) {
    console.error('Unexpected error in session API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}