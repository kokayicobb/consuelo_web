"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { PencilIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function WavyBackgroundDemo(): JSX.Element {
  const [inputValue, setInputValue] = useState<string>("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [fadeState, setFadeState] = useState("in") // "in" or "out"
  const [isFocused, setIsFocused] = useState(false)
  
  const placeholders = [
    "Help me create an email campaign for new customers...",
    "Create a personalized product recommendation flow...",
    "Design a re-engagement sequence for dormant customers...",
    "Set up automated abandoned cart recovery emails...",
    "Analyze my customer segmentation strategy..."
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (fadeState === "in") {
        setFadeState("out")
        setTimeout(() => {
          setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length)
          setFadeState("in")
        }, 500) // Wait for fade out to complete
      }
    }, 3000) // Change every 3 seconds
    
    return () => clearInterval(interval)
  }, [fadeState, placeholders.length])
  
  return (
    <div className="w-full flex flex-col items-center justify-center bg-transparent min-h-[80vh] relative">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-medium text-foreground">
            What can I help with?
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-2xl"
        >
          <div className="relative w-full">
            {/* Added shadow and glow effects */}
            <div 
              className={cn(
                "relative border border-border rounded-3xl bg-transparent transition-all duration-300",
                "shadow-[0_0_15px_rgba(0,0,0,0.05)]", 
                isFocused ? 
                  "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-black/5" : 
                  "hover:shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.05)]"
              )}
            >
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholders[placeholderIndex]}
                className={cn(
                  "w-full min-h-[120px] px-6 py-5 rounded-3xl outline-none text-foreground bg-transparent resize-none transition-opacity duration-500",
                  fadeState === "out" ? "opacity-30" : "opacity-100"
                )}
              ></textarea>
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                <button className="p-1.5 rounded-full hover:bg-muted/20 transition-colors">
                  <PencilIcon size={18} className="text-muted-foreground" />
                </button>
                <button className="p-1.5 rounded-full bg-emerald-600 text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          <button className="px-4 py-2 rounded-full border border-border bg-transparent hover:bg-card/10 transition-colors text-sm text-foreground">
            AI Agent
          </button>
          <button className="px-4 py-2 rounded-full border border-border bg-transparent hover:bg-card/10 transition-colors text-sm text-foreground">
            Email Campaign Builder
          </button>
          <button className="px-4 py-2 rounded-full border border-border bg-transparent hover:bg-card/10 transition-colors text-sm text-foreground">
            Customer Analytics
          </button>
          <button className="px-4 py-2 rounded-full border border-border bg-transparent hover:bg-card/10 transition-colors text-sm text-foreground">
            Data Integration
          </button>
          <button className="px-4 py-2 rounded-full border border-border bg-transparent hover:bg-card/10 transition-colors text-sm text-foreground">
            More 
          </button>
        </motion.div>
      </div>
      
      {/* Scroll indicator at the bottom */}
      <motion.div 
  className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-row items-center gap-1"



  initial={{ opacity: 0 }}
  animate={{ 
    opacity: 1,
    transition: {
      opacity: {
        duration: 0.5,
        delay: 1
      }
    }
  }}
>
  <p className="text-sm text-muted-foreground">Scroll to explore</p>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
</motion.div>

    </div>
  )
}