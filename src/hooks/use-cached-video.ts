"use client"
import { useState, useEffect, useMemo, useRef } from 'react';

interface VideoOptions {
  width?: number;
  height?: number;
  quality?: number;
  autoplay?: boolean;
  hideControls?: boolean;
}

export const useCachedLoomVideo = (loomVideoUrl: string, options: VideoOptions = {}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Extract individual option values to avoid object reference issues
  const { width, height, quality, autoplay, hideControls } = options;

  useEffect(() => {
    if (!loomVideoUrl) {
      setThumbnailUrl('');
      setEmbedUrl('');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadVideoData = async () => {
      try {
        const w = width || 640;
        const h = height || 360;
        const play = autoplay || false;
        const hideCtrl = hideControls === undefined ? true : hideControls;
        
        // Try to use the cached API routes first
        const embedParams = new URLSearchParams({
          url: loomVideoUrl,
          type: 'embed',
          preset: w <= 320 ? 'thumbnail' : w <= 640 ? 'preview' : 'full'
        });
        
        const thumbnailParams = new URLSearchParams({
          url: loomVideoUrl,
          type: 'thumbnail',
          preset: w <= 320 ? 'thumbnail' : w <= 640 ? 'preview' : 'full'
        });

        const [embedResponse, thumbnailResponse] = await Promise.all([
          fetch(`/api/cached-video?${embedParams}`),
          fetch(`/api/cached-video?${thumbnailParams}`)
        ]);

        let embedUrl = '';
        let thumbnailUrl = '';

        if (embedResponse.ok) {
          const embedData = await embedResponse.json();
          embedUrl = embedData.embedUrl || '';
        }

        if (thumbnailResponse.ok) {
          const thumbnailData = await thumbnailResponse.json();
          thumbnailUrl = thumbnailData.thumbnailUrl || '';
        }

        // Fallback to direct URL generation if API failed
        if (!embedUrl || !thumbnailUrl) {
          const match = loomVideoUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
          if (!match) {
            throw new Error('Invalid Loom video URL');
          }

          const videoId = match[1];
          
          if (!embedUrl) {
            embedUrl = `https://www.loom.com/embed/${videoId}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${play}&hide_controls=${hideCtrl}`;
          }
          
          if (!thumbnailUrl) {
            thumbnailUrl = `https://cdn.loom.com/sessions/thumbnails/${videoId}-${w}x${h}.jpg`;
          }
        }
        
        if (isMounted) {
          setThumbnailUrl(thumbnailUrl);
          setEmbedUrl(embedUrl);
          setIsLoading(false);
        }
      } catch (err) {
        // Final fallback to direct URL generation
        try {
          const match = loomVideoUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
          if (!match) {
            throw new Error('Invalid Loom video URL');
          }

          const videoId = match[1];
          const w = width || 640;
          const h = height || 360;
          const play = autoplay || false;
          const hideCtrl = hideControls === undefined ? true : hideControls;
          
          const thumbnail = `https://cdn.loom.com/sessions/thumbnails/${videoId}-${w}x${h}.jpg`;
          const embed = `https://www.loom.com/embed/${videoId}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${play}&hide_controls=${hideCtrl}`;
          
          if (isMounted) {
            setThumbnailUrl(thumbnail);
            setEmbedUrl(embed);
            setIsLoading(false);
          }
        } catch (fallbackErr) {
          if (isMounted) {
            setError(fallbackErr as Error);
            setIsLoading(false);
          }
        }
      }
    };

    loadVideoData();

    return () => {
      isMounted = false;
    };
  }, [loomVideoUrl, width, height, autoplay, hideControls]);

  return { thumbnailUrl, embedUrl, isLoading, error };
};

// Define presets outside of the component to avoid recreating on every render
const VIDEO_PRESETS: Record<string, VideoOptions> = {
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

export const useOptimizedLoomVideo = (
  loomVideoUrl: string,
  preset: 'thumbnail' | 'preview' | 'full' = 'preview'
) => {
  return useCachedLoomVideo(loomVideoUrl, VIDEO_PRESETS[preset]);
};