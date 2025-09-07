'use client'

interface VideoPlayerProps {
  src: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  controls?: boolean
  controlsList?: string
  className?: string
  style?: React.CSSProperties
}

export default function VideoPlayer({
  src,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  controls = true,
  controlsList = "nodownload",
  className = "max-w-full rounded-xl",
  style = {
    maxHeight: '480px',
    width: 'auto',
    height: 'auto'
  }
}: VideoPlayerProps) {
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    const isVertical = video.videoHeight > video.videoWidth;
    if (isVertical) {
      video.style.maxHeight = '100vh';
      video.style.maxWidth = '100vw';
    }
  }

  return (
    <video 
      src={src}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      controls={controls}
      controlsList={controlsList}
      className={className}
      style={style}
      onLoadedMetadata={handleLoadedMetadata}
    />
  )
}