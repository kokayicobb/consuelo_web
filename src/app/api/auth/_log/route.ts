// src/pages/api/auth/_log.ts
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API endpoint to handle NextAuth logging
 * This is just a stub to prevent 404 errors
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Simply return an OK response
  return res.status(200).json({ ok: true });
}