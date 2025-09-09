import { NextRequest, NextResponse } from 'next/server';
import { getLoomVideoThumbnail, getCachedLoomEmbedUrl } from '@/lib/cached-videos';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');
    const preset = searchParams.get('preset') as 'thumbnail' | 'preview' | 'full' || 'preview';
    const type = searchParams.get('type') as 'embed' | 'thumbnail' || 'embed';
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    const presets = {
      thumbnail: { 
        width: 320, 
        height: 180, 
        hideControls: true,
        autoplay: false
      },
      preview: { 
        width: 640, 
        height: 360, 
        hideControls: true,
        autoplay: false
      },
      full: { 
        width: 1280, 
        height: 720, 
        hideControls: false,
        autoplay: false
      }
    };

    const options = presets[preset];
    let result: string | null;

    try {
      if (type === 'thumbnail') {
        result = await getLoomVideoThumbnail(videoUrl, {
          width: options.width,
          height: options.height,
          expires: 7200
        });
      } else {
        result = await getCachedLoomEmbedUrl(videoUrl, {
          autoplay: options.autoplay,
          hideControls: options.hideControls,
          expires: 86400
        });
      }
    } catch (error) {
      console.warn('Video cache failed, generating direct URLs:', error);
      
      // Fallback to direct URL generation
      const match = videoUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
      if (!match) {
        return NextResponse.json({ error: 'Invalid Loom video URL' }, { status: 400 });
      }

      const videoId = match[1];
      if (type === 'thumbnail') {
        result = `https://cdn.loom.com/sessions/thumbnails/${videoId}-${options.width}x${options.height}.jpg`;
      } else {
        result = `https://www.loom.com/embed/${videoId}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${options.autoplay}&hide_controls=${options.hideControls}`;
      }
    }
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to generate video URL' }, { status: 500 });
    }

    const responseKey = type === 'thumbnail' ? 'thumbnailUrl' : 'embedUrl';
    
    return NextResponse.json({ [responseKey]: result }, {
      headers: {
        'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Cached video API error:', error);
    return NextResponse.json({ error: 'Failed to process video request' }, { status: 500 });
  }
}