import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';

const Scenario = require('../../../../../models/Scenario');

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = { is_active: true };
    
    if (search) {
      query = {
        ...query,
        $text: { $search: search }
      } as any;
    }
    
    const scenarios = await Scenario.find(query)
      .select('scenario_id title description llmPrompt is_active created_by')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      scenarios
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scenarios'
      },
      { status: 500 }
    );
  }
}