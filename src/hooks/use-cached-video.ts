"use client"
import { useState, useEffect } from 'react';
import { generateLoomUrls } from '@/lib/client-video-utils';

interface VideoOptions {
  width?: number;
  height?: number;
  autoplay?: boolean;
  hideControls?: boolean;
}

export const useCachedLoomVideo = (loomVideoUrl: string, options: VideoOptions = {}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!loomVideoUrl) {
      setThumbnailUrl('');
      setEmbedUrl('');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setError(null);

    // Generate URLs immediately for instant loading
    try {
      const { embedUrl, thumbnailUrl } = generateLoomUrls(loomVideoUrl, options);
      if (isMounted) {
        setEmbedUrl(embedUrl);
        setThumbnailUrl(thumbnailUrl);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMounted) {
        setError(err as Error);
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [loomVideoUrl, JSON.stringify(options)]);

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