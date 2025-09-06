"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import React, { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getVideoUrl } from "@/sanity/lib/image"

// Modified BentoGrid with Hero layout - Larger hero, smaller items, sidebar compatible
export const BentoGrid = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  // Get first child as hero and rest as regular items
  const childrenArray = React.Children.toArray(children)
  const heroItem = childrenArray[0]
  const regularItems = childrenArray.slice(1)

  // Refs for the container and columns
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const rightColumnRef = useRef<HTMLDivElement>(null)
  const [isAtVeryEnd, setIsAtVeryEnd] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Use effect to ensure sticky behavior works and handle scroll events
  useEffect(() => {
    // Check if we're on mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkIfMobile()
    
    // Force recalculation of layout to ensure sticky positioning works
    if (heroRef.current && containerRef.current) {
      const container = containerRef.current
      const hero = heroRef.current

      // Make sure the container is tall enough for sticky to work
      const ensureHeight = () => {
        const viewportHeight = window.innerHeight
        const rightColumn = rightColumnRef.current

        // Check mobile status on resize
        checkIfMobile()

        if (rightColumn) {
          // Set minimum height to ensure scrolling
          const rightColumnHeight = rightColumn.getBoundingClientRect().height
          container.style.minHeight = `${rightColumnHeight}px`
        }
      }

      // Handle scroll events to check if we're at the end of the page
      const handleScroll = () => {
        if (rightColumnRef.current) {
          const rightColumnBottom = rightColumnRef.current.getBoundingClientRect().bottom
          const viewportHeight = window.innerHeight
          
          // Only trigger at the very end - when the bottom of right column is almost aligned with viewport bottom
          // Lower threshold means it happens closer to the actual end
          if (rightColumnBottom <= viewportHeight + 50) {
            setIsAtVeryEnd(true)
          } else {
            setIsAtVeryEnd(false)
          }
        }
        
        // Check if we've scrolled at all - only apply on mobile
        if (window.scrollY > 20 && window.innerWidth < 768) {
          setHasScrolled(true)
        } else {
          setHasScrolled(false)
        }
      }

      ensureHeight()
      window.addEventListener("resize", ensureHeight)
      window.addEventListener("scroll", handleScroll)

      return () => {
        window.removeEventListener("resize", ensureHeight)
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        "grid grid-cols-1 md:grid-cols-12 gap-4 mx-auto", 
        // Adjust max width to fit within sidebar
        "max-w-6xl md:max-w-5xl lg:max-w-6xl",
        // Add left margin to avoid sidebar overlap
        className
      )}
    >
      {/* Hero column with explicit sticky styling - Made larger */}
      <div
        ref={heroRef}
        className="md:col-span-8" // Increased from 7 to 8 columns
        style={{
          position: "sticky",
          top: "0",
          height: "fit-content",
          alignSelf: "flex-start",
          zIndex: 10,
        }}
      >
        {/* Pass hasScrolled state to the hero item */}
        {React.isValidElement(heroItem) && 
          React.cloneElement(heroItem as React.ReactElement, { 
            isAtVeryEnd: false,
            hasScrolled: hasScrolled,
            isMobile: isMobile
          })}
      </div>

      {/* Right column with regular items - Made smaller */}
      <motion.div ref={rightColumnRef} className="md:col-span-4 flex flex-col gap-3">
        {/* Pass isLast flag to the last item only */}
        {regularItems.map((item, index) => {
          // Check if this is the last item
          const isLastItem = index === regularItems.length - 1;
          
          // Clone the element with the isLast prop if it's the last item
          if (React.isValidElement(item)) {
            return React.cloneElement(item as React.ReactElement, { 
              isLast: isLastItem,
              key: index 
            });
          }
          
          // Return the item as is if it's not valid
          return item;
        })}
      </motion.div>
    </div>
  )
}

// The BentoGridItem component (for both hero and regular items)
export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  href,
  onClick,
  backgroundImage,
  backgroundVideo,
  videoConfig,
  isHero = false,
  index = 0,
  isLast = false,
  hasScrolled = false,
  isMobile = false,
}: {
  className?: string
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  backgroundImage?: string
  backgroundVideo?: string | null
  videoConfig?: {
    videoType: 'youtube' | 'vimeo' | 'loom' | 'upload' | 'url'
    url?: string
    file?: any
    autoplay?: boolean
    loop?: boolean
    muted?: boolean
  }
  isHero?: boolean
  index?: number
  isLast?: boolean
  hasScrolled?: boolean
  isMobile?: boolean
}) => {
  // Animation variants for regular items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    }),
  }

  // Helper function to render background media (video or image)
  const renderBackgroundMedia = () => {
    // Debug logging
    if (backgroundVideo || videoConfig) {
      console.log('BentoGridItem video debug:', {
        backgroundVideo,
        videoType: videoConfig?.videoType,
        hasFile: !!videoConfig?.file,
        title: typeof title === 'string' ? title : 'Complex title'
      });
    }
    
    // Priority: video > image > backgroundImage (existing logic)
    if (backgroundVideo) {
      // If we have videoConfig, use it for detailed control
      if (videoConfig) {
        // Handle different video types
        if (videoConfig.videoType === 'upload' && videoConfig.file) {
          // Direct MP4 video file - use Sanity helper to get proper URL
          const videoUrl = getVideoUrl(videoConfig.file);
          if (videoUrl) {
            return (
              <>
                <video 
                  src={videoUrl}
                  autoPlay={videoConfig.autoplay !== false}
                  loop={videoConfig.loop !== false}
                  muted={videoConfig.muted !== false}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ pointerEvents: 'none' }}
                />
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
              </>
            );
          }
        } else if (videoConfig.videoType === 'loom' || backgroundVideo.includes('loom.com')) {
          // Loom embed (keeping existing logic)
          return (
            <>
              <iframe
                src={backgroundVideo}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                style={{ pointerEvents: 'none' }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
            </>
          );
        } else if (videoConfig.videoType === 'youtube' || videoConfig.videoType === 'vimeo') {
          // YouTube/Vimeo embed
          return (
            <>
              <iframe
                src={backgroundVideo}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                style={{ pointerEvents: 'none' }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
            </>
          );
        } else if (videoConfig.videoType === 'url' && backgroundVideo) {
          // Direct video URL
          return (
            <>
              <video 
                src={backgroundVideo}
                autoPlay={videoConfig.autoplay !== false}
                loop={videoConfig.loop !== false}
                muted={videoConfig.muted !== false}
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ pointerEvents: 'none' }}
              />
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
            </>
          );
        }
      } else {
        // Simple video URL without config (like heroVideo)
        // Try to detect the type and render appropriately
        if (backgroundVideo.includes('loom.com')) {
          // Loom URL
          const embedUrl = backgroundVideo.includes('/embed/') 
            ? `${backgroundVideo}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=false`
            : `https://www.loom.com/embed/${backgroundVideo.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1]}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=false`;
          
          return (
            <>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                style={{ pointerEvents: 'none' }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
            </>
          );
        } else if (backgroundVideo.includes('youtube.com') || backgroundVideo.includes('youtu.be')) {
          // YouTube URL - convert to embed
          const videoId = backgroundVideo.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
          if (videoId) {
            return (
              <>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  style={{ pointerEvents: 'none' }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
              </>
            );
          }
        } else if (backgroundVideo.includes('vimeo.com')) {
          // Vimeo URL - convert to embed
          const videoId = backgroundVideo.match(/vimeo\.com\/(\d+)/)?.[1];
          if (videoId) {
            return (
              <>
                <iframe
                  src={`https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1`}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  style={{ pointerEvents: 'none' }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
              </>
            );
          }
        } else {
          // Assume it's a direct video file URL
          return (
            <>
              <video 
                src={backgroundVideo}
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ pointerEvents: 'none' }}
              />
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
            </>
          );
        }
      }
    }
    
    // Fallback to existing image logic if no video
    if (backgroundImage) {
      // Keep existing Loom detection for backward compatibility
      if (backgroundImage.includes('loom.com')) {
        return (
          <>
            <iframe
              src={backgroundImage.includes('/embed/') 
                ? `${backgroundImage}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=false`
                : `https://www.loom.com/embed/${backgroundImage.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1]}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=false`
              }
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              style={{ pointerEvents: 'none' }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
          </>
        );
      } else {
        return (
          <>
            <Image src={backgroundImage || "/placeholder.svg"} alt="Background" fill className="object-fill" />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]"></div>
          </>
        );
      }
    }
    
    return null;
  }

  // Render different components based on whether href is provided
  if (href) {
    return (
      <motion.div
        className={cn(
          "flex flex-col",
          isHero && "mb-0 lg:mb-0", // No bottom margin for hero on larger screens
        )}
        whileHover={{ scale: isHero ? 1.01 : 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Card with image */}
        <Link
          href={href}
          onClick={onClick}
          className={cn(
            "row-span-1 rounded-xl group/bento relative",
            "overflow-hidden",
            // Adjust aspect ratio - Make hero bigger, items smaller
            isHero ? "aspect-[5/3] lg:aspect-[5/3]" : "aspect-[3/2]", // Hero has better aspect ratio
            // Width properties
            "w-full",
            "transition-all duration-200 ease-out",
            "cursor-pointer",
            className,
          )}
        >
          {/* Gradient border container */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF1493]/20 to-[#00BFFF]/20 rounded-xl opacity-60"></div>

          {/* Image/Video background */}
          {(backgroundVideo || backgroundImage) ? (
            <div className="absolute inset-[1px] rounded-xl overflow-hidden">
              {renderBackgroundMedia()}
            </div>
          ) : (
            <div className="absolute inset-[1px] bg-background rounded-xl"></div>
          )}

          {/* Card content */}
          <div className="relative z-10 h-full">{header}</div>
        </Link>

        {/* Text content below the card */}
        <motion.div
          className={cn(
            "mt-3", // Reduced from mt-4
            // Consistent padding for all items
            isHero ? "px-1" : "px-1",
            // Only apply background on mobile when hero is scrolled
            isHero && hasScrolled && isMobile ? "p-2 rounded-lg transition-all duration-300" : "",
          )}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          viewport={{ once: true }}
          style={{
            backgroundColor: isHero && hasScrolled && isMobile ? "rgba(0, 0, 0, 0.05)" : "transparent",
            backdropFilter: isHero && hasScrolled && isMobile ? "blur(4px)" : "none",
            transition: "background-color 0.3s ease, backdrop-filter 0.3s ease"
          }}
        >
          {/* Title - Last item is always large, hero is always large */}
          <h3
            className={cn(
              "font-bold text-foreground mb-1", // Consistent margin
              isHero
                ? "text-2xl sm:text-3xl lg:text-4xl" // Hero is always large
                : "text-sm sm:text-base lg:text-lg", // Regular items stay small
              "transition-all duration-300" // Smoother transition
            )}
          >
            {title}
          </h3>

          {/* Description row */}
          <div className="flex items-center">
            <p className={cn(
              "text-muted-foreground",
              isHero
                ? "text-sm sm:text-base" // Hero description is always large
                : "text-xs", // Regular items stay small
              "transition-all duration-300" // Smoother transition
            )}>
              {description}
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  } else {
    return (
      <motion.div
        className={cn(
          "flex flex-col",
          isHero && "mb-0 lg:mb-0", // No bottom margin for hero on larger screens
        )}
        whileHover={{ scale: isHero ? 1.01 : 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Card with image */}
        <motion.div
          onClick={onClick}
          className={cn(
            "row-span-1 rounded-xl group/bento relative",
            "overflow-hidden",
            // Adjust aspect ratio - Make hero bigger, items smaller
            isHero ? "aspect-[5/3] lg:aspect-[5/3]" : "aspect-[3/2]", // Hero has better aspect ratio
            // Width properties
            "w-full",
            "transition-all duration-200 ease-out",
            onClick && "cursor-pointer",
            className,
          )}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          custom={index}
          variants={!isHero ? itemVariants : undefined}
        >
          {/* Gradient border container */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF1493]/20 to-[#00BFFF]/20 rounded-xl opacity-60"></div>

          {/* Image/Video background */}
          {(backgroundVideo || backgroundImage) ? (
            <div className="absolute inset-[1px] rounded-xl overflow-hidden">
              {renderBackgroundMedia()}
            </div>
          ) : (
            <div className="absolute inset-[1px] bg-background rounded-xl"></div>
          )}

          {/* Card content */}
          <div className="relative z-10 h-full">{header}</div>
        </motion.div>

        {/* Text content below the card */}
        <motion.div
          className={cn(
            "mt-3", // Reduced from mt-4
            // Consistent padding for all items
            isHero ? "px-1" : "px-1",
            // Only apply background on mobile when hero is scrolled
            isHero && hasScrolled && isMobile ? "p-2 rounded-lg transition-all duration-300" : "",
          )}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          viewport={{ once: true }}
          style={{
            backgroundColor: isHero && hasScrolled && isMobile ? "rgba(0, 0, 0, 0.05)" : "transparent",
            backdropFilter: isHero && hasScrolled && isMobile ? "blur(4px)" : "none",
            transition: "background-color 0.3s ease, backdrop-filter 0.3s ease"
          }}
        >
          {/* Title - Last item is always large, hero is always large */}
          <h3
            className={cn(
              "font-bold text-foreground mb-1", // Consistent margin
              isHero
                ? "text-2xl sm:text-3xl lg:text-4xl" // Hero is always large
                : "text-sm sm:text-base lg:text-lg", // Regular items stay small
              "transition-all duration-300" // Smoother transition
            )}
          >
            {title}
          </h3>

          {/* Description row */}
          <div className="flex items-center">
            <p className={cn(
              "text-muted-foreground",
              isHero
                ? "text-sm sm:text-base" // Hero description is always large
                : "text-xs", // Regular items stay small
              "transition-all duration-300" // Smoother transition
            )}>
              {description}
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }
}