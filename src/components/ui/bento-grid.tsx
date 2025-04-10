"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import React, { useRef, useEffect } from "react"
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

  // Use effect to ensure sticky behavior works
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
          container.style.minHeight = `${rightColumnHeight + 100}px`
        }
      }

      ensureHeight()
      window.addEventListener("resize", ensureHeight)

      return () => {
        window.removeEventListener("resize", ensureHeight)
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
        "md:ml-52", 
        className
      )}
      style={{ position: "relative", minHeight: "150vh" }}
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
        {heroItem}
      </div>

      {/* Right column with regular items - Made smaller */}
      <motion.div ref={rightColumnRef} className="md:col-span-4 flex flex-col gap-3">
        {regularItems}
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
          isHero ? "aspect-[5/3] lg:aspect-[16/8]" : "aspect-[3/2]", // Hero is taller, items stay the same
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
          // Adjust padding for hero text
          isHero ? "lg:pr-8" : "px-1", // Reduced right padding from 12 to 8
        )}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        viewport={{ once: true }}
      >
        {/* Title - Made hero title bigger, regular items smaller */}
        <h3
          className={cn(
            "font-bold text-foreground mb-1", // Reduced margin from mb-2 to mb-1
            isHero ? "text-2xl sm:text-3xl lg:text-4xl" : "text-sm sm:text-base lg:text-lg", // Smaller text for regular items
          )}
        >
          {title}
        </h3>

        {/* Description row */}
        <div className="flex items-center">
          <p className={cn(
            "text-muted-foreground", 
            isHero ? "text-sm sm:text-base" : "text-xs" // Made regular description text smaller
          )}>
            {description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}