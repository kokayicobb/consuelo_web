import { NextRequest, NextResponse } from 'next/server';
import { createApiKey } from '@/utils/keys';

export async function POST(req: NextRequest) {
  try {
    // Log to debug
    console.log("API request received");
    
    const body = await req.json();
    console.log("Request body:", body);
    
    const { name, purpose } = body;

    if (!name || !purpose) {
      return NextResponse.json(
        { error: 'Name and purpose are required' },
        { status: 400 }
      );
    }
    
    // Create the API key without requiring a user ID
    console.log("Creating API key for:", name);
    const newKey = await createApiKey(`${name} (Public Request)`);
    
    if (!newKey) {
      console.error("Failed to create key - null response from createApiKey");
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      );
    }

    console.log("Key created successfully");
    return NextResponse.json(newKey);
  } catch (error) {
    // Log the full error for debugging
    console.error('Error creating API key:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}