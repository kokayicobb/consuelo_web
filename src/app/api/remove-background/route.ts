// app/api/remove-background/route.js
// This handles the background removal as a separate API call
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'edge';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
    
    if (!requestData.imageBase64) {
      return NextResponse.json(
        { error: 'Missing image data' },
        { status: 400 }
      );
    }
    
    const imageBase64 = requestData.imageBase64;
    
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
        return NextResponse.json(
          { error: `Background removal failed: ${bgRemovalResponse.status}` },
          { status: 500 }
        );
      }
      
      const bgRemovalData = await bgRemovalResponse.json();
      
      // Extract the transparent image data
      let transparentImageBase64;
      if (bgRemovalData.artifacts && bgRemovalData.artifacts.length > 0 && bgRemovalData.artifacts[0].base64) {
        transparentImageBase64 = bgRemovalData.artifacts[0].base64;
      } else if (bgRemovalData.image) {
        transparentImageBase64 = bgRemovalData.image;
      } else {
        console.error("Unexpected background removal API response:", bgRemovalData);
        return NextResponse.json(
          { error: 'Failed to extract transparent image from API response' },
          { status: 500 }
        );
      }
      
      // If we have model data from the first endpoint, save to Supabase (non-blocking)
      if (requestData.modelData && supabaseUrl && supabaseServiceKey) {
        // No need to await this - it will run in the background
        saveImagesToSupabase(
          imageBase64,
          transparentImageBase64,
          requestData.modelData
        ).catch(error => {
          console.error("Error saving to Supabase:", error);
        });
      }
      
      // Return the transparent image to the client
      return NextResponse.json({
        transparentImageUrl: `data:image/png;base64,${transparentImageBase64}`
      });
      
    } catch (error) {
      console.error("Error in background removal process:", error);
      return NextResponse.json(
        { error: 'Background removal failed: ' + error.message },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('General error in background removal endpoint:', error);
    
    return NextResponse.json(
      { error: 'Failed to remove background: ' + error.message },
      { status: 500 }
    );
  }
}

// Helper function to save generated images to Supabase
async function saveImagesToSupabase(originalImage, transparentImage, modelData) {
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
        const publicUrlResponse = supabase.storage
          .from('generated-images')
          .getPublicUrl(`${basePath}/transparent.png`);
          
        transparentPublicData = publicUrlResponse.data || null;
      }
    }
    
    // Store metadata in Supabase Database
    const { error: metadataError } = await supabase
      .from('generated_fashion_images')
      .insert({
        original_image_url: originalPublicData?.publicUrl || null,
        transparent_image_url: transparentPublicData?.publicUrl || null,
        model_options: modelData.modelOptions || {},
        clothing_options: modelData.clothingOptions || {},
        background_options: modelData.backgroundOptions || {},
        custom_prompt: modelData.customPrompt || "",
        brand_guidelines: modelData.brandGuidelines || "",
        full_prompt: modelData.prompt || "",
        created_at: new Date().toISOString()
      });
      
    if (metadataError) {
      console.error("Error saving metadata to Supabase:", metadataError);
    }
    
    return {
      originalUrl: originalPublicData?.publicUrl || null,
      transparentUrl: transparentPublicData?.publicUrl || null
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