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

    // Prepare the payload for FASHN API
    const payload = {
      model_image: data.model_image,
      garment_image: data.garment_image,
      category: data.category || 'dress', // Provide default if missing
      mode: data.mode || 'balanced',
      num_samples: data.num_samples || 1
    };

    console.log('Sending request to FASHN API...');
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