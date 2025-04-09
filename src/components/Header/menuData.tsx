//src/components/Header/menuData.tsx
"use client"

import { Button } from "@/components/ui/button"

import Link from "next/link"

import { cn } from "@/lib/utils"

import React from "react"

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check if header should be hidden
  const shouldHide = typeof document !== "undefined" && document.body.getAttribute("data-hide-header") === "true"

  // Return null if the header should be hidden
  if (shouldHide) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top header bar - always visible */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 bg-transparent",
          isScrolled && "backdrop-blur-sm bg-background",
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold">OpenAI</span>
          </Link>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="sr-only">Search</span>
            </Button>
            <Link href="/login">
              <Button variant="outline" className="rounded-md">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Left side navigation - part of the L shape */}
      <div className="container flex flex-1">
        <div className="w-48 pt-8">
          <nav className="flex flex-col space-y-4">
            <Link href="/research" className="text-sm hover:text-primary transition-colors">
              Research
            </Link>
            <Link href="/safety" className="text-sm hover:text-primary transition-colors">
              Safety
            </Link>
            <Link href="/chatgpt" className="text-sm hover:text-primary transition-colors">
              ChatGPT
            </Link>
            <Link href="/sora" className="text-sm hover:text-primary transition-colors">
              Sora
            </Link>
            <Link href="/api" className="text-sm hover:text-primary transition-colors">
              API Platform
            </Link>
            <Link href="/business" className="text-sm hover:text-primary transition-colors">
              For Business
            </Link>
            <Link href="/stories" className="text-sm hover:text-primary transition-colors">
              Stories
            </Link>
            <Link href="/company" className="text-sm hover:text-primary transition-colors">
              Company
            </Link>
            <Link href="/news" className="text-sm hover:text-primary transition-colors">
              News
            </Link>
          </nav>
        </div>

       
      </div>
    </div>
  )
}
