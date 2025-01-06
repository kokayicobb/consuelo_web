"use client"

import { useState, useEffect } from "react"
import { ShootingStars } from "@/components/ui/shooting-stars"
import { StarsBackground } from "@/components/ui/stars-background"

const ShimmerLoader = ({ onLoadComplete }: { onLoadComplete?: () => void }) => {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false)
      onLoadComplete?.()
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [onLoadComplete])

  if (!showLoader) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#111111] z-50 overflow-hidden">
      <StarsBackground className={undefined} />
      <ShootingStars 
        minSpeed={15}
        maxSpeed={35}
        starColor="#9E00FF"
        trailColor="#2EB9DF" className={undefined}      />
      <div 
        className="relative z-10 text-6xl font-bold text-center"
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "linear-gradient(to right, #8A2BE2, #FF69B4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        CONSUELO
      </div>
    </div>
  )
}

export default ShimmerLoader