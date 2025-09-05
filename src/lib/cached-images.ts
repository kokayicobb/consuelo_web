import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlFor } from "@/sanity/lib/image";
import { cacheGet, cacheSet } from "./redis";
import crypto from "crypto";

interface CacheOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'pjpg';
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
  expires?: number; // Cache expiration in seconds (default: 1 hour)
}

const generateCacheKey = (source: SanityImageSource, options: CacheOptions = {}): string => {
  const sourceString = typeof source === 'string' ? source : JSON.stringify(source);
  const optionsString = JSON.stringify(options);
  const combined = `${sourceString}_${optionsString}`;
  return `img_cache_${crypto.createHash('md5').update(combined).digest('hex')}`;
};

export const getCachedImageUrl = async (
  source: SanityImageSource, 
  options: CacheOptions = {}
): Promise<string> => {
  if (!source) return '';

  const cacheKey = generateCacheKey(source, options);
  
  // Try to get from cache first
  const cachedUrl = await cacheGet(cacheKey);
  if (cachedUrl) {
    return cachedUrl;
  }

  // Generate the URL using Sanity's image builder
  let imageBuilder = urlFor(source);

  // Apply transformations
  if (options.width) imageBuilder = imageBuilder.width(options.width);
  if (options.height) imageBuilder = imageBuilder.height(options.height);
  if (options.quality) imageBuilder = imageBuilder.quality(options.quality);
  if (options.format) imageBuilder = imageBuilder.format(options.format);
  if (options.fit) imageBuilder = imageBuilder.fit(options.fit);

  const imageUrl = imageBuilder.url();

  // Cache the result
  const expireInSeconds = options.expires || 3600; // 1 hour default
  await cacheSet(cacheKey, imageUrl, expireInSeconds);

  return imageUrl;
};

// Optimized presets for common use cases
export const getOptimizedImageUrl = async (
  source: SanityImageSource, 
  preset: 'thumbnail' | 'hero' | 'feature' | 'full' = 'full'
): Promise<string> => {
  const presets: Record<string, CacheOptions> = {
    thumbnail: { 
      width: 300, 
      height: 200, 
      quality: 80, 
      format: 'webp', 
      fit: 'crop',
      expires: 7200 // 2 hours
    },
    hero: { 
      width: 1200, 
      height: 600, 
      quality: 90, 
      format: 'webp', 
      fit: 'crop',
      expires: 3600 // 1 hour
    },
    feature: { 
      width: 800, 
      height: 400, 
      quality: 85, 
      format: 'webp', 
      fit: 'crop',
      expires: 7200 // 2 hours
    },
    full: { 
      quality: 85, 
      format: 'webp',
      expires: 86400 // 24 hours
    }
  };

  return getCachedImageUrl(source, presets[preset]);
};

// Function to warm up cache for critical images
export const warmImageCache = async (sources: Array<{ source: SanityImageSource, preset?: 'thumbnail' | 'hero' | 'feature' | 'full' }>): Promise<void> => {
  const promises = sources.map(({ source, preset = 'full' }) => 
    getOptimizedImageUrl(source, preset)
  );

  try {
    await Promise.all(promises);
  } catch (error) {
    console.warn('Failed to warm image cache:', error);
  }
};

// Fallback function that works without Redis
interface FallbackOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'pjpg';
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
}

export const getImageUrlFallback = (source: SanityImageSource, options: FallbackOptions = {}): string => {
  if (!source) return '';

  let imageBuilder = urlFor(source);

  if (options.width) imageBuilder = imageBuilder.width(options.width);
  if (options.height) imageBuilder = imageBuilder.height(options.height);
  if (options.quality) imageBuilder = imageBuilder.quality(options.quality);
  if (options.format) imageBuilder = imageBuilder.format(options.format);
  if (options.fit) imageBuilder = imageBuilder.fit(options.fit);

  return imageBuilder.url();
};