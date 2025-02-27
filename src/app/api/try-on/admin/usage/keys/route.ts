import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { getAllKeysUsage } from '@/utils/usage';
import { listApiKeys } from '@/utils/keys';

export async function GET(req: NextRequest) {
  // First verify the user is authenticated as an admin
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get days parameter from query string
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
    
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