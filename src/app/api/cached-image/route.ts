import { NextRequest, NextResponse } from 'next/server';
import { getCachedImageUrl, getImageUrlFallback } from '@/lib/cached-images';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageRef = searchParams.get('ref');
    const width = searchParams.get('width');
    const height = searchParams.get('height');
    const quality = searchParams.get('quality');
    const format = searchParams.get('format');
    const fit = searchParams.get('fit');
    const preset = searchParams.get('preset') as 'thumbnail' | 'hero' | 'feature' | 'full' | null;

    if (!imageRef) {
      return NextResponse.json({ error: 'Image reference is required' }, { status: 400 });
    }

    // Parse the image reference (could be a Sanity asset reference)
    let imageSource;
    try {
      imageSource = JSON.parse(decodeURIComponent(imageRef));
    } catch {
      imageSource = imageRef; // fallback to string reference
    }

    const options = {
      ...(width && { width: parseInt(width) }),
      ...(height && { height: parseInt(height) }),
      ...(quality && { quality: parseInt(quality) }),
      ...(format && { format: format as any }),
      ...(fit && { fit: fit as any }),
    };

    let imageUrl: string;

    try {
      // Try to get cached URL (with Redis)
      if (preset) {
        const { getOptimizedImageUrl } = await import('@/lib/cached-images');
        imageUrl = await getOptimizedImageUrl(imageSource, preset);
      } else {
        imageUrl = await getCachedImageUrl(imageSource, options);
      }
    } catch (error) {
      console.warn('Cache failed, using fallback:', error);
      // Fallback to direct image generation
      imageUrl = getImageUrlFallback(imageSource, options);
    }

    return NextResponse.json({ imageUrl }, { 
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Error in cached-image API:', error);
    return NextResponse.json(
      { error: 'Failed to process image request' }, 
      { status: 500 }
    );
  }
}