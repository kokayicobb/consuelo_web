"use client"

import * as React from "react"
import { motion, useTransform, useScroll } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

interface StoriesProps {
  features: Feature[]
}

const Stories: React.FC<StoriesProps> = ({ features }) => {
  const router = useRouter()
  const targetRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  })

  // Filter to show only items with order > 5, sorted by order
  const scrollFeatures = features
    .filter((item) => item.order > 5)
    .sort((a, b) => a.order - b.order)

  const x = useTransform(scrollYProgress, [0.4, 0.8], ["5%", "-95%"])

  return (
    <div className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-8 flex items-center justify-between relative z-20">
        <h2 className="text-2xl font-bold">Stories</h2>
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Button clicked!')
            router.push('/stories')
          }} 
          className="text-sm hover:underline relative z-50"
          style={{ pointerEvents: 'auto' }}
        >
          View All
        </button>
      </div>
      
      <section
        ref={targetRef}
        className="relative h-[150vh] w-full -mt-20"
      >
        <div className="sticky top-0 flex h-screen items-start overflow-hidden pt-32">
          <motion.div
            style={{ x }}
            className="flex gap-8"
          >
            {scrollFeatures.map((feature) => (
              <FeatureCard
                key={feature._id}
                feature={feature}
              />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => {
  // Use optimized image hook for each feature
  const imageData = useOptimizedImage(feature.image, 'feature')

  const getImageUrl = () => {
    if (feature.image) {
      return imageData.imageUrl || ""
    }
    return feature.imagePath || ""
  }

  const getFeatureVideoUrl = () => {
    if (!feature.video) return null
    
    switch (feature.video.videoType) {
      case 'youtube':
        if (feature.video.url) {
          const videoId = feature.video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
          return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${feature.video.autoplay ? 1 : 0}&mute=${feature.video.muted ? 1 : 0}&loop=${feature.video.loop ? 1 : 0}` : null
        }
        break
      case 'vimeo':
        if (feature.video.url) {
          const videoId = feature.video.url.match(/vimeo\.com\/(\d+)/)?.[1]
          return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=${feature.video.autoplay ? 1 : 0}&muted=${feature.video.muted ? 1 : 0}&loop=${feature.video.loop ? 1 : 0}` : null
        }
        break
      case 'loom':
        if (feature.video.url) {
          return feature.video.url.includes('/embed/') 
            ? `${feature.video.url}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${feature.video.autoplay ? 'true' : 'false'}`
            : `https://www.loom.com/embed/${feature.video.url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1]}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=${feature.video.autoplay ? 'true' : 'false'}`
        }
        break
      case 'upload':
        // Handle uploaded video files using Sanity helper
        return getVideoUrl(feature.video.file)
      case 'url':
        // Direct video URL
        return feature.video.url || null
    }
    return null
  }

  const videoUrl = getFeatureVideoUrl()
  const imageUrl = getImageUrl()

  return (
    <div className="group relative overflow-hidden rounded-lg flex-shrink-0">
      <Link href={`/${(feature.slug?.current || 'test-slug').replace(/^.*\//, '').trim()}`}>
{videoUrl ? (
            // Video with reasonable sizing but scaled up
            feature.video?.videoType === 'upload' || feature.video?.videoType === 'url' ? (
              <video 
                src={videoUrl}
                autoPlay={true}
                loop={feature.video?.loop !== false}
                muted={true}
                playsInline
                className="max-w-[500px] max-h-[700px] w-auto h-auto rounded-lg scale-150"
                style={{ pointerEvents: 'none' }}
              />
            ) : (
              // For embedded videos with scale
              <iframe
                src={videoUrl}
                className="rounded-lg scale-150"
                style={{
                  pointerEvents: 'none',
                  width: '400px',
                  height: '225px'
                }}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media"
                loading="lazy"
              />
            )
          ) : imageUrl ? (
            <div className="relative h-[600px] w-[500px] rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                fill
                className="object-cover"
                alt={feature.title}
              />
            </div>
          ) : (
            <div className={`h-[600px] w-[500px] bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} rounded-lg`} />
          )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:bg-black/40 rounded-lg" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
          <p className="text-sm opacity-90 line-clamp-3">{feature.description}</p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="px-4 py-2 text-center font-medium text-white bg-white/20 rounded-lg backdrop-blur-sm">
            View Story
          </span>
        </div>
      </Link>
    </div>
  )
}

export { Stories as HorizontalScrollFeatures }