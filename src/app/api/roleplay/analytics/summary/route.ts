import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';

const SessionAnalytics = require('../../../../../../models/SessionAnalytics');

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    
    let query = {} as any;
    if (user_id) query.user_id = user_id;
    
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;
    
    const [analytics, total] = await Promise.all([
      SessionAnalytics.find(query)
        .populate('scenario_id', 'scenario_id title description')
        .select('session_id scenario_id user_id performance_score feedback_rating completion_status key_metrics createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      SessionAnalytics.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limitNum);
    
    return NextResponse.json({
      success: true,
      analytics,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics summary'
      },
      { status: 500 }
    );
  }
}