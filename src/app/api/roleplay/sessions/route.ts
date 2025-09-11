import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '../../../../lib/mongodb';

const Scenario = require('../../../../../models/Scenario');
const Character = require('../../../../../models/Character');
const RoleplaySession = require('../../../../../models/RoleplaySession');

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    let query = {} as any;
    if (user_id) query.user_id = user_id;
    if (status) query.status = status;
    
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;
    
    const [sessions, total] = await Promise.all([
      RoleplaySession.find(query)
        .populate('scenario_id', 'scenario_id title description')
        .populate('character_id', 'name role personality')
        .select('session_id scenario_id character_id user_id status start_time end_time total_duration conversation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      RoleplaySession.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limitNum);
    
    return NextResponse.json({
      success: true,
      sessions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sessions'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { scenario_id, character_id, user_id } = body;
    
    // Validate required fields
    if (!scenario_id || !user_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'scenario_id and user_id are required'
        },
        { status: 400 }
      );
    }
    
    // Validate scenario exists
    const scenario = await Scenario.findById(scenario_id);
    if (!scenario) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scenario not found'
        },
        { status: 404 }
      );
    }
    
    // Validate character exists if provided
    if (character_id) {
      const character = await Character.findById(character_id);
      if (!character) {
        return NextResponse.json(
          {
            success: false,
            error: 'Character not found'
          },
          { status: 404 }
        );
      }
    }
    
    const session = new RoleplaySession({
      session_id: uuidv4(),
      scenario_id,
      character_id: character_id || null,
      user_id,
      status: 'active',
      conversation: [],
      start_time: new Date()
    });
    
    await session.save();
    
    return NextResponse.json(
      {
        success: true,
        session
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create session'
      },
      { status: 500 }
    );
  }
}