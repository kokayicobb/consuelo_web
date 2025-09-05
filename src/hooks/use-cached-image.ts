"use client"
import { useState, useEffect } from 'react';
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { generateImageUrl } from '@/lib/client-image-utils';

interface CacheOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'pjpg';
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
}

export const useCachedImage = (source: SanityImageSource, options: CacheOptions = {}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!source) {
      setImageUrl('');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadImage = async () => {
      try {
        // Try to use the cached API route first
        const encodedSource = encodeURIComponent(JSON.stringify(source));
        const params = new URLSearchParams({
          ref: encodedSource,
          ...(options.width && { width: options.width.toString() }),
          ...(options.height && { height: options.height.toString() }),
          ...(options.quality && { quality: options.quality.toString() }),
          ...(options.format && { format: options.format }),
          ...(options.fit && { fit: options.fit }),
        });

        const response = await fetch(`/api/cached-image?${params}`);
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.imageUrl) {
            setImageUrl(data.imageUrl);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to direct image generation
        const url = generateImageUrl(source, options);
        
        if (isMounted) {
          setImageUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        // On error, fallback to direct generation
        try {
          const url = generateImageUrl(source, options);
          if (isMounted) {
            setImageUrl(url);
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

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [source, JSON.stringify(options)]);

  return { imageUrl, isLoading, error };
};

export const useOptimizedImage = (
  source: SanityImageSource, 
  preset: 'thumbnail' | 'hero' | 'feature' | 'full' = 'full'
) => {
  const presets: Record<string, CacheOptions> = {
    thumbnail: { 
      width: 300, 
      height: 200, 
      quality: 80, 
      format: 'webp', 
      fit: 'crop'
    },
    hero: { 
      width: 1200, 
      height: 600, 
      quality: 90, 
      format: 'webp', 
      fit: 'crop'
    },
    feature: { 
      width: 800, 
      height: 400, 
      quality: 85, 
      format: 'webp', 
      fit: 'crop'
    },
    full: { 
      quality: 85, 
      format: 'webp'
    }
  };

  return useCachedImage(source, presets[preset]);
};