import React from 'react';
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { useOptimizedImage } from '@/hooks/use-cached-image';

interface CachedImageProps {
  source: SanityImageSource;
  alt: string;
  preset?: 'thumbnail' | 'hero' | 'feature' | 'full';
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  alt,
  preset = 'full',
  className,
  loading = 'lazy',
  sizes,
  onLoad,
  onError
}) => {
  const { imageUrl, isLoading, error } = useOptimizedImage(source, preset);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className || ''}`}>
        <div className="w-full h-full bg-gray-300 rounded" />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className || ''}`}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading={loading}
      sizes={sizes}
      onLoad={onLoad}
    />
  );
};