// app/api/try-on/status/[id]/route.js
import { NextResponse } from 'next/server';

// Handle OPTIONS requests (for CORS preflight)
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

export async function GET(req, { params }) {
  console.log('=== Try-on Status Request ===');
  
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
          }
        }
      );
    }
    
    const response = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.FASHN_API_KEY}`
      }
    });
    
    const result = await response.json();
    console.log('FASHN API Status Response:', result);
    
    if (!response.ok) {
      console.error('FASHN API Status Error:', result);
      return NextResponse.json(
        { error: result },
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
          }
        }
      );
    }
    
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
      }
    });
  } catch (error) {
    console.error('Try-on status error:', error);
    return NextResponse.json(
      { error: { message: error.message } },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
        }
      }
    );
  }
}