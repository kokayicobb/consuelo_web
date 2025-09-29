"use client"
// src/components/Features/index.tsx
import type React from "react"
import { BentoGrid, BentoGridItem } from "../ui/bento-grid"
import { IconShirt, IconRuler, IconCube, IconChartBar, IconMail, IconLock } from "@tabler/icons-react"
import { urlFor, getVideoUrl } from "@/sanity/lib/image"
import { useOptimizedImage } from "@/hooks/use-cached-image"

interface BackgroundPatternProps {
  children: React.ReactNode
  className?: string
  gradientFrom: string
  gradientTo: string
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ children, className, gradientFrom, gradientTo }) => (
  <div className={`relative overflow-hidden rounded-xl ${className}`}>
    <div className={`absolute inset-0 opacity-70 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}></div>
    <div className="absolute inset-0 opacity-30">{children}</div>
  </div>
)

interface Feature {
  _id: string
  title: string
  description: string
  image?: any
  imagePath?: string
  video?: {
    videoType: 'youtube' | 'vimeo' | 'loom' | 'upload' | 'url'
    url?: string
    file?: any
    autoplay?: boolean
    loop?: boolean
    muted?: boolean
  }
  heroVideo?: string
  slug: { current: string }
  isHero: boolean
  gradientFrom: string
  gradientTo: string
  order: number
}

interface FeaturesProps {
  features: Feature[]
}

export function Features({ features }: FeaturesProps) {
  // Get the hero item
  const heroItem = features.find((item) => item.isHero)

  // Get all other items except the hero, sorted by order, limited to orders 1-5
  const regularItems = features
    .filter((item) => !item.isHero && item.order >= 1 && item.order <= 5)
    .sort((a, b) => a.order - b.order)

  // Cache optimized images for hero item
  const heroImageData = useOptimizedImage(heroItem?.image, 'hero')
  
  // Call hooks for each regular item individually at top level
  const regularImageData = [
    useOptimizedImage(regularItems[0]?.image, 'feature'),
    useOptimizedImage(regularItems[1]?.image, 'feature'),
    useOptimizedImage(regularItems[2]?.image, 'feature'),
    useOptimizedImage(regularItems[3]?.image, 'feature'),
    useOptimizedImage(regularItems[4]?.image, 'feature'),
    useOptimizedImage(regularItems[5]?.image, 'feature'),
  ]

  const getImageUrl = (item: Feature, index?: number) => {
    if (item.image) {
      if (item.isHero) {
        return heroImageData.imageUrl;
      } else {
        return regularImageData[index || 0]?.imageUrl || "";
      }
    }
    return item.imagePath || ""
  }

  const getFeatureVideoUrl = (video?: Feature['video'], heroVideo?: string, isHero?: boolean) => {
    // For hero items, prioritize the heroVideo URL field
    if (isHero && heroVideo) {
      return heroVideo;
    }
    
    if (!video) return null;
    
    switch (video.videoType) {
      case 'youtube':
        if (video.url) {
          // Convert YouTube URL to embed format
          const videoId = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
          return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${video.autoplay ? 1 : 0}&mute=${video.muted ? 1 : 0}&loop=${video.loop ? 1 : 0}` : null;
        }
        break;
      case 'vimeo':
        if (video.url) {
          // Convert Vimeo URL to embed format
          const videoId = video.url.match(/vimeo\.com\/(\d+)/)?.[1];
          return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=${video.autoplay ? 1 : 0}&muted=${video.muted ? 1 : 0}&loop=${video.loop ? 1 : 0}` : null;
        }
        break;
      case 'loom':
        if (video.url) {
          // Use existing Loom logic from BentoGridItem
          return video.url.includes('/embed/') 
            ? `${video.url}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${video.autoplay ? 'true' : 'false'}`
            : `https://www.loom.com/embed/${video.url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1]}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${video.autoplay ? 'true' : 'false'}`;
        }
        break;
      case 'upload':
        // Handle uploaded video files using Sanity helper
        return getVideoUrl(video.file);
      case 'url':
        // Direct video URL
        return video.url || null;
    }
    return null;
  }

  // Debug: Log the features to see what we're getting
  console.log('Features data:', features.map(f => ({ 
    title: f.title, 
    slug: f.slug, 
    isHero: f.isHero,
    hasVideo: !!f.video,
    videoType: f.video?.videoType,
    heroVideo: f.heroVideo,
    videoUrl: getFeatureVideoUrl(f.video, f.heroVideo, f.isHero)
  })))

  return (
    <section
      id="features"
      className="bg-transparent pt-0 sm:pt-0 md:pt-4 lg:pt-8 pb-8 sm:pb-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BentoGrid>
          {/* Hero item */}
          {heroItem && (
            <BentoGridItem
              title={heroItem.title}
              description={heroItem.description}
              header={
                <BackgroundPattern 
                  gradientFrom={heroItem.gradientFrom} 
                  gradientTo={heroItem.gradientTo}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="white" strokeWidth="2" />
                    <path d="M20,70 Q35,40 50,70 T80,70" fill="none" stroke="white" strokeWidth="2" />
                  </svg>
                </BackgroundPattern>
              }
              icon={<IconLock className="h-8 w-8 text-accent" />}
              backgroundImage={getImageUrl(heroItem)}
              backgroundVideo={getFeatureVideoUrl(heroItem.video, heroItem.heroVideo, true)}
              videoConfig={heroItem.video}
              isHero={true}
              href={`/${(heroItem.slug?.current || 'test-slug').replace(/^.*\//, '').trim()}`}
            />
          )}

          {/* Regular items */}
          {regularItems.map((item, i) => (
            <BentoGridItem
              key={item._id}
              index={i}
              title={item.title}
              description={item.description}
              header={
                <BackgroundPattern 
                  gradientFrom={item.gradientFrom} 
                  gradientTo={item.gradientTo}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="white" strokeWidth="2" />
                    <path d="M20,70 Q35,40 50,70 T80,70" fill="none" stroke="white" strokeWidth="2" />
                  </svg>
                </BackgroundPattern>
              }
              icon={<IconChartBar className="h-8 w-8 text-accent" />}
              backgroundImage={getImageUrl(item, i)}
              backgroundVideo={getFeatureVideoUrl(item.video, undefined, false)}
              videoConfig={item.video}
              href={`/${(item.slug?.current || 'test-slug').replace(/^.*\//, '').trim()}`}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}

export default Features