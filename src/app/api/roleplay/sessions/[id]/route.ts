import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';

const RoleplaySession = require('../../../../../../models/RoleplaySession');

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    const updateData = { ...body };
    
    // Remove protected fields
    delete updateData._id;
    delete updateData.session_id;
    delete updateData.createdAt;
    
    // Auto-calculate duration when status becomes 'completed'/'ended'
    if (updateData.status === 'completed' || updateData.status === 'ended') {
      const session = await RoleplaySession.findById(id);
      if (session && session.start_time) {
        updateData.end_time = new Date();
        updateData.total_duration = Math.round((updateData.end_time - session.start_time) / 1000);
      }
    }
    
    const session = await RoleplaySession.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('scenario_id', 'scenario_id title description')
      .populate('character_id', 'name role personality');
    
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update session'
      },
      { status: 500 }
    );
  }
}