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
    offset: ["start start", "end end"]
  })

  // Filter to show only items with order 6-10, sorted by order
  const scrollFeatures = features
    .filter((item) => item.order >= 6 && item.order <= 10)
    .sort((a, b) => a.order - b.order)

  // Calculate transform to show all cards - ensure the last card is fully visible
  const numCards = scrollFeatures.length
  
  // Responsive scroll distance - much more distance for mobile
  const [isMobile, setIsMobile] = React.useState(false)
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // More aggressive translation for mobile to ensure all cards are visible
  const translatePercent = isMobile 
    ? Math.max(195, numCards * 82) // Tiny bump more
    : Math.max(95, numCards * 25) // Original desktop behavior
  
  // Use smooth easing curve for more fluid scroll movement
  const x = useTransform(
    scrollYProgress, 
    [0, 1], 
    ["0%", `-${Math.min(translatePercent, isMobile ? 385 : 130)}%`],
    {
      ease: (t: number) => {
        // Custom easing function for smoother acceleration/deceleration
        return t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2
      }
    }
  )

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
        className="relative w-full -mt-20"
        style={{ height: `${Math.max(400, scrollFeatures.length * (isMobile ? 120 : 80))}vh` }}
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
            
            {/* View All Stories Card */}
            <div className="flex-shrink-0 w-[400px] h-[600px] rounded-lg bg-transparent flex flex-col items-center justify-center text-white group cursor-pointer">
              <Link href="/stories" className="flex flex-col items-center justify-center h-full w-full text-center p-8">
                <div className="mb-8">
                  <Image
                    src="/apple-touch-icon.png"
                    width={80}
                    height={80}
                    alt="Logo"
                    className="opacity-80"
                  />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-foreground">View all stories</h3>
                <div className="transition-transform group-hover:translate-x-2 text-foreground">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M5 12H19M19 12L12 5M19 12L12 19" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            </div>
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
          // Video with proper sizing
          feature.video?.videoType === 'upload' || feature.video?.videoType === 'url' ? (
            <video 
              src={videoUrl}
              autoPlay={true}
              loop={feature.video?.loop !== false}
              muted={true}
              playsInline
              className="w-[400px] h-[600px] object-cover rounded-lg scale-125"
              style={{ pointerEvents: 'none' }}
            />
          ) : (
            // For embedded videos with proper dimensions
            <iframe
              src={videoUrl}
              className="rounded-lg w-[400px] h-[600px] scale-125"
              style={{
                pointerEvents: 'none'
              }}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; encrypted-media"
              loading="lazy"
            />
          )
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            width={400}
            height={600}
            className="w-[400px] h-[600px] object-cover rounded-lg scale-125"
            alt={feature.title}
          />
        ) : (
          <div className={`h-[600px] w-[400px] bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} rounded-lg`} />
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