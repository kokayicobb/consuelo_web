// app/api/try-on/route.js
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
      return Response.json(
        { error: result },
        { status: response.status }
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error('Try-on error:', error);
    return Response.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }
}

