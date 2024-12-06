'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./scene'), {
  ssr: false,
  loading: () => <div>Loading 3D model...</div>
})

export default function ModelViewer({ images, modelPosition, modelRotation }) {
  const [showModel, setShowModel] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        {showModel ? (
          <Scene modelPosition={modelPosition} modelRotation={modelRotation} />
        ) : (
          <Image
            src={images[currentImageIndex]}
            alt={`Equestrian Helmet View ${currentImageIndex + 1}`}
            fill
            className="rounded-lg object-cover"
          />
        )}
        {!showModel && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={() =>
                setCurrentImageIndex((prev) =>
                  prev > 0 ? prev - 1 : images.length - 1
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() =>
                setCurrentImageIndex((prev) =>
                  prev < images.length - 1 ? prev + 1 : 0
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <div className="flex space-x-2 overflow-x-auto">
        <div
          className={`flex h-20 w-20 cursor-pointer items-center justify-center rounded bg-gray-200 ${
            showModel ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setShowModel(true)}
        >
          3D
        </div>
        {images.map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`Thumbnail ${index + 1}`}
            width={80}
            height={80}
            className={`cursor-pointer rounded object-cover ${
              index === currentImageIndex && !showModel
                ? "ring-2 ring-primary"
                : ""
            }`}
            onClick={() => {
              setCurrentImageIndex(index)
              setShowModel(false)
            }}
          />
        ))}
      </div>
    </div>
  )
}

