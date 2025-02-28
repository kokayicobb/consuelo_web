// app/api/try-on/route.js
import { NextResponse } from 'next/server';

// Define CORS headers in one place to ensure consistency
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Handle OPTIONS requests (for CORS preflight)
export async function OPTIONS() {
  // Important: Return 204 (No Content) instead of 200 for OPTIONS
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req) {
  console.log('=== Try-on Request Started ===');
  
  try {
    const data = await req.json();
    console.log('Request data:', {
      category: data.category,
      mode: data.mode,
      num_samples: data.num_samples,
      hasModelImage: !!data.model_image,
      hasGarmentImage: !!data.garment_image
    });

    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FASHN_API_KEY}`
      },
      body: JSON.stringify({
        model_image: data.model_image,
        garment_image: data.garment_image,
        category: data.category,
        mode: data.mode || 'balanced',
        num_samples: data.num_samples || 1
      })
    });

    const result = await response.json();
    console.log('FASHN API Response:', result);

    if (!response.ok) {
      console.error('FASHN API Error:', result);
      return NextResponse.json(
        { error: result },
        { 
          status: response.status,
          headers: corsHeaders
        }
      );
    }

    return NextResponse.json(result, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Try-on error:', error);
    return NextResponse.json(
      { error: { message: error.message } },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}