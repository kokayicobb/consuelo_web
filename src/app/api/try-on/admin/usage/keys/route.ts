// File: /src/app/api/try-on/admin/usage/keys/route.ts (assuming this is the path)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

// Import utility functions dynamically to prevent build-time Supabase initialization
async function importUtils() {
  const { getAllKeysUsage } = await import('@/utils/usage');
  const { listApiKeys } = await import('@/utils/keys');
  return { getAllKeysUsage, listApiKeys };
}

export async function GET(req: NextRequest) {
  // First verify the user is authenticated as an admin
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get days parameter from query string
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
    
    // Dynamically import the utility functions to prevent build-time Supabase initialization
    const { getAllKeysUsage, listApiKeys } = await importUtils();
    
    // Get all keys and their usage counts
    const keys = await listApiKeys(true); // Include inactive keys
    const keyUsageCounts = await getAllKeysUsage(days);
    
    // Combine the data
    const keyUsage = keys.map(key => ({
      id: key.id,
      name: key.name,
      prefix: key.prefix,
      active: key.active,
      requests: keyUsageCounts[key.id] || 0
    }));
    
    return NextResponse.json(keyUsage);
  } catch (error) {
    console.error('Error fetching key usage:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}