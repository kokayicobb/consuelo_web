import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

// Helper function to get video file URLs from Sanity
export const getVideoUrl = (videoFile: any) => {
  if (!videoFile?.asset) return null;
  
  // For uploaded files, construct the URL using Sanity's CDN
  if (videoFile.asset._ref) {
    // Parse the asset reference to get the file ID and extension
    const [, id, extension] = videoFile.asset._ref.match(/file-(.+)-(.+)$/) || [];
    if (id && extension) {
      return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${extension}`;
    }
  }
  
  // Fallback to direct URL if available
  return videoFile.asset.url || null;
}

// Note: Cached image functions are available in @/lib/cached-images
// They are not re-exported here to avoid client-side bundling issues with Redis
