"use client"
// src/components/Features/index.tsx
import type React from "react"
import { BentoGrid, BentoGridItem } from "../ui/bento-grid"
import { IconShirt, IconRuler, IconCube, IconChartBar, IconMail, IconLock } from "@tabler/icons-react"
import { urlFor } from "@/sanity/lib/image"
import { useOptimizedImage } from "@/hooks/use-cached-image"

interface BackgroundPatternProps {
  children: React.ReactNode
  className?: string
  gradientFrom: string
  gradientTo: string
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ children, className, gradientFrom, gradientTo }) => (
  <div className={`relative overflow-hidden rounded-xl ${className}`}>
    <div className={`absolute inset-0 opacity-70 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}></div>
    <div className="absolute inset-0 opacity-30">{children}</div>
  </div>
)

interface Feature {
  _id: string
  title: string
  description: string
  image?: any
  imagePath?: string
  slug: { current: string }
  isHero: boolean
  gradientFrom: string
  gradientTo: string
  order: number
}

interface FeaturesProps {
  features: Feature[]
}

export function Features({ features }: FeaturesProps) {
  // Get the hero item
  const heroItem = features.find((item) => item.isHero)

  // Get all other items except the hero, sorted by order
  const regularItems = features
    .filter((item) => !item.isHero)
    .sort((a, b) => a.order - b.order)

  // Cache optimized images for hero item
  const heroImageData = useOptimizedImage(heroItem?.image, 'hero')
  
  // Call hooks for each regular item individually at top level
  const regularImageData = [
    useOptimizedImage(regularItems[0]?.image, 'feature'),
    useOptimizedImage(regularItems[1]?.image, 'feature'),
    useOptimizedImage(regularItems[2]?.image, 'feature'),
    useOptimizedImage(regularItems[3]?.image, 'feature'),
    useOptimizedImage(regularItems[4]?.image, 'feature'),
    useOptimizedImage(regularItems[5]?.image, 'feature'),
  ]

  const getImageUrl = (item: Feature, index?: number) => {
    if (item.image) {
      if (item.isHero) {
        return heroImageData.imageUrl;
      } else {
        return regularImageData[index || 0]?.imageUrl || "";
      }
    }
    return item.imagePath || ""
  }

  // Debug: Log the features to see what we're getting
  console.log('Features data:', features.map(f => ({ title: f.title, slug: f.slug })))

  return (
    <section
      className="bg-transparent pt-8 sm:pt-12 pb-8 sm:pb-12"
      style={{ minHeight: "0vh", paddingBottom: "0vh" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BentoGrid>
          {/* Hero item */}
          {heroItem && (
            <BentoGridItem
              title={heroItem.title}
              description={heroItem.description}
              header={
                <BackgroundPattern 
                  gradientFrom={heroItem.gradientFrom} 
                  gradientTo={heroItem.gradientTo}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="white" strokeWidth="2" />
                    <path d="M20,70 Q35,40 50,70 T80,70" fill="none" stroke="white" strokeWidth="2" />
                  </svg>
                </BackgroundPattern>
              }
              icon={<IconLock className="h-8 w-8 text-accent" />}
              backgroundImage={getImageUrl(heroItem)}
              isHero={true}
              href={`/${(heroItem.slug?.current || 'test-slug').replace(/^.*\//, '').trim()}`}
            />
          )}

          {/* Regular items */}
          {regularItems.map((item, i) => (
            <BentoGridItem
              key={item._id}
              index={i}
              title={item.title}
              description={item.description}
              header={
                <BackgroundPattern 
                  gradientFrom={item.gradientFrom} 
                  gradientTo={item.gradientTo}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="white" strokeWidth="2" />
                    <path d="M20,70 Q35,40 50,70 T80,70" fill="none" stroke="white" strokeWidth="2" />
                  </svg>
                </BackgroundPattern>
              }
              icon={<IconChartBar className="h-8 w-8 text-accent" />}
              backgroundImage={getImageUrl(item, i)}
              href={`/${(item.slug?.current || 'test-slug').replace(/^.*\//, '').trim()}`}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}

export default Features