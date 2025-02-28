// app/api/try-on/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  console.log('=== Try-on Request Started ===');
  
  try {
    // Extract API key from Authorization header (Bearer token format)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return NextResponse.json(
        { error: { message: 'Missing or invalid Authorization header' } },
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
        { error: { message: 'Invalid API key' } },
        { status: 403 }
      );
    }
    
    // Get the request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.model_image) {
      console.error('Missing model_image in request');
      return NextResponse.json({ error: { message: 'Missing model_image' } }, { status: 400 });
    }
    
    if (!data.garment_image) {
      console.error('Missing garment_image in request');
      return NextResponse.json({ error: { message: 'Missing garment_image' } }, { status: 400 });
    }
    
    if (!data.category) {
      console.error('Missing category in request');
      return NextResponse.json({ error: { message: 'Missing category' } }, { status: 400 });
    }
    
    // Log request structure without sensitive data
    console.log('Request data structure:', {
      hasModelImage: !!data.model_image,
      modelImageLength: data.model_image ? data.model_image.length : 'none',
      hasGarmentImage: !!data.garment_image,
      garmentImageLength: data.garment_image ? data.garment_image.length : 'none',
      category: data.category,
      mode: data.mode || 'balanced',
      num_samples: data.num_samples || 1
    });

    // Normalize category for FASHN API
    const validCategories = ['tops', 'bottoms', 'one-pieces'];
    let normalizedCategory = data.category.toLowerCase().trim();
    
    // Map categories if needed
    const categoryMap = {
      'dress': 'one-pieces',
      'dresses': 'one-pieces', 
      'jumpsuit': 'one-pieces',
      'romper': 'one-pieces',
      'one piece': 'one-pieces',
      'onepiece': 'one-pieces',
      'one-piece': 'one-pieces',
      'top': 'tops',
      'shirt': 'tops',
      'shirts': 'tops',
      'blouse': 'tops',
      'tshirt': 'tops',
      't-shirt': 'tops',
      'jacket': 'tops',
      'hoodie': 'tops',
      'bottom': 'bottoms',
      'pant': 'bottoms',
      'pants': 'bottoms',
      'jeans': 'bottoms',
      'shorts': 'bottoms',
      'skirt': 'bottoms'
    };
    
    if (categoryMap[normalizedCategory]) {
      normalizedCategory = categoryMap[normalizedCategory];
    }
    
    // Final validation - default to tops if invalid
    if (!validCategories.includes(normalizedCategory)) {
      console.warn(`Invalid category: "${normalizedCategory}", defaulting to "tops"`);
      normalizedCategory = 'tops';
    }
    
    // Forward to FASHN API
    const fashnApiKey = 'fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB';
    const payload = {
      model_image: data.model_image,
      garment_image: data.garment_image,
      category: normalizedCategory,
      mode: data.mode || 'balanced',
      num_samples: data.num_samples || 1
    };
    
    console.log('Sending request to FASHN API with category:', normalizedCategory);
    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fashnApiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    // Log response status
    console.log('FASHN API response status:', response.status);
    
    // If response is not OK, return error
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error from FASHN API:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorJson.error || { message: 'Error from API provider' } },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: { message: 'Error from API provider' } },
          { status: response.status }
        );
      }
    }
    
    // Forward the successful response
    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Try-on error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}