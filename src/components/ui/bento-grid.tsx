"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import React, { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"

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

  // Use effect to ensure sticky behavior works and handle scroll events
  useEffect(() => {
    // Force recalculation of layout to ensure sticky positioning works
    if (heroRef.current && containerRef.current) {
      const container = containerRef.current
      const hero = heroRef.current

      // Make sure the container is tall enough for sticky to work
      const ensureHeight = () => {
        const viewportHeight = window.innerHeight
        const rightColumn = rightColumnRef.current

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
          top: "2rem",
          height: "fit-content",
          alignSelf: "flex-start",
          zIndex: 10,
        }}
      >
        {/* Pass isAtVeryEnd state to the hero item */}
        {React.isValidElement(heroItem) && 
          React.cloneElement(heroItem as React.ReactElement, { isAtVeryEnd: false })}
      </div>

      {/* Right column with regular items - Made smaller */}
      <motion.div ref={rightColumnRef} className="md:col-span-4 flex flex-col gap-3">
        {/* Pass isAtVeryEnd to the last item only */}
        {regularItems.map((item, index) => {
          // Check if this is the last item
          const isLastItem = index === regularItems.length - 1;
          
          // Clone the element with the isAtVeryEnd prop if it's the last item
          if (isLastItem && React.isValidElement(item)) {
            return React.cloneElement(item as React.ReactElement, { 
              isAtVeryEnd, 
              key: index 
            });
          }
          
          // Return the item as is if it's not the last one
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
  href = "",
  onClick,
  backgroundImage,
  isHero = false,
  index = 0,
  isAtVeryEnd = false, // Renamed from isAtEnd to isAtVeryEnd
}: {
  className?: string
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  backgroundImage?: string
  isHero?: boolean
  index?: number
  isAtVeryEnd?: boolean // Renamed from isAtEnd to isAtVeryEnd
}) => {
  const Wrapper = href ? Link : motion.div

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

  const wrapperProps = href
    ? { href }
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, margin: "-100px" },
        custom: index,
        variants: !isHero ? itemVariants : undefined,
      }

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
      <Wrapper
        {...wrapperProps}
        onClick={onClick}
        className={cn(
          "row-span-1 rounded-xl group/bento relative",
          "overflow-hidden",
          // Adjust aspect ratio - Make hero bigger, items smaller
          isHero ? "aspect-[5/3] lg:aspect-[16/12]" : "aspect-[3/2]", // Hero is taller, items stay the same
          // Width properties
          "w-full",
          "transition-all duration-200 ease-out",
          href && "cursor-pointer",
          className,
        )}
      >
        {/* Gradient border container */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF1493]/20 to-[#00BFFF]/20 rounded-xl opacity-60"></div>

        {/* Image background */}
        {backgroundImage ? (
          <div className="absolute inset-[1px] rounded-xl overflow-hidden">
            <Image src={backgroundImage || "/placeholder.svg"} alt="Background" fill className="object-cover" />
            {/* Lighter overlay */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]"></div>
          </div>
        ) : (
          <div className="absolute inset-[1px] bg-background rounded-xl"></div>
        )}

        {/* Card content */}
        <div className="relative z-10 h-full">{header}</div>
      </Wrapper>

      {/* Text content below the card */}
      <motion.div
        className={cn(
          "mt-3", // Reduced from mt-4
          // Consistent padding for all items
          isHero ? "px-1" : "px-1",
        )}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        viewport={{ once: true }}
      >
        {/* Title - Make last item bigger at the very end of the page */}
        <h3
          className={cn(
            "font-bold text-foreground mb-1", // Consistent margin
            isHero 
              ? "text-2xl sm:text-3xl lg:text-4xl" // Hero text is always large
              : isAtVeryEnd 
                ? "text-2xl sm:text-3xl lg:text-4xl" // Last item gets bigger at end
                : "text-sm sm:text-base lg:text-lg", // Regular items stay small
            "transition-all duration-500" // Smoother transition
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
              : isAtVeryEnd
                ? "text-sm sm:text-base" // Last item gets bigger at end
                : "text-xs", // Regular items stay small
            "transition-all duration-500" // Smoother transition
          )}>
            {description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}