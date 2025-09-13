import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';

const RoleplayTip = require('../../../../../models/RoleplayTip');

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const session_id = searchParams.get('session_id');
    const difficulty_level = searchParams.get('difficulty_level');
    const featured = searchParams.get('featured');
    
    let query = { status: 'active' } as any;
    
    if (category) query.category = category;
    if (session_id) query.session_id = session_id;
    if (difficulty_level) query.difficulty_level = difficulty_level;
    if (featured !== null) query.is_featured = featured === 'true';
    
    const tips = await RoleplayTip.find(query)
      .populate('related_scenarios', 'scenario_id title description')
      .select('category title content techniques difficulty_level is_featured related_scenarios')
      .sort({ is_featured: -1, createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      tips
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tips'
      },
      { status: 500 }
    );
  }
}