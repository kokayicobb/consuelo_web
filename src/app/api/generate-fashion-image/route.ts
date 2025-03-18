// app/api/generate-fashion-image/route.js

import { NextResponse } from 'next/server';
export const runtime = 'edge';
// Helper function to build enhanced fashion prompt
function buildFashionPrompt(options) {
  const { modelOptions, clothingOptions, backgroundOptions, customPrompt, brandGuidelines } = options;
  
  // Base photography settings
  let prompt = "Professional fashion photography, high-end magazine quality, ";
  
  // Add model specifications
  if (modelOptions) {
    if (modelOptions.gender) {
      prompt += `${modelOptions.gender} model, `;
    }
    if (modelOptions.ethnicity && modelOptions.ethnicity !== "") {
      prompt += `${modelOptions.ethnicity} ethnicity, `;
    }
    if (modelOptions.pose) {
      prompt += `in ${modelOptions.pose} pose, `;
    }
  }
  
  // Add clothing specifications
  if (clothingOptions) {
    prompt += "wearing ";
    
    if (clothingOptions.color && clothingOptions.color !== "") {
      prompt += `${clothingOptions.color} `;
    }
    
    if (clothingOptions.material && clothingOptions.material !== "") {
      prompt += `${clothingOptions.material} `;
    }
    
    if (clothingOptions.type && clothingOptions.type !== "") {
      prompt += `${clothingOptions.type} `;
    } else {
      prompt += "clothing ";
    }
    
    if (clothingOptions.style && clothingOptions.style !== "") {
      prompt += `in ${clothingOptions.style} style, `;
    }
  }
  
  // Add background specification
  if (backgroundOptions && backgroundOptions.setting) {
    prompt += `${backgroundOptions.setting}, `;
  }
  
  // Add lighting and photography style
  prompt += "professional studio lighting, soft shadows, detailed fabric texture, ";
  
  // Add brand guidelines if provided
  if (brandGuidelines && brandGuidelines.trim() !== "") {
    prompt += `${brandGuidelines}, `;
  }
  
  // Add custom prompt if provided
  if (customPrompt && customPrompt.trim() !== "") {
    prompt += `${customPrompt}, `;
  }
  
  // Add final quality parameters
  prompt += "8k ultra detailed, professional color grading, sharp focus, fashion magazine quality";
  
  return prompt;
}

// Build negative prompt to avoid common fashion AI generation issues
function buildNegativePrompt() {
  return "distorted clothing, deformed body, unrealistic proportions, extra limbs, " +
    "missing limbs, floating limbs, disconnected limbs, malformed hands, extra fingers, " +
    "missing fingers, poorly drawn face, blurry, low quality, disfigured, duplicate clothing";
}

export async function POST(request) {
  try {
    // Check if we have the API key
    if (!process.env.STABILITY_API_KEY) {
      console.error("STABILITY_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: 'Missing Stability API key in environment variables' },
        { status: 500 }
      );
    }

    // Parse request data
    const requestData = await request.json();
    console.log("Received request data:", requestData);
    
    // Build enhanced fashion prompt
    const enhancedPrompt = buildFashionPrompt({
      modelOptions: requestData.modelOptions,
      clothingOptions: requestData.clothingOptions,
      backgroundOptions: requestData.backgroundOptions,
      customPrompt: requestData.customPrompt,
      brandGuidelines: requestData.brandGuidelines
    });
    
    const negativePrompt = buildNegativePrompt();
    console.log("Generated fashion prompt:", enhancedPrompt);
    
    // Create form data for the Stability API request
    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);
    formData.append('negative_prompt', negativePrompt);
    formData.append('aspect_ratio', '2:3'); // Better for fashion/model photos
    formData.append('output_format', 'webp');
    formData.append('style_preset', 'photographic');
    
    // Make sure there's a file entry (some implementations require this)
    const emptyBlob = new Blob([''], { type: 'text/plain' });
    formData.append('none', emptyBlob);
    
    // Generate the initial image
    console.log("Calling Stability API for initial image generation...");
    
    const generationResponse = await fetch('https://api.stability.ai/v2beta/stable-image/generate/ultra', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    // Handle non-200 responses
    if (!generationResponse.ok) {
      let errorMessage = `Stability API error: ${generationResponse.status}`;
      try {
        const errorData = await generationResponse.json();
        console.error('Stability API error details:', errorData);
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Parse the response data
    const generationData = await generationResponse.json();
    
    // Extract the image base64 data
    let imageBase64;
    if (generationData.artifacts && generationData.artifacts.length > 0 && generationData.artifacts[0].base64) {
      imageBase64 = generationData.artifacts[0].base64;
    } else if (generationData.image) {
      imageBase64 = generationData.image;
    } else {
      console.error("Unexpected API response structure:", generationData);
      return NextResponse.json(
        { error: 'Could not find image data in API response' },
        { status: 500 }
      );
    }
    
    // Return the model data along with the image for the background removal step
    const modelData = {
      modelOptions: requestData.modelOptions,
      clothingOptions: requestData.clothingOptions,
      backgroundOptions: requestData.backgroundOptions,
      customPrompt: requestData.customPrompt,
      brandGuidelines: requestData.brandGuidelines,
      prompt: enhancedPrompt
    };
    
    // Return the image data to the client
    return NextResponse.json({
      imageUrl: `data:image/webp;base64,${imageBase64}`,
      requiresBackgroundRemoval: requestData.backgroundOptions?.remove === true,
      modelData: modelData
    });
    
  } catch (error) {
    console.error('General error in image generation endpoint:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate image: ' + error.message },
      { status: 500 }
    );
  }
}