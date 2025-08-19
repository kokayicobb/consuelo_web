// src/components/Features/index.tsx
import type React from "react"
import { BentoGrid, BentoGridItem } from "../ui/bento-grid"
import { IconShirt, IconRuler, IconCube, IconChartBar, IconMail, IconLock } from "@tabler/icons-react"
import { urlFor } from "@/sanity/lib/image"

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
  href: string
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

  

  const getImageUrl = (item: Feature) => {
    if (item.image) {
      return urlFor(item.image).url()
    }
    return item.imagePath || ""
  }

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
              href={heroItem.href}
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
              backgroundImage={getImageUrl(item)}
              href={item.href}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}

export default Features