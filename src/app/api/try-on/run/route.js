// For App Router (Next.js 13+)
// app/api/try-on/run/route.js

import { NextResponse } from 'next/server'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}

export async function POST(request) {
  // Add CORS headers to response
  const headers = {
    'Access-Control-Allow-Origin': 'https://try-on-testing.myshopify.com',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
  
  try {
    const body = await request.json()
    const { model_image, garment_image, category, mode, num_samples } = body
    
    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FASHN_API_KEY}`
      },
      body: JSON.stringify({
        model_image,
        garment_image,
        category,
        mode: mode || 'balanced',
        num_samples: num_samples || 1
      })
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status, headers })
  } catch (error) {
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500, headers }
    )
  }
}