import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlFor } from "@/sanity/lib/image";

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'pjpg';
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
}

// Client-safe image URL generation (no Redis dependencies)
export const generateImageUrl = (source: SanityImageSource, options: ImageOptions = {}): string => {
  if (!source) return '';

  let imageBuilder = urlFor(source);

  if (options.width) imageBuilder = imageBuilder.width(options.width);
  if (options.height) imageBuilder = imageBuilder.height(options.height);
  if (options.quality) imageBuilder = imageBuilder.quality(options.quality);
  if (options.format) imageBuilder = imageBuilder.format(options.format);
  if (options.fit) imageBuilder = imageBuilder.fit(options.fit);

  return imageBuilder.url();
};