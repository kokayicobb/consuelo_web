// app/providers.tsx
'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { usePostHog } from 'posthog-js/react'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: 'https://consuelohq.com/ingest',
      ui_host: 'https://us.posthog.com',
      person_profiles: 'always', // creates profiles for both identified and anonymous users

      // Enhanced session recording for UX insights
      session_recording: {
        maskAllInputs: false,
        recordCrossOriginIframes: true,
        maskTextSelector: '[data-private]', // Mask elements with data-private attribute
      },

      // Advanced autocapture for conversion analysis
      autocapture: {
        dom_event_allowlist: ['click', 'change', 'submit'], // Capture key interaction events
        url_allowlist: ['/roleplay', '/pricing', '/'] // Focus on key pages
      },

      // Capture key user actions automatically
      capture_pageview: true,
      capture_pageleave: true,

      // Enhanced tracking for sales insights
      enable_recording_console_log: true,
      rageclick: true, // Track user frustration

      // Performance and conversion tracking
      capture_performance: true,

      // Privacy compliance
      respect_dnt: true,

      // Custom page tracking for acquisition analysis
      loaded: function(posthog) {
        // Enhanced page load tracking with attribution data
        const urlParams = new URLSearchParams(window.location.search)
        const utmData = {
          utm_campaign: urlParams.get('utm_campaign'),
          utm_medium: urlParams.get('utm_medium'),
          utm_source: urlParams.get('utm_source'),
          utm_content: urlParams.get('utm_content'),
          utm_term: urlParams.get('utm_term'),
        }

        posthog.capture('enhanced_page_loaded', {
          page_title: document.title,
          page_url: window.location.href,
          page_path: window.location.pathname,
          referrer: document.referrer || 'direct',
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          viewport_size: `${window.innerWidth}x${window.innerHeight}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          is_mobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
          connection_type: (navigator as any).connection?.effectiveType || 'unknown',
          ...utmData
        })
      }
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}
