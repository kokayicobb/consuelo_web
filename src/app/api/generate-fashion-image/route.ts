// app/api/generate-fashion-image/route.js (Next.js App Router)
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Helper function to save generated images to Supabase
async function saveImagesToSupabase(originalImage, transparentImage, requestData, prompt) {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials not found.");
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Convert base64 images to files for storage
    const originalImageFile = base64ToFile(originalImage, 'original.webp', 'image/webp');
    
    // Generate a unique path for the images
    const timestamp = new Date().getTime();
    const randomId = Math.random().toString(36).substring(2, 10);
    const basePath = `fashion_models/${timestamp}_${randomId}`;
    
    // Upload original image to Supabase Storage
    const { data: originalData, error: originalError } = await supabase.storage
      .from('generated-images')
      .upload(`${basePath}/original.webp`, originalImageFile, {
        contentType: 'image/webp',
        upsert: false
      });
      
    if (originalError) {
      console.error("Error saving original image to Supabase:", originalError);
      return null;
    }
    
    // Get public URL for original image
    const { data: originalPublicData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(`${basePath}/original.webp`);
      
    let transparentPublicData = null;
    
    // Upload transparent image if it exists
    if (transparentImage) {
      const transparentImageFile = base64ToFile(transparentImage, 'transparent.png', 'image/png');
      
      const { data: transparentData, error: transparentError } = await supabase.storage
        .from('generated-images')
        .upload(`${basePath}/transparent.png`, transparentImageFile, {
          contentType: 'image/png',
          upsert: false
        });
        
      if (transparentError) {
        console.error("Error saving transparent image to Supabase:", transparentError);
      } else {
        transparentPublicData = supabase.storage
          .from('generated-images')
          .getPublicUrl(`${basePath}/transparent.png`);
      }
    }
    
    // Store metadata in Supabase Database
    const { data: metadataData, error: metadataError }: { data: { id: number; }[]; error?: any } = await supabase
      .from('generated_fashion_images')
      .insert({
        original_image_url: originalPublicData?.publicUrl,
        transparent_image_url: transparentPublicData?.data?.publicUrl || null,
        model_options: requestData.modelOptions,
        clothing_options: requestData.clothingOptions,
        background_options: requestData.backgroundOptions,
        custom_prompt: requestData.customPrompt,
        brand_guidelines: requestData.brandGuidelines,
        full_prompt: prompt,
        created_at: new Date().toISOString()
      }) as { data: { id: number }[] };
      
    if (metadataError) {
      console.error("Error saving metadata to Supabase:", metadataError);
    }
    
    return {
      originalUrl: originalPublicData?.publicUrl,
      transparentUrl: transparentPublicData?.data?.publicUrl || null,
      recordId: metadataData ? metadataData[0]?.id : null
    };
    
  } catch (error) {
    console.error("Error in Supabase storage process:", error);
    return null;
  }
}

// Helper function to convert base64 to File
function base64ToFile(base64String, filename, mimeType) {
  // Remove the data URL prefix if it exists
  const base64Data = base64String.includes(',') 
    ? base64String.split(',')[1] 
    : base64String;
    
  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create a Blob from the bytes
  return new Blob([bytes], { type: mimeType });
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
    
    let transparentImageBase64 = null;
    
    // If background removal is requested, process it
    if (requestData.backgroundOptions && requestData.backgroundOptions.remove === true) {
      // Background removal for transparent version
      console.log("Removing background...");
      
      try {
        // Convert base64 to Blob for the API request
        const binaryString = atob(imageBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const imageBlob = new Blob([bytes], { type: 'image/webp' });
        
        // Create FormData for background removal request
        const bgRemovalFormData = new FormData();
        bgRemovalFormData.append('image', imageBlob, 'image.webp');
        bgRemovalFormData.append('output_format', 'png'); // PNG for transparency
        
        const bgRemovalResponse = await fetch('https://api.stability.ai/v2beta/stable-image/edit/remove-background', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            'Accept': 'application/json'
          },
          body: bgRemovalFormData
        });
        
        if (!bgRemovalResponse.ok) {
          console.error('Background removal API error:', bgRemovalResponse.status);
          // If background removal fails, we'll just continue without it
        } else {
          const bgRemovalData = await bgRemovalResponse.json();
          
          // Extract the transparent image data
          if (bgRemovalData.artifacts && bgRemovalData.artifacts.length > 0 && bgRemovalData.artifacts[0].base64) {
            transparentImageBase64 = bgRemovalData.artifacts[0].base64;
          } else if (bgRemovalData.image) {
            transparentImageBase64 = bgRemovalData.image;
          } else {
            console.error("Unexpected background removal API response:", bgRemovalData);
          }
        }
      } catch (backgroundError) {
        console.error("Error in background removal process:", backgroundError);
        // If background removal process fails, we'll just continue without it
      }
    }
    
    // Save images to Supabase (async, don't wait for completion)
    saveImagesToSupabase(
      imageBase64, 
      transparentImageBase64, 
      requestData, 
      enhancedPrompt
    ).catch(error => {
      console.error("Error saving to Supabase:", error);
    });
    
    // Return the image data to the client
    return NextResponse.json({
      imageUrl: `data:image/webp;base64,${imageBase64}`,
      transparentImageUrl: transparentImageBase64 ? `data:image/png;base64,${transparentImageBase64}` : null
    });
    
  } catch (error) {
    console.error('General error in image generation endpoint:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate image: ' + error.message },
      { status: 500 }
    );
  }
}