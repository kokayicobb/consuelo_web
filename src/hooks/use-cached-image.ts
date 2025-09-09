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
    setError(null);

    // Generate URL immediately for instant loading
    try {
      const url = generateImageUrl(source, options);
      if (isMounted) {
        setImageUrl(url);
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