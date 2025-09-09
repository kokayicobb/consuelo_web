import { warmImageCache } from './cached-images';

interface Feature {
  _id: string;
  title: string;
  description: string;
  image?: any;
  imagePath?: string;
  slug: { current: string };
  isHero: boolean;
  gradientFrom: string;
  gradientTo: string;
  order: number;
}

export const warmFeatureImagesCache = async (features: Feature[]) => {
  const imagesToWarm = features
    .filter(feature => feature.image)
    .map(feature => ({
      source: feature.image,
      preset: feature.isHero ? 'hero' as const : 'feature' as const
    }));

  if (imagesToWarm.length > 0) {
    try {
      await warmImageCache(imagesToWarm);
      console.log(`Warmed cache for ${imagesToWarm.length} feature images`);
    } catch (error) {
      console.warn('Failed to warm feature images cache:', error);
    }
  }
};

export const scheduleImageCacheWarming = (features: Feature[]) => {
  // Warm cache in the background without blocking the UI
  if (typeof window === 'undefined') { // Only on server side
    setTimeout(() => {
      warmFeatureImagesCache(features);
    }, 100);
  }
};