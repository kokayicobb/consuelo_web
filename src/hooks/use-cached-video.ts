"use client"
import { useState, useEffect } from 'react';

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
        const { width = 640, height = 360, autoplay = false, hideControls = true } = options;
        
        // Try to use the cached API routes first
        const embedParams = new URLSearchParams({
          url: loomVideoUrl,
          type: 'embed',
          preset: width <= 320 ? 'thumbnail' : width <= 640 ? 'preview' : 'full'
        });
        
        const thumbnailParams = new URLSearchParams({
          url: loomVideoUrl,
          type: 'thumbnail',
          preset: width <= 320 ? 'thumbnail' : width <= 640 ? 'preview' : 'full'
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
            embedUrl = `https://www.loom.com/embed/${videoId}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${autoplay}&hide_controls=${hideControls}`;
          }
          
          if (!thumbnailUrl) {
            thumbnailUrl = `https://cdn.loom.com/sessions/thumbnails/${videoId}-${width}x${height}.jpg`;
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
          const { width = 640, height = 360, autoplay = false, hideControls = true } = options;
          
          const thumbnail = `https://cdn.loom.com/sessions/thumbnails/${videoId}-${width}x${height}.jpg`;
          const embed = `https://www.loom.com/embed/${videoId}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${autoplay}&hide_controls=${hideControls}`;
          
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
  }, [loomVideoUrl, JSON.stringify(options)]);

  return { thumbnailUrl, embedUrl, isLoading, error };
};

export const useOptimizedLoomVideo = (
  loomVideoUrl: string,
  preset: 'thumbnail' | 'preview' | 'full' = 'preview'
) => {
  const presets: Record<string, VideoOptions> = {
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

  return useCachedLoomVideo(loomVideoUrl, presets[preset]);
};