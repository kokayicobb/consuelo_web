// src/app/api/try-on/route.ts
export async function POST(req) {
  console.log('=== Try-on Request Started ===');
  
  try {
    // Log the raw request headers to check content type
    console.log('Request headers:', Object.fromEntries(req.headers));
    
    // Get the request body and log it (without full image data)
    const data = await req.json();
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
      return Response.json({ error: 'Missing model_image' }, { status: 400 });
    }
    
    if (!data.garment_image) {
      console.error('Missing garment_image in request');
      return Response.json({ error: 'Missing garment_image' }, { status: 400 });
    }

    // Validate and normalize category - THIS IS THE KEY FIX
    const validCategories = ['tops', 'bottoms', 'one-pieces'];
    let normalizedCategory = data.category ? String(data.category).toLowerCase().trim() : '';
    
    // Map "dress" to "one-pieces" (which is what FASHN API accepts)
    if (normalizedCategory === 'dress') {
      normalizedCategory = 'one-pieces';
    }
    
    // Validate the category is one of the supported values
    if (!validCategories.includes(normalizedCategory)) {
      console.error(`Invalid category: "${normalizedCategory}"`);
      return Response.json(
        { error: `"category" must be one of [tops, bottoms, one-pieces]` },
        { status: 400 }
      );
    }

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

    const result = await response.json();
    console.log('FASHN API response body:', result);

    if (!response.ok) {
      console.error('FASHN API error:', result);
      return Response.json(
        { error: result },
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