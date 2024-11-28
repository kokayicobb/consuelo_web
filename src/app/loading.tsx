"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from 'lucide-react'

const funLoadingMessages = [
  "Brewing some magic ✨",
  "Teaching robots to dance 🤖",
  "Counting infinity... twice 🔄",
  "Convincing pixels to behave 🎨",
  "Loading awesome stuff 🚀",
  "Generating random excuses 😅",
  "Reticulating splines ⚡️",
  "Making things pretty 💅",
  "Doing the impossible 💫",
]

const LoaderWrapper = ({ 
  children,
  onLoadComplete 
}: { 
  children: React.ReactNode
  onLoadComplete?: () => void 
}) => {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false)
      onLoadComplete?.()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onLoadComplete])

  if (!showLoader) return null

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#111111] z-50 overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-500/30"
            initial={{ scale: 0, x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{
              scale: [0, 1, 0],
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
      </div>
      {children}
    </div>
  )
}

const ShimmerLoader = ({ onLoadComplete }: { onLoadComplete?: () => void }) => {
  const [loadingMessage, setLoadingMessage] = useState(funLoadingMessages[0])

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMessage(funLoadingMessages[Math.floor(Math.random() * funLoadingMessages.length)])
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <LoaderWrapper onLoadComplete={onLoadComplete}>
      <div className="relative flex flex-col items-center">
        <div className="overflow-hidden mb-8">
          {"CONSUELO".split("").map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block text-6xl font-bold"
              style={{
                fontFamily: "'Inter', sans-serif",
                background: "linear-gradient(to right, #8A2BE2, #FF69B4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              initial={{ y: 100 }}
              animate={{
                y: 0,
                rotate: [0, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                type: "spring",
                bounce: 0.5,
                duration: 0.8,
                delay: i * 0.1,
                rotate: {
                  repeat: Infinity,
                  repeatType: "mirror",
                  duration: 2,
                  delay: i * 0.2 + 1,
                },
                scale: {
                  repeat: Infinity,
                  repeatType: "mirror",
                  duration: 2,
                  delay: i * 0.2 + 1,
                },
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={loadingMessage}
            className="text-xl text-gray-400 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {loadingMessage}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="mt-8 h-1 w-48 bg-gray-800 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            animate={{
              x: [-192, 192],
              scaleX: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </LoaderWrapper>
  )
}

export default ShimmerLoader