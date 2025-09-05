# Video Embedding Guide - Loom, YouTube, Vimeo

## 🎬 Overview
This guide shows how to add video support to your Sanity CMS for Use Cases and Feature pages.

## 🏗️ Implementation Options

### Option 1: Simple URL Field (Recommended)

**Add to Schema:**
```typescript
// File: src/sanity/schemaTypes/useCaseType.ts or featureType.ts
defineField({
  name: 'videoUrl',
  title: 'Video URL',
  type: 'url',
  description: 'Paste Loom, YouTube, or Vimeo URL here'
}),
```

**Use in Component:**
```tsx
// Loom Video
{useCase.videoUrl && (
  <div className="aspect-video w-full mb-8">
    <iframe
      src={useCase.videoUrl.replace('/share/', '/embed/')}
      className="w-full h-full rounded-lg border-0"
      allowFullScreen
    />
  </div>
)}

// YouTube Video  
{useCase.videoUrl && (
  <div className="aspect-video w-full mb-8">
    <iframe
      src={useCase.videoUrl.replace('watch?v=', 'embed/')}
      className="w-full h-full rounded-lg border-0"
      allowFullScreen
    />
  </div>
)}
```

### Option 2: Embed Code Field

**Add to Schema:**
```typescript
defineField({
  name: 'videoEmbed',
  title: 'Video Embed Code',
  type: 'text',
  description: 'Paste the full <iframe> embed code',
  rows: 4
}),
```

**Use in Component:**
```tsx
{useCase.videoEmbed && (
  <div 
    className="aspect-video w-full mb-8"
    dangerouslySetInnerHTML={{ __html: useCase.videoEmbed }}
  />
)}
```

## 📝 Platform-Specific Instructions

### Loom Videos
1. **Get URL**: Copy share URL from Loom (e.g., `https://loom.com/share/abc123`)
2. **Paste in Sanity**: Add to Video URL field
3. **Auto-converts**: Code changes `/share/` to `/embed/`

### YouTube Videos
1. **Get URL**: Copy regular YouTube URL (e.g., `https://youtube.com/watch?v=abc123`)
2. **Paste in Sanity**: Add to Video URL field  
3. **Auto-converts**: Code changes `watch?v=` to `embed/`

### Vimeo Videos
1. **Get URL**: Copy Vimeo URL (e.g., `https://vimeo.com/123456789`)
2. **Paste in Sanity**: Add to Video URL field
3. **Works directly**: No URL conversion needed

## 🎯 Where to Add Videos

### For Use Cases
```tsx
// File: src/components/UseCases/index.tsx
// Add video above or below the image

<div className="aspect-video mb-6">
  <iframe
    src={useCase.videoUrl?.replace('/share/', '/embed/')}
    className="w-full h-full rounded-lg"
    allowFullScreen
  />
</div>
<Image ... /> {/* Existing image */}
```

### For Feature Detail Pages
```tsx
// File: src/app/[slug]/page.tsx
// Add in content section or as new section

{/* Video Section */}
{feature.videoUrl && (
  <div className="bg-gray-50 py-24">
    <div className="mx-auto max-w-4xl px-6">
      <div className="aspect-video">
        <iframe
          src={feature.videoUrl.replace('/share/', '/embed/')}
          className="w-full h-full rounded-lg shadow-lg"
          allowFullScreen
        />
      </div>
    </div>
  </div>
)}
```

## 📱 Responsive Video Component

Create a reusable video component:

```tsx
// File: src/components/ui/VideoEmbed.tsx
interface VideoEmbedProps {
  url: string
  title?: string
  className?: string
}

export function VideoEmbed({ url, title, className = '' }: VideoEmbedProps) {
  const getEmbedUrl = (url: string) => {
    // Loom
    if (url.includes('loom.com/share/')) {
      return url.replace('/share/', '/embed/')
    }
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('youtube.com/watch?v=', 'youtube.com/embed/')
    }
    // YouTube short URLs
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/')
    }
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]
      return `https://player.vimeo.com/video/${videoId}`
    }
    return url
  }

  return (
    <div className={`aspect-video w-full ${className}`}>
      <iframe
        src={getEmbedUrl(url)}
        title={title}
        className="w-full h-full rounded-lg border-0"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
```

**Usage:**
```tsx
import { VideoEmbed } from '@/components/ui/VideoEmbed'

{useCase.videoUrl && (
  <VideoEmbed 
    url={useCase.videoUrl} 
    title={useCase.title}
    className="mb-8"
  />
)}
```

## 🔧 Advanced Features

### Video with Thumbnail
```tsx
{feature.videoUrl && (
  <div className="relative group cursor-pointer">
    {/* Thumbnail Image */}
    <Image
      src={feature.image ? urlFor(feature.image).url() : '/video-placeholder.jpg'}
      alt="Video thumbnail"
      className="w-full aspect-video object-cover rounded-lg"
    />
    {/* Play Button Overlay */}
    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors rounded-lg">
      <div className="bg-white/90 rounded-full p-4">
        <PlayIcon className="w-8 h-8 text-gray-800" />
      </div>
    </div>
  </div>
)}
```

### Multiple Videos Gallery
```tsx
{/* Add to schema */}
defineField({
  name: 'videos',
  title: 'Videos',
  type: 'array',
  of: [{
    type: 'object',
    fields: [
      { name: 'title', type: 'string' },
      { name: 'url', type: 'url' },
      { name: 'thumbnail', type: 'image' }
    ]
  }]
})

{/* Use in component */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {feature.videos?.map((video, index) => (
    <div key={index}>
      <h3 className="font-semibold mb-2">{video.title}</h3>
      <VideoEmbed url={video.url} />
    </div>
  ))}
</div>
```

## ⚠️ Important Notes

- **Loading**: Use `loading="lazy"` for performance
- **Aspect Ratio**: Use `aspect-video` (16:9) for consistency  
- **Security**: `dangerouslySetInnerHTML` only with trusted embed codes
- **Privacy**: Loom/YouTube may track viewers via embeds
- **Performance**: Videos load after other content

## 🚀 Quick Setup Checklist

1. ✅ Add video field to Sanity schema
2. ✅ Update GROQ query to fetch video field  
3. ✅ Add video rendering in component
4. ✅ Test with Loom/YouTube URLs
5. ✅ Style with Tailwind classes
6. ✅ Make responsive with `aspect-video`