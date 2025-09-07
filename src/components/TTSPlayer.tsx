"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Share2, Link } from "lucide-react"
import { toast } from "sonner"

interface TTSPlayerProps {
  title: string
  audioUrl: string // Direct audio URL instead of Sanity file reference
  audioDuration?: number // Duration in seconds
}

export default function TTSPlayer({ title, audioUrl, audioDuration }: TTSPlayerProps) {
  console.log("🔊 TTSPlayer component rendered with:", { title, audioUrl, audioDuration })

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState<number>(audioDuration || 0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioUrl) return

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    // Set up event listeners
    audio.addEventListener("loadedmetadata", () => {
      console.log("🔊 Audio metadata loaded, duration:", audio.duration)
      setDuration(audio.duration)
    })

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener("ended", () => {
      console.log("🔊 Audio ended")
      setIsPlaying(false)
      setCurrentTime(0)
    })

    audio.addEventListener("error", (e) => {
      console.error("🔊 Audio error:", e, audio.error)
    })

    // Cleanup on unmount
    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [audioUrl])

  const togglePlayPause = async () => {
    console.log("🔊 Button clicked! isPlaying:", isPlaying)

    if (!audioRef.current || !audioUrl) {
      console.error("🔊 No audio available")
      return
    }

    try {
      if (isPlaying) {
        console.log("🔊 Pausing audio")
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        console.log("🔊 Playing audio")
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("🔊 Error playing/pausing audio:", error)
    }
  }

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleShare = async (e: React.MouseEvent) => {
    try {
      const currentUrl = window.location.href
      await navigator.clipboard.writeText(currentUrl)
      console.log("🔗 URL copied to clipboard:", currentUrl)
      toast("Copied", {
        duration: 2000,
        style: {
          padding: '8px 16px',
          width: 'auto',
          minWidth: '80px',
          maxWidth: '120px',
        },
        position: 'bottom-right'
      })
    } catch (error) {
      console.error("🔗 Failed to copy URL:", error)
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast("Copied", {
        duration: 2000,
        style: {
          padding: '8px 16px',
          width: 'auto',
          minWidth: '80px',
          maxWidth: '120px',
        },
        position: 'bottom-right'
      })
    }
  }

  // Don't render if no audio URL
  if (!audioUrl) {
    console.log("🔊 No audio URL provided, not rendering player")
    return null
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Thin progress line that spans the full width */}
      <div className="w-full mb-6">
        <div className="relative w-full bg-border h-px">
          {duration > 0 && (
            <div
              className="bg-foreground h-px transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between w-full text-foreground">
        {/* Left side - Play button and time/title */}
        <div className="flex items-center gap-4">
          {/* Small, minimal play/pause button */}
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center w-8 h-8 bg-muted hover:bg-muted/80 rounded-full transition-colors"
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 ml-0.5 fill-current" />}
          </button>

          {/* Time display or initial text */}
          <div className="text-sm">
            {isPlaying || currentTime > 0 ? (
              <span className="">{formatTime(currentTime)}</span>
            ) : (
              <span>Listen to article</span>
            )}
          </div>

          {/* Duration (only show in initial state) */}
          {!isPlaying && currentTime === 0 && duration > 0 && (
            <div className="text-sm text-muted-foreground">{formatTime(duration)}</div>
          )}
        </div>

        {/* Center - Speed controls (only show when playing or has been played) */}
        {(isPlaying || currentTime > 0) && (
          <div className="flex items-center gap-2">
            {[0.5, 1, 1.5, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => changePlaybackRate(rate)}
                className={`text-xs px-1 transition-colors ${
                  playbackRate === rate ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        )}

        {/* Right side - Share button */}
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Link className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  )
}