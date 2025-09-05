interface VideoOptions {
  width?: number;
  height?: number;
  autoplay?: boolean;
  hideControls?: boolean;
}

// Client-safe video URL generation (no Redis or API dependencies)
export const generateLoomUrls = (loomVideoUrl: string, options: VideoOptions = {}) => {
  if (!loomVideoUrl) return { embedUrl: '', thumbnailUrl: '' };

  // Extract Loom video ID
  const match = loomVideoUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (!match) return { embedUrl: '', thumbnailUrl: '' };

  const videoId = match[1];
  const { width = 640, height = 360, autoplay = false, hideControls = true } = options;

  const embedUrl = `https://www.loom.com/embed/${videoId}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${autoplay}&hide_controls=${hideControls}`;
  const thumbnailUrl = `https://cdn.loom.com/sessions/thumbnails/${videoId}-${width}x${height}.jpg`;

  return { embedUrl, thumbnailUrl };
};