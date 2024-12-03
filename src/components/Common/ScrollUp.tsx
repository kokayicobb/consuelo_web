'use client'

import { useEffect, useCallback } from 'react'

export default function ScrollUp() {
  const scrollToTop = useCallback(() => {
    const scrollingElement = window.document.scrollingElement || window.document.body
    const currentScrollPosition = scrollingElement.scrollTop

    // Only scroll if not already at the top
    if (currentScrollPosition > 0) {
      window.requestAnimationFrame(() => {
        scrollingElement.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      })
    }
  }, [])

  useEffect(() => {
    // Delay the scroll to ensure all content is loaded
    const timeoutId = setTimeout(scrollToTop, 100)

    return () => clearTimeout(timeoutId)
  }, [scrollToTop])

  return null
}

