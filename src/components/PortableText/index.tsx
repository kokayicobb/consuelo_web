import { PortableText as BasePortableText } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'

// Custom components for rich text rendering
const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <figure className="my-12 -mx-6 sm:-mx-12">
        <Image
          src={urlFor(value).url()}
          alt={value.alt || 'Image'}
          width={1200}
          height={600}
          className="rounded-xl shadow-2xl w-full h-auto"
          priority={false}
        />
        {value.caption && (
          <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 px-6 sm:px-12 font-light">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    video: ({ value }: any) => {
      const getEmbedUrl = (url: string, type: string) => {
        switch (type) {
          case 'youtube':
            // Convert YouTube watch URLs to embed URLs
            const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
            return youtubeMatch ? `https://www.youtube.com/embed/${youtubeMatch[1]}` : url
          
          case 'vimeo':
            // Convert Vimeo URLs to embed URLs
            const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
            return vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` : url
          
          case 'loom':
            // Convert Loom share URLs to embed URLs
            const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
            return loomMatch ? `https://www.loom.com/embed/${loomMatch[1]}` : url
          
          default:
            return url
        }
      }

      const getAspectRatioClass = (ratio: string) => {
        switch (ratio) {
          case '4:3': return 'aspect-[4/3]'
          case '1:1': return 'aspect-square'
          default: return 'aspect-video' // 16:9
        }
      }

      const aspectRatioClass = getAspectRatioClass(value.aspectRatio || '16:9')

      return (
        <figure className="my-12 -mx-6 sm:-mx-12">
          {value.title && (
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4 px-6 sm:px-12">
              {value.title}
            </h3>
          )}
          <div className={`${aspectRatioClass} rounded-xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800`}>
            {value.videoType === 'upload' && value.file ? (
              <video 
                controls 
                className="w-full h-full object-cover"
                preload="metadata"
              >
                <source src={value.file.asset.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : value.url ? (
              <iframe
                src={getEmbedUrl(value.url, value.videoType)}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={value.title || 'Video'}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <span>Video not available</span>
              </div>
            )}
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 px-6 sm:px-12 font-light">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  marks: {
    link: ({ children, value }: any) => (
      <Link 
        href={value.href} 
        className="text-blue-600 hover:text-blue-800 underline"
        target={value.href.startsWith('http') ? '_blank' : '_self'}
        rel={value.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </Link>
    ),
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-5xl font-light tracking-tight text-gray-900 dark:text-white mb-8 mt-12">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-4xl font-light tracking-tight text-gray-900 dark:text-white mb-6 mt-16">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-4 mt-12">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-3 mt-8">
        {children}
      </h4>
    ),
    normal: ({ children }: any) => (
      <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 mb-6">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-8 my-12 text-xl italic text-gray-600 dark:text-gray-400 font-light">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="space-y-3 mb-8 ml-6">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal space-y-3 mb-8 ml-6">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 relative">
        <span className="absolute -left-6 top-0 text-gray-400">•</span>
        {children}
      </li>
    ),
    number: ({ children }: any) => (
      <li className="text-xl leading-relaxed text-gray-700 dark:text-gray-300">
        {children}
      </li>
    ),
  },
}

interface PortableTextProps {
  value: any
  className?: string
}

export function PortableText({ value, className = '' }: PortableTextProps) {
  return (
    <div className={`prose prose-lg max-w-none dark:prose-invert ${className}`}>
      <BasePortableText 
        value={value} 
        components={portableTextComponents}
      />
    </div>
  )
}

export default PortableText