// File: /src/app/api/try-on/admin/usage/route.ts (assuming this is the path)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';

// Import utility function dynamically to prevent build-time Supabase initialization
async function importUsageUtils() {
  const { getOverallUsageStats } = await import('@/utils/usage');
  return { getOverallUsageStats };
}

export async function GET(req: NextRequest) {
  // First verify the user is authenticated as an admin
  const session = await getServerSession(authOptions);
  (!session || !session.user || (session.user as { role?: string }).role !== 'admin'); {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get days parameter from query string
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
    
    // Dynamically import the usage utility to prevent build-time Supabase initialization
    const { getOverallUsageStats } = await importUsageUtils();
    
    const stats = await getOverallUsageStats(days);
    if (!stats) {
      return NextResponse.json({ error: 'No data available' }, { status: 404 });
    }
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}