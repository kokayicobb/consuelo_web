import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';

const RoleplayTip = require('../../../../../../models/RoleplayTip');

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const limitNum = Math.min(50, Math.max(1, limit));
    
    const tips = await RoleplayTip.find({ status: 'active' })
      .populate('related_scenarios', 'scenario_id title description')
      .select('category title content techniques difficulty_level is_featured related_scenarios')
      .sort({ createdAt: -1 })
      .limit(limitNum);
    
    return NextResponse.json({
      success: true,
      tips
    });
  } catch (error) {
    console.error('Error fetching recent tips:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recent tips'
      },
      { status: 500 }
    );
  }
}