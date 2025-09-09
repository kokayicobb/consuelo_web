import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import UserCredits from '@/models/UserCredits';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get or create user credits record
    let userCredits = await UserCredits.findOne({ clerkUserId: userId });
    
    if (!userCredits) {
      userCredits = new UserCredits({
        clerkUserId: userId,
        credits: 0,
      });
      await userCredits.save();
    }

    return NextResponse.json({
      credits: userCredits.credits,
      ratePerMinute: 0.15,
      estimatedMinutes: Math.floor(userCredits.credits / 0.15),
    });

  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}