// File: /src/app/api/try-on/admin/usage/keys/[id]/route.ts (assuming this is the path)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

// Import utility function dynamically to prevent build-time Supabase initialization
async function importUsageUtils() {
  const { getKeyUsageStats } = await import('@/utils/usage');
  return { getKeyUsageStats };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // First verify the user is authenticated as an admin
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const keyId = params.id;
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    // Get days parameter from query string
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
    
    // Dynamically import the usage utility to prevent build-time Supabase initialization
    const { getKeyUsageStats } = await importUsageUtils();
    
    const stats = await getKeyUsageStats(keyId, days);
    if (!stats) {
      return NextResponse.json({ error: 'No data available for this key' }, { status: 404 });
    }
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching key stats:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}