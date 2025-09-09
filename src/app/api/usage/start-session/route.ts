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

    await dbConnect();

    // Check if user has sufficient credits (at least $0.15 for 1 minute)
    const userCredits = await UserCredits.findOne({ clerkUserId: userId });
    
    if (!userCredits || userCredits.credits < 0.15) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please add credits to continue.' },
        { status: 402 } // Payment Required
      );
    }

    // End any existing active sessions for this user
    await UsageSession.updateMany(
      { clerkUserId: userId, isActive: true },
      { isActive: false, endTime: new Date() }
    );

    // Create new usage session
    const session = new UsageSession({
      clerkUserId: userId,
      sessionType: 'roleplay',
      startTime: new Date(),
      isActive: true,
    });

    await session.save();

    return NextResponse.json({
      sessionId: session._id,
      currentCredits: userCredits.credits,
      ratePerMinute: 0.15,
    });

  } catch (error) {
    console.error('Error starting usage session:', error);
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    );
  }
}