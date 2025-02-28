// app/api/try-on/status/[id]/route.js
import { NextResponse } from 'next/server';
import { validateApiKey, incrementUsage } from '../../keys';
import { logApiUsage } from '../../stats';


export async function GET(req, { params }) {
  console.log('=== Try-on Status Request ===');
  
  try {
    const id = params.id;
    
    // Extract API key from headers
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      console.error('Missing x-api-key header');
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    // Validate API key - using your existing validation logic
    const keyData = await validateApiKey(apiKey);
    if (!keyData) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 403 }
      );
    }

    // Log the API usage (non-blocking)
    logApiUsage(apiKey, 'status', true).catch(err => {
      console.error('Failed to log API usage:', err);
    });
    
    // Make request to fashn.ai API
    const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.FASHN_API_KEY || 'fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB'}`
      }
    });
    
    // Parse response as JSON
    const data = await response.json();
    
    // Check for errors
    if (data.error) {
      return NextResponse.json(
        { 
          error: data.error.message || 'Error from external API',
          source: 'external'
        },
        { status: 500 }
      );
    }
    
    // Increment usage count (non-blocking)
    incrementUsage(apiKey).catch(err => {
      console.error('Failed to increment usage count:', err);
    });
    
    // Return successful response
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Try-on status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}