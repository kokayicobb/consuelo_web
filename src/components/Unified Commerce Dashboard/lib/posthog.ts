import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
    person_profiles: 'always',
    
    // Enhanced session recording
    session_recording: {
      maskAllInputs: false,
      recordCrossOriginIframes: true,
    },
    
    // Web analytics autocapture
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    
    // Enhanced tracking
    enable_recording_console_log: true,
    rageclick: true,
    
    // Performance tracking
    capture_performance: true,
    
    // Privacy settings
    respect_dnt: true,
    
    // Advanced features
    bootstrap: {
      distinctID: undefined,
      isIdentifiedID: false,
      featureFlags: {},
      featureFlagPayloads: {},
    },
    
    // Custom properties
    loaded: function(posthog) {
      // Track initial page load with custom properties
      posthog.capture('page_loaded', {
        page_title: document.title,
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      })
    }
  })
  
  // Track custom dashboard events
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args)
    posthog.capture('$pageview')
  }
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args)
    posthog.capture('$pageview')
  }
  
  window.addEventListener('popstate', () => {
    posthog.capture('$pageview')
  })
}

export { posthog }