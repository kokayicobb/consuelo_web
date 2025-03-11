// app/api/try-on/status/[id]/route.js
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  console.log('=== Try-on Status Request ===');
  
  try {
    const id = params.id;
    
    // Extract API key from Authorization header (Bearer token format)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }
    
    const apiKey = authHeader.split('Bearer ')[1];
    console.log(`API key received: ${apiKey.substring(0, 8)}...`);
    
    // Hard-coded API key validation for the client
    const validClientKey = 'c816f700.0938efb8d12babafb768a79520c724012324d6ca8884ede35e8b5deb';
    if (apiKey !== validClientKey) {
      console.error('Invalid API key');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 403 }
      );
    }
    
    // Forward the request to FASHN API with your FASHN API key
    const fashnApiKey = 'fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB';
    console.log(`Making request to FASHN API for status of ID: ${id}`);
    
    const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
      headers: {
        'Authorization': `Bearer ${fashnApiKey}`
      }
    });
    
    console.log(`FASHN API response status: ${response.status}`);
    
    // If response is not OK, return error
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from FASHN API:', errorText);
      return NextResponse.json(
        { error: 'Error from API provider' },
        { status: response.status }
      );
    }
    
    // Forward the successful response
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Try-on status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}