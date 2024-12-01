// lib/gtag.ts
export const GA_MEASUREMENT_ID = 'G-8NMNGH9RXV' // Replace with your GA measurement ID

// Extend window with gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      target: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer: any[]
  }
}

export const pageview = (url: string, title: string): void => {
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title,
    page_location: window.location.href,
  })
}

interface EventProps {
  action: string
  category: string
  label?: string
  value?: number
  nonInteraction?: boolean
}

export const event = ({
  action,
  category,
  label,
  value,
  nonInteraction = false
}: EventProps): void => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    non_interaction: nonInteraction,
  })
}

interface TimingProps {
  name: string
  value: number
  category?: string
  label?: string
}

export const timing = ({
  name,
  value,
  category,
  label
}: TimingProps): void => {
  window.gtag('event', 'timing_complete', {
    name,
    value,
    event_category: category,
    event_label: label,
  })
}

export const trackEngagementTime = (timeInSeconds: number): void => {
  window.gtag('event', 'user_engagement', {
    engagement_time_msec: timeInSeconds * 1000,
  })
}