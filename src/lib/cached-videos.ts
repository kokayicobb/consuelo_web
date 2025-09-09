import { cacheGet, cacheSet } from "./redis";
import crypto from "crypto";

interface VideoThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  expires?: number; // Cache expiration in seconds
}

const generateVideoCacheKey = (videoUrl: string, options: VideoThumbnailOptions = {}): string => {
  const combined = `${videoUrl}_${JSON.stringify(options)}`;
  return `video_cache_${crypto.createHash('md5').update(combined).digest('hex')}`;
};

export const getLoomVideoThumbnail = async (
  loomVideoUrl: string,
  options: VideoThumbnailOptions = {}
): Promise<string | null> => {
  if (!loomVideoUrl) return null;

  // Extract Loom video ID
  const match = loomVideoUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (!match) return null;

  const videoId = match[1];
  const cacheKey = generateVideoCacheKey(loomVideoUrl, options);
  
  // Try to get from cache first
  const cachedThumbnail = await cacheGet(cacheKey);
  if (cachedThumbnail) {
    return cachedThumbnail;
  }

  // Generate Loom thumbnail URL
  const { width = 640, height = 360 } = options;
  const thumbnailUrl = `https://cdn.loom.com/sessions/thumbnails/${videoId}-${width}x${height}.jpg`;

  // Cache the result
  const expireInSeconds = options.expires || 7200; // 2 hours default
  await cacheSet(cacheKey, thumbnailUrl, expireInSeconds);

  return thumbnailUrl;
};

export const getCachedLoomEmbedUrl = async (
  loomVideoUrl: string,
  options: { autoplay?: boolean; hideControls?: boolean; expires?: number } = {}
): Promise<string | null> => {
  if (!loomVideoUrl) return null;

  // Extract Loom video ID
  const match = loomVideoUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (!match) return null;

  const videoId = match[1];
  const cacheKey = generateVideoCacheKey(`embed_${loomVideoUrl}`, options);
  
  // Try to get from cache first
  const cachedEmbedUrl = await cacheGet(cacheKey);
  if (cachedEmbedUrl) {
    return cachedEmbedUrl;
  }

  // Generate Loom embed URL with options
  const { autoplay = false, hideControls = true } = options;
  const embedUrl = `https://www.loom.com/embed/${videoId}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${autoplay}&hide_controls=${hideControls}`;

  // Cache the result
  const expireInSeconds = options.expires || 86400; // 24 hours default
  await cacheSet(cacheKey, embedUrl, expireInSeconds);

  return embedUrl;
};

// Warm up cache for critical videos
export const warmVideoCache = async (
  videoUrls: Array<{ url: string; options?: VideoThumbnailOptions }>
): Promise<void> => {
  const promises = videoUrls.map(({ url, options = {} }) => 
    Promise.all([
      getLoomVideoThumbnail(url, options),
      getCachedLoomEmbedUrl(url, { expires: options.expires })
    ])
  );

  try {
    await Promise.all(promises);
  } catch (error) {
    console.warn('Failed to warm video cache:', error);
  }
};