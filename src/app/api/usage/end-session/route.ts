import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import UserCredits from '@/models/UserCredits';
import UsageSession from '@/models/UsageSession';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();

    await dbConnect();

    // Find the active session
    const session = await UsageSession.findOne({
      _id: sessionId,
      clerkUserId: userId,
      isActive: true,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Active session not found' },
        { status: 404 }
      );
    }

    // Calculate duration and credits used
    const endTime = new Date();
    const durationMs = endTime.getTime() - session.startTime.getTime();
    const durationMinutes = Math.max(1, Math.ceil(durationMs / (1000 * 60))); // Minimum 1 minute
    const creditsUsed = durationMinutes * 0.15;

    // Update session
    session.endTime = endTime;
    session.durationMinutes = durationMinutes;
    session.creditsUsed = creditsUsed;
    session.isActive = false;
    await session.save();

    // Deduct credits from user
    const userCredits = await UserCredits.findOne({ clerkUserId: userId });
    
    if (userCredits) {
      userCredits.credits = Math.max(0, userCredits.credits - creditsUsed);
      await userCredits.save();
    }

    return NextResponse.json({
      durationMinutes,
      creditsUsed,
      remainingCredits: userCredits?.credits || 0,
    });

  } catch (error) {
    console.error('Error ending usage session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}