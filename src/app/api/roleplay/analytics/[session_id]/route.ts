import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';

const SessionAnalytics = require('../../../../../../models/SessionAnalytics');

export async function GET(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    await connectDB();
    
    const { session_id } = params;
    
    const analytics = await SessionAnalytics.findOne({ session_id })
      .populate('scenario_id', 'scenario_id title description');
    
    if (!analytics) {
      return NextResponse.json(
        {
          success: false,
          error: 'Analytics not found for this session'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics'
      },
      { status: 500 }
    );
  }
}