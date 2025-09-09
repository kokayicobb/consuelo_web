"use client"

import * as React from "react"
import Link from "next/link"

interface UseCase {
  _id: string
  title: string
  description: string
  slug: { current: string }
  category: string
  loomVideoUrl: string
  altText: string
  order: number
  productName?: string
}

interface UseCasesGridProps {
  useCases: UseCase[]
}

const UseCasesGrid: React.FC<UseCasesGridProps> = ({ useCases }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {useCases.map((useCase) => (
        <UseCaseCard
          key={useCase._id}
          useCase={useCase}
        />
      ))}
    </div>
  )
}

const UseCaseCard: React.FC<{ useCase: UseCase }> = ({ useCase }) => {
  const getLoomEmbedUrl = (url: string) => {
    const videoId = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1]
    return videoId 
      ? `https://www.loom.com/embed/${videoId}?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true&autoplay=false`
      : url
  }

  const embedUrl = getLoomEmbedUrl(useCase.loomVideoUrl)

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white dark:bg-transparent shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/${(useCase.slug?.current || 'test-slug').replace(/^.*\//, '').trim()}`}>
        {/* Media Container */}
        <div className="relative aspect-video overflow-hidden">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media"
            loading="lazy"
            title={useCase.altText}
          />
          {/* Video overlay for better visual consistency */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10"></div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            {useCase.category && (
              <span className="px-2 py-1 text-xs font-medium bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-full">
                {useCase.category}
              </span>
            )}
            {useCase.productName && (
              <span className="px-2 py-1 text-xs font-medium bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-full">
                {useCase.productName}
              </span>
            )}
          </div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            {useCase.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {useCase.description}
          </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="px-4 py-2 text-center font-medium text-white bg-black/80 rounded-lg backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            View Use Case
          </span>
        </div>
      </Link>
    </div>
  )
}

export default UseCasesGrid