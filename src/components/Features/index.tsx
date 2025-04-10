"use client"

// src/components/Features/index.tsx
import type React from "react"
import { useEffect, useRef } from "react"
import { BentoGrid, BentoGridItem } from "../ui/bento-grid"
import { IconShirt, IconRuler, IconCube, IconChartBar, IconMail, IconLock } from "@tabler/icons-react"

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

export function Features() {
  // Get the hero item (using AI Commerce Suite which has md:col-span-2 in the original)
  const heroItem = items.find((item) => item.title === "AI Commerce Suite")

  // Get all other items except the hero
  const regularItems = items.filter((item) => item.title !== "AI Commerce Suite")

  // Ref for the section
  const sectionRef = useRef<HTMLElement>(null)

  // Add extra space to ensure scrolling
  useEffect(() => {
    if (sectionRef.current) {
      // Add a spacer div after the section to ensure scrolling
      const spacer = document.createElement("div")
      spacer.style.height = "50vh"
      spacer.style.width = "100%"

      if (sectionRef.current.parentNode) {
        sectionRef.current.parentNode.insertBefore(spacer, sectionRef.current.nextSibling)
      }

      return () => {
        if (spacer.parentNode) {
          spacer.parentNode.removeChild(spacer)
        }
      }
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bg-transparent pt-8 sm:pt-12 pb-8 sm:pb-12"
      style={{ minHeight: "150vh", paddingBottom: "30vh" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BentoGrid>
          {/* Hero item */}
          {heroItem && (
            <BentoGridItem
              title={heroItem.title}
              description={heroItem.description}
              header={
                heroItem.header || (
                  <BackgroundPattern gradientFrom="from-purple-500" gradientTo="to-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
                      <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="white" strokeWidth="2" />
                      <path d="M20,70 Q35,40 50,70 T80,70" fill="none" stroke="white" strokeWidth="2" />
                    </svg>
                  </BackgroundPattern>
                )
              }
              icon={heroItem.icon}
              backgroundImage={heroItem.image}
              isHero={true}
              href={heroItem.href}
            />
          )}

          {/* Regular items for the right column */}
          {regularItems.map((item, i) => (
            <BentoGridItem
              key={i}
              index={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              backgroundImage={item.image}
              href={
                item.title === "Klaviyo Integration"
                  ? "/integrations/klaviyo"
                  : item.title === "Automated Marketing"
                    ? "/marketing"
                  : item.title === "AI Shopping Assistant"
                      ? "/ai-assistant"
                      : item.title === "Analytics Dashboard"
                        ? "/dashboard"
                        : item.title === "Contact"
                          ? "/contact"
                          : item.title === "Data Security"
                            ? "/security"
                            : item.href || "#"
              }
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}

const items = [
  {
    title: "AI Commerce Suite",
    image: "/long.jpeg",
    description: "Product | 8 min read",
    className: "md:col-span-2",
    href: "/platform",
  },
  {
    title: "Klaviyo Integration",
    image: "/blueBackground.jpeg",
    description: "Integration | 5 min read",
    header: (
      <BackgroundPattern gradientFrom="from-purple-500" gradientTo="to-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="white" strokeWidth="2" />
          <path d="M20,70 Q35,40 50,70 T80,70" fill="none" stroke="white" strokeWidth="2" />
          <circle cx="30" cy="30" r="8" fill="white" fillOpacity="0.2" />
          <circle cx="70" cy="40" r="10" fill="white" fillOpacity="0.2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconShirt className="h-8 w-8 text-accent" />,
  },
  {
    title: "Automated Marketing",
    image: "/blueBackground.jpeg",
    description: "Automation | 6 min read",
    header: (
      <BackgroundPattern gradientFrom="from-blue-500" gradientTo="to-cyan-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <line x1="10" y1="20" x2="90" y2="20" stroke="white" strokeWidth="2" />
          <line x1="10" y1="40" x2="90" y2="40" stroke="white" strokeWidth="2" />
          <line x1="10" y1="60" x2="90" y2="60" stroke="white" strokeWidth="2" />
          <line x1="10" y1="80" x2="90" y2="80" stroke="white" strokeWidth="2" />
          <line x1="20" y1="10" x2="20" y2="90" stroke="white" strokeWidth="2" />
          <line x1="40" y1="10" x2="40" y2="90" stroke="white" strokeWidth="2" />
          <line x1="60" y1="10" x2="60" y2="90" stroke="white" strokeWidth="2" />
          <line x1="80" y1="10" x2="80" y2="90" stroke="white" strokeWidth="2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconRuler className="h-8 w-8 text-accent" />,
  },
  {
    title: "AI Shopping Assistant",
    image: "/long.jpeg",
    description: "AI Agent | 4 min read",
    header: (
      <BackgroundPattern gradientFrom="from-cyan-500" gradientTo="to-teal-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <path d="M10,90 L50,10 L90,90 Z" fill="none" stroke="white" strokeWidth="2" />
          <path d="M30,70 L50,30 L70,70" fill="none" stroke="white" strokeWidth="2" />
          <path d="M10,90 L90,90" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconCube className="h-8 w-8 text-accent" />,
  },
  {
    title: "Analytics Dashboard",
    image: "/greenBackground.jpeg",
    description: "Platform | 7 min read",
    header: (
      <BackgroundPattern gradientFrom="from-teal-500" gradientTo="to-purple-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <rect x="10" y="20" width="20" height="60" fill="white" fillOpacity="0.2" />
          <rect x="40" y="40" width="20" height="40" fill="white" fillOpacity="0.2" />
          <rect x="70" y="30" width="20" height="50" fill="white" fillOpacity="0.2" />
          <circle cx="20" cy="15" r="5" fill="white" fillOpacity="0.2" />
          <circle cx="50" cy="35" r="5" fill="white" fillOpacity="0.2" />
          <circle cx="80" cy="25" r="5" fill="white" fillOpacity="0.2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconChartBar className="h-8 w-8 text-accent" />,
    className: "md:col-span-2",
  },
  {
    title: "Contact",
    image: "/Square2.jpeg",
    description: "Support | 2 min read",
    header: (
      <BackgroundPattern gradientFrom="from-purple-500" gradientTo="to-pink-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <path d="M10,20 L50,50 L90,20 L90,80 L10,80 Z" fill="none" stroke="white" strokeWidth="2" />
          <path d="M10,20 L50,50 L90,20" fill="none" stroke="white" strokeWidth="2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconMail className="h-8 w-8 text-accent" />,
  },
  {
    title: "Data Security",
    image: "/blueGreenBackground.jpeg",
    description: "Security | 5 min read",
    header: (
      <BackgroundPattern gradientFrom="from-blue-500" gradientTo="to-purple-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2" />
          <path d="M50,10 L50,90 M10,50 L90,50" stroke="white" strokeWidth="2" />
          <path d="M30,30 L70,70 M30,70 L70,30" stroke="white" strokeWidth="2" />
        </svg>
      </BackgroundPattern>
    ),
    icon: <IconLock className="h-8 w-8 text-accent" />,
  },
]

export default Features