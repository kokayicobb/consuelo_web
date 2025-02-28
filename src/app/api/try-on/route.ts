// src/app/api/try-on/route.ts
export async function POST(req) {
  console.log('=== Try-on Request Started ===');
  
  try {
    // Log the raw request headers to check content type
    console.log('Request headers:', Object.fromEntries(req.headers));
    
    // Get the request body
    const data = await req.json();
    
    // Debug the exact category received
    console.log('RECEIVED CATEGORY:', JSON.stringify(data.category));
    console.log('CATEGORY TYPE:', typeof data.category);
    
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

    // Validate required fields
    if (!data.model_image) {
      console.error('Missing model_image in request');
      return Response.json({ error: { message: 'Missing model_image' } }, { status: 400 });
    }
    
    if (!data.garment_image) {
      console.error('Missing garment_image in request');
      return Response.json({ error: { message: 'Missing garment_image' } }, { status: 400 });
    }

    // COMPLETELY FOOLPROOF CATEGORY NORMALIZATION
    // ==========================================
    
    // Valid categories the FASHN API accepts
    const validCategories = ['tops', 'bottoms', 'one-pieces'];
    
    // Ensure we have a string to work with
    const rawCategory = data.category ? String(data.category) : '';
    let normalizedCategory = rawCategory.toLowerCase().trim();
    
    // Mapping for common values
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
    
    // Apply mapping if we can
    if (categoryMap[normalizedCategory]) {
      console.log(`Mapping category "${normalizedCategory}" to "${categoryMap[normalizedCategory]}"`);
      normalizedCategory = categoryMap[normalizedCategory];
    }
    
    // Final validation check - default to tops if invalid
    if (!validCategories.includes(normalizedCategory)) {
      console.error(`Invalid category after normalization: "${normalizedCategory}", defaulting to "tops"`);
      normalizedCategory = 'tops';
    }
    
    console.log(`Final normalized category: "${normalizedCategory}"`);
    // ==========================================

    // Prepare the payload for FASHN API with normalized category
    const payload = {
      model_image: data.model_image,
      garment_image: data.garment_image,
      category: normalizedCategory,  // Use the normalized valid category
      mode: data.mode || 'balanced',
      num_samples: data.num_samples || 1
    };

    console.log('Sending request to FASHN API with category:', normalizedCategory);
    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FASHN_API_KEY || 'fa-u5Z4R9wIqa6R-kfW6TOb7KXllTSG1PB278ZiB'}`
      },
      body: JSON.stringify(payload)
    });

    // Log response status and headers
    console.log('FASHN API response status:', response.status);
    console.log('FASHN API response headers:', Object.fromEntries(response.headers));

    // Get response body as text first for better error handling
    const responseText = await response.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
      console.log('FASHN API response body:', result);
    } catch (e) {
      console.error('Error parsing API response:', responseText);
      return Response.json(
        { error: { message: 'Invalid response from FASHN API' } },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('FASHN API error:', result);
      return Response.json(
        { error: result.error || { message: 'Error from FASHN API' } },
        { status: response.status }
      );
    }

    return Response.json(result);
  } catch (error) {
    // Log the detailed error
    console.error('Try-on error:', error);
    console.error('Error stack:', error.stack);
    return Response.json(
      { error: { message: error.message, stack: error.stack } },
      { status: 500 }
    );
  }
}