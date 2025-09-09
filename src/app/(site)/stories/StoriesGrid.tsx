"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { urlFor, getVideoUrl } from "@/sanity/lib/image"
import { useOptimizedImage } from "@/hooks/use-cached-image"

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

interface StoriesGridProps {
  features: Feature[]
}

const StoriesGrid: React.FC<StoriesGridProps> = ({ features }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature) => (
        <StoryCard
          key={feature._id}
          feature={feature}
        />
      ))}
    </div>
  )
}

const StoryCard: React.FC<{ feature: Feature }> = ({ feature }) => {
  // Use optimized image hook for each feature
  const imageData = useOptimizedImage(feature.image, 'feature')

  const getImageUrl = () => {
    if (feature.image) {
      return imageData.imageUrl || ""
    }
    return feature.imagePath || ""
  }

  const getFeatureVideoUrl = () => {
    // Priority: video object > heroVideo URL (like in slug page)
    if (feature.video) {
      switch (feature.video.videoType) {
        case 'youtube':
          if (feature.video.url) {
            const videoId = feature.video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&loop=${feature.video.loop ? 1 : 0}` : null
          }
          break
        case 'vimeo':
          if (feature.video.url) {
            const videoId = feature.video.url.match(/vimeo\.com\/(\d+)/)?.[1]
            return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=0&muted=1&loop=${feature.video.loop ? 1 : 0}` : null
          }
          break
        case 'loom':
          if (feature.video.url) {
            return feature.video.url.includes('/embed/') 
              ? `${feature.video.url}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=false`
              : `https://www.loom.com/embed/${feature.video.url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1]}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=false`
          }
          break
        case 'upload':
          return getVideoUrl(feature.video.file)
        case 'url':
          return feature.video.url || null
      }
    }
    
    // Fallback to heroVideo if available (like in slug page)
    if (feature.heroVideo) {
      return feature.heroVideo
    }
    
    return null
  }

  const videoUrl = getFeatureVideoUrl()
  const imageUrl = getImageUrl()

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white dark:bg-transparent shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/${(feature.slug?.current || 'test-slug').replace(/^.*\//, '').trim()}`}>
        {/* Media Container */}
        <div className="relative aspect-video overflow-hidden">
          {videoUrl ? (
            <>
              {/* Handle different video types like BentoGrid */}
              {feature.video?.videoType === 'upload' || feature.video?.videoType === 'url' ? (
                <video 
                  src={videoUrl}
                  autoPlay={feature.video?.autoplay !== false}
                  loop={feature.video?.loop !== false}
                  muted={feature.video?.muted !== false}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <iframe
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                  loading="lazy"
                />
              )}
              {/* Video overlay for better visual consistency */}
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
            </>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              alt={feature.title}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo}`} />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {feature.description}
          </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="px-4 py-2 text-center font-medium text-white bg-black/80 rounded-lg backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Story
          </span>
        </div>
      </Link>
    </div>
  )
}

export default StoriesGrid