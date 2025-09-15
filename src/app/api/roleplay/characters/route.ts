import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/mongodb';

const Character = require('../../../../../models/Character');
const Scenario = require('../../../../../models/Scenario');

export async function GET(request: NextRequest) {
  try {
    // Get user ID from Clerk - this will be null if not authenticated
    let userId = null;
    try {
      const { userId: clerkUserId } = getAuth(request);
      userId = clerkUserId;
    } catch (authError) {
      // If auth fails, continue without user (show only public characters)
      console.log('Auth not available, showing public characters only');
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Build base query
    let baseQuery = {} as any;

    if (role) {
      baseQuery.role = { $regex: role, $options: 'i' };
    }

    // Always include system characters, plus user's custom characters if authenticated
    let query;
    if (userId) {
      query = {
        ...baseQuery,
        $or: [
          { user_id: { $exists: false } }, // System characters without user_id field
          { user_id: null }, // System characters with null user_id
          { user_id: userId }, // User's custom characters
        ]
      };
    } else {
      // Not authenticated - show all system characters
      query = {
        ...baseQuery,
        $or: [
          { user_id: { $exists: false } },
          { user_id: null }
        ]
      };
    }

    let characters = await Character.find(query)
      .populate('scenario_ids', 'scenario_id title')
      .select('name role personality background objections voice_id scenario_ids user_id is_custom')
      .sort({ createdAt: -1 });

    console.log(`Found ${characters.length} characters for userId: ${userId || 'anonymous'}`);
    console.log('Query used:', JSON.stringify(query, null, 2));

    // If no characters found with the complex query, try a simpler fallback
    if (characters.length === 0) {
      console.log('No characters found with user-specific query, trying fallback...');
      characters = await Character.find({})
        .populate('scenario_ids', 'scenario_id title')
        .select('name role personality background objections voice_id scenario_ids user_id is_custom')
        .sort({ createdAt: -1 })
        .limit(10);

      console.log(`Fallback found ${characters.length} characters`);
    }

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

export async function POST(request: NextRequest) {
  try {
    // Get user ID from Clerk for authentication
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const characterData = await request.json();

    // Validate required fields
    if (!characterData.name || !characterData.role || !characterData.personality || !characterData.background) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role, personality, background' },
        { status: 400 }
      );
    }

    // Create the character with proper structure
    const newCharacter = new Character({
      name: characterData.name,
      role: characterData.role,
      personality: characterData.personality,
      background: characterData.background,
      objections: characterData.objections || [],
      voice_id: characterData.voice_id || '',
      scenario_ids: characterData.scenario_ids || [],
      user_id: userId, // Associate with the Clerk user
      is_custom: true
    });

    await newCharacter.save();

    return NextResponse.json({
      success: true,
      character: newCharacter,
      message: 'Character created successfully'
    });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create character',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}