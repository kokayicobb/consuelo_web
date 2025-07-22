// app/api/generate-fashion-image/route.js

import { NextResponse } from 'next/server';
export const runtime = 'edge';

// Helper function to build marketing-optimized prompt
function buildMarketingPrompt(options) {
  const { 
    modelOptions, 
    clothingOptions, 
    backgroundOptions, 
    customPrompt, 
    brandGuidelines,
    marketingOptions,
    selectedPlatforms,
    campaignType,
    marketingStyle 
  } = options;
  
  // Base prompt for social media marketing
 let prompt = "Film photography, analog aesthetic, natural candid moment, real person, ";
  
  // Add platform-specific optimization
  if (selectedPlatforms && selectedPlatforms.length > 0) {
    if (selectedPlatforms.includes('instagram') || selectedPlatforms.includes('instagram-story')) {
      prompt += "Instagram-worthy aesthetic, highly engaging visual, ";
    }
    if (selectedPlatforms.includes('linkedin')) {
      prompt += "professional business context, corporate polish, ";
    }
    if (selectedPlatforms.includes('tiktok')) {
      prompt += "Gen-Z appeal, trending style, dynamic energy, ";
    }
  }
  
  // Marketing style application
  if (marketingStyle) {
    switch(marketingStyle) {
      case 'authentic':
        prompt += "authentic and relatable vibe, real people energy, genuine emotion, ";
        break;
      case 'aspirational':
        prompt += "aspirational lifestyle, premium quality, luxury feel, ";
        break;
      case 'minimalist':
        prompt += "clean minimalist aesthetic, negative space, sophisticated simplicity, ";
        break;
      case 'bold':
        prompt += "bold eye-catching composition, vibrant colors, high impact visual, ";
        break;
      case 'storytelling':
        prompt += "narrative-driven scene, emotional connection, story elements, ";
        break;
      case 'ugc':
        prompt += "user-generated content style, authentic casual feel, smartphone aesthetic, ";
        break;
    }
  }
  // Add film/analog style for natural look
  prompt += "shot on film camera, kodak portra, natural grain, authentic lighting, ";
  prompt += "candid photography style, real skin texture, natural imperfections, ";
  
  // Model specifications for marketing
  // Model specifications for marketing
if (modelOptions) {
  // Only add basic model info if there's no detailed custom prompt
  if (!customPrompt || customPrompt.trim() === "") {
    prompt += `${modelOptions.gender} model`;
    
    if (modelOptions.age) {
      prompt += ` age ${modelOptions.age}`;
    }
    
    prompt += ", full body shot, head to toe composition, complete figure visible, ";
    
    if (modelOptions.ethnicity && modelOptions.ethnicity !== "diverse") {
      prompt += `, ${modelOptions.ethnicity} ethnicity`;
    } else {
      prompt += ", diverse representation";
    }
    
    if (modelOptions.expression) {
      prompt += `, ${modelOptions.expression}`;
    }
    
    if (modelOptions.pose) {
      prompt += `, ${modelOptions.pose} pose`;
    }
    
    prompt += ", ";
  }
}
  
  // Clothing with marketing focus
  if (clothingOptions && clothingOptions.type) {
    prompt += "wearing ";
    
    if (clothingOptions.brand) {
      prompt += `${clothingOptions.brand} branded `;
    }
    
    if (clothingOptions.season) {
      prompt += `${clothingOptions.season} `;
    }
    
    if (clothingOptions.color) {
      prompt += `${clothingOptions.color} `;
    }
    
    prompt += `${clothingOptions.type}`;
    
    if (clothingOptions.style) {
      prompt += ` in ${clothingOptions.style} style`;
    }
    
    prompt += ", product clearly visible and appealing, ";
  }
  
  // Background and environment for marketing
  if (backgroundOptions) {
    if (backgroundOptions.setting) {
      prompt += `${backgroundOptions.setting}, `;
    }
    
    if (backgroundOptions.mood) {
      prompt += `${backgroundOptions.mood} lighting and atmosphere, `;
    }
  }
  
  // Campaign-specific elements
  if (campaignType) {
    switch(campaignType) {
      case 'product-launch':
        prompt += "new product reveal excitement, fresh and innovative feel, ";
        break;
      case 'seasonal':
        prompt += "seasonal campaign mood, timely and relevant, ";
        break;
      case 'brand-awareness':
        prompt += "strong brand presence, memorable visual impact, ";
        break;
      case 'user-generated':
        prompt += "authentic user-generated style, relatable and real, ";
        break;
      case 'influencer':
        prompt += "influencer marketing aesthetic, aspirational yet approachable, ";
        break;
      case 'sale-promotion':
        prompt += "promotional energy, urgency and excitement, ";
        break;
    }
  }
  
  // Marketing-specific requirements
  prompt += "scroll-stopping visual impact, thumb-stopping content, ";
  prompt += "optimized for social media engagement, shareable and memorable, ";
  prompt += "current trends and viral aesthetics, ";
  
  // Target audience optimization
  if (marketingOptions?.targetAudience) {
    prompt += `appealing to ${marketingOptions.targetAudience}, `;
  }
  
  // Brand tone
  if (marketingOptions?.brandTone) {
    prompt += `${marketingOptions.brandTone} brand personality, `;
  }
  
  // Brand guidelines
  if (brandGuidelines && brandGuidelines.trim() !== "") {
    prompt += `${brandGuidelines}, `;
  }
  
  // Custom prompt takes priority - add early and clean
if (customPrompt && customPrompt.trim() !== "") {
  // Clean the custom prompt and prioritize it
  const cleanCustomPrompt = customPrompt.replace(/"/g, '').trim();
  prompt = `${cleanCustomPrompt}, ${prompt}`;
}
  
  // Technical quality for marketing
  if (!customPrompt || customPrompt.trim() === "") {
  prompt += "professional photography, natural lighting, sharp focus";
}
  return prompt;
}

// Build negative prompt for marketing content
function buildMarketingNegativePrompt() {
  return "artificial looking, over-processed, digital painting, 3d render, cgi, " +
    "plastic skin, perfect skin, too smooth, airbrushed, fake looking, " +
    "overly saturated, HDR effect, digital art style, cartoon, anime, " +
    "cropped body, close-up only, headshot, partial figure, cut off limbs, " +
    "studio lighting, ring light, harsh shadows, over-lit";
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
    console.log("Received marketing request data:", requestData);
    
    // Build marketing-optimized prompt
    const marketingPrompt = buildMarketingPrompt({
      modelOptions: requestData.modelOptions,
      clothingOptions: requestData.clothingOptions,
      backgroundOptions: requestData.backgroundOptions,
      customPrompt: requestData.customPrompt,
      brandGuidelines: requestData.brandGuidelines,
      marketingOptions: requestData.marketingOptions,
      selectedPlatforms: requestData.selectedPlatforms,
      campaignType: requestData.campaignType,
      marketingStyle: requestData.marketingStyle
    });
    
    const negativePrompt = buildMarketingNegativePrompt();
    console.log("Generated marketing prompt:", marketingPrompt);
    
    // Determine aspect ratio based on primary platform
    let aspectRatio = '1:1'; // Default for Instagram
    if (requestData.selectedPlatforms && requestData.selectedPlatforms.length > 0) {
      const primaryPlatform = requestData.selectedPlatforms[0];
      switch(primaryPlatform) {
        case 'instagram-story':
        case 'tiktok':
          aspectRatio = '9:16';
          break;
        case 'facebook':
        case 'linkedin':
          aspectRatio = '16:9';
          break;
        case 'twitter':
          aspectRatio = '16:9';
          break;
        default:
          aspectRatio = '1:1';
      }
    }
    
    // Create form data for the Stability API request
    const formData = new FormData();
    formData.append('prompt', marketingPrompt);
    formData.append('negative_prompt', negativePrompt);
    formData.append('aspect_ratio', aspectRatio);
    formData.append('output_format', 'webp');
    formData.append('style_preset', 'analog-film');
    
    // Add empty blob (required by some implementations)
    const emptyBlob = new Blob([''], { type: 'text/plain' });
    formData.append('none', emptyBlob);
    
    // Generate the initial image
    console.log("Calling Stability API for marketing content generation...");
    
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
    
    // Return the model data along with the image
    const modelData = {
      modelOptions: requestData.modelOptions,
      clothingOptions: requestData.clothingOptions,
      backgroundOptions: requestData.backgroundOptions,
      customPrompt: requestData.customPrompt,
      brandGuidelines: requestData.brandGuidelines,
      marketingOptions: requestData.marketingOptions,
      selectedPlatforms: requestData.selectedPlatforms,
      campaignType: requestData.campaignType,
      marketingStyle: requestData.marketingStyle,
      prompt: marketingPrompt,
      aspectRatio: aspectRatio
    };
    
    // Return the image data to the client
    return NextResponse.json({
      imageUrl: `data:image/webp;base64,${imageBase64}`,
      requiresBackgroundRemoval: requestData.backgroundOptions?.remove === true,
      modelData: modelData,
      prompt: marketingPrompt
    });
    
  } catch (error) {
    console.error('General error in marketing image generation  endpoint:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate marketing content: ' + error.message },
      { status: 500 }
    );
  }
}