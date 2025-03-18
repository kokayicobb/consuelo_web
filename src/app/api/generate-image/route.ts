// app/api/generate-image/route.js (Next.js App Router)
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Add context to the prompt specific to fashion/model generation
    const enhancedPrompt = `High quality, photorealistic fashion model wearing: ${prompt}. Studio lighting, professional photography.`;
    
    // Create form data for the Stability API request
    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);
    formData.append('aspect_ratio', '2:3'); // Better for fashion/model photos (portrait orientation)
    formData.append('output_format', 'webp'); // More efficient than PNG
    
    // Optional parameters that might improve fashion model generation
    formData.append('style_preset', 'photographic');
    
    // Call the Stability Image Ultra API
    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/ultra', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Accept': 'application/json' // Get base64 response for easier handling
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stability API error:', errorData);
      throw new Error(`Stability API error: ${response.status}`);
    }

    // Get the JSON response which contains base64 encoded image
    const data = await response.json();
    
    // Create a data URL from the base64 encoded image
    const imageUrl = `data:image/webp;base64,${data.artifacts[0].base64}`;
    
    return NextResponse.json({ imageUrl });
    
  } catch (error) {
    console.error('Error generating image:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}