// app/api/try-on/route.js
import { NextResponse } from 'next/server';

// Handle OPTIONS requests (for CORS preflight)
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
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
          headers: {
            'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
          }
        }
      );
    }

    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
      }
    });
  } catch (error) {
    console.error('Try-on error:', error);
    return NextResponse.json(
      { error: { message: error.message } },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
        }
      }
    );
  }
}