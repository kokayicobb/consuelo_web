import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';

const Character = require('../../../../../models/Character');

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    let query = {} as any;
    
    if (role) {
      query.role = { $regex: role, $options: 'i' };
    }
    
    const characters = await Character.find(query)
      .populate('scenario_ids', 'scenario_id title')
      .select('name role personality background objections voice_id scenario_ids')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      characters
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch characters'
      },
      { status: 500 }
    );
  }
}