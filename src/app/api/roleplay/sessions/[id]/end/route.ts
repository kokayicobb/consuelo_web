import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';

const RoleplaySession = require('../../../../../../../models/RoleplaySession');

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const session = await RoleplaySession.findById(id);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found'
        },
        { status: 404 }
      );
    }
    
    const endTime = new Date();
    const totalDuration = session.start_time ? Math.round((endTime - session.start_time) / 1000) : 0;
    
    const updatedSession = await RoleplaySession.findByIdAndUpdate(
      id,
      {
        status: 'ended',
        end_time: endTime,
        total_duration: totalDuration
      },
      { new: true, runValidators: true }
    )
      .populate('scenario_id', 'scenario_id title description')
      .populate('character_id', 'name role personality');
    
    return NextResponse.json({
      success: true,
      session: updatedSession
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to end session'
      },
      { status: 500 }
    );
  }
}