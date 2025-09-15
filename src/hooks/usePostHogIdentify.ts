'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePostHog } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'

interface UserIdentificationData {
  clerk_id: string
  email?: string
  signup_date: string
  traffic_source: string
  first_action: string
  landing_page: string
  referrer: string
  utm_campaign?: string
  utm_medium?: string
  utm_source?: string
  utm_content?: string
  utm_term?: string
}

interface BehavioralSegmentation {
  user_type_identified: 'power_user' | 'casual' | 'evaluator' | 'new_user'
  conversion_likelihood: 'high' | 'medium' | 'low' | 'unknown'
  feature_preference: 'voice_focused' | 'text_focused' | 'mixed' | 'unknown'
  support_needs: 'self_serve' | 'needs_help' | 'unknown'
}

export function usePostHogIdentify() {
  const { user, isSignedIn, isLoaded } = useUser()
  const posthog = usePostHog()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const identifiedRef = useRef(false)
  const actionsRef = useRef<string[]>([])

  // Capture UTM parameters and referrer info
  const captureTrafficSource = useCallback(() => {
    if (typeof window === 'undefined') return null

    const urlParams = new URLSearchParams(window.location.search)
    const referrer = document.referrer || 'direct'

    // Extract UTM parameters
    const utmData = {
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_source: urlParams.get('utm_source') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
    }

    // Determine traffic source
    let traffic_source = 'direct'
    if (utmData.utm_source) {
      traffic_source = utmData.utm_source
    } else if (referrer && referrer !== 'direct') {
      const referrerDomain = new URL(referrer).hostname
      if (referrerDomain.includes('google')) traffic_source = 'google_organic'
      else if (referrerDomain.includes('facebook')) traffic_source = 'facebook'
      else if (referrerDomain.includes('linkedin')) traffic_source = 'linkedin'
      else if (referrerDomain.includes('twitter')) traffic_source = 'twitter'
      else traffic_source = 'referral'
    }

    return {
      traffic_source,
      referrer,
      landing_page: window.location.pathname,
      ...utmData
    }
  }, [])

  // Track user actions for behavioral analysis
  const trackAction = useCallback((action: string, properties: Record<string, any> = {}) => {
    if (!posthog || !isSignedIn) return

    actionsRef.current.push(action)

    posthog.capture(action, {
      ...properties,
      timestamp: new Date().toISOString(),
      session_actions_count: actionsRef.current.length,
      previous_actions: actionsRef.current.slice(-5), // Last 5 actions
    })

    // Update behavioral segmentation based on actions
    updateBehavioralSegmentation()
  }, [posthog, isSignedIn])

  // Determine behavioral segmentation
  const updateBehavioralSegmentation = useCallback(() => {
    if (!posthog || !isSignedIn) return

    const actions = actionsRef.current
    const actionCount = actions.length

    // Determine user type based on activity
    let user_type_identified: BehavioralSegmentation['user_type_identified'] = 'new_user'
    if (actionCount > 20) user_type_identified = 'power_user'
    else if (actionCount > 5) user_type_identified = 'casual'
    else if (actionCount > 2) user_type_identified = 'evaluator'

    // Determine conversion likelihood
    let conversion_likelihood: BehavioralSegmentation['conversion_likelihood'] = 'unknown'
    const hasStartedCall = actions.includes('call_started')
    const hasCompletedSession = actions.includes('roleplay_session_completed')
    const hasViewedPricing = actions.includes('pricing_viewed')

    if (hasCompletedSession && hasViewedPricing) conversion_likelihood = 'high'
    else if (hasStartedCall || hasViewedPricing) conversion_likelihood = 'medium'
    else if (actionCount > 3) conversion_likelihood = 'low'

    // Determine feature preference
    let feature_preference: BehavioralSegmentation['feature_preference'] = 'unknown'
    const voiceActions = actions.filter(a => a.includes('voice') || a.includes('call')).length
    const textActions = actions.filter(a => a.includes('text') || a.includes('message')).length

    if (voiceActions > textActions * 2) feature_preference = 'voice_focused'
    else if (textActions > voiceActions * 2) feature_preference = 'text_focused'
    else if (voiceActions > 0 && textActions > 0) feature_preference = 'mixed'

    // Determine support needs
    let support_needs: BehavioralSegmentation['support_needs'] = 'unknown'
    const helpActions = actions.filter(a => a.includes('help') || a.includes('support')).length
    if (helpActions > 2) support_needs = 'needs_help'
    else if (actionCount > 5) support_needs = 'self_serve'

    // Update user properties
    posthog.setPersonProperties({
      user_type_identified,
      conversion_likelihood,
      feature_preference,
      support_needs,
      total_actions: actionCount,
      last_activity: new Date().toISOString(),
    })
  }, [posthog, isSignedIn])

  // Identify user with Clerk data
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || !posthog || identifiedRef.current) {
      return
    }

    const trafficData = captureTrafficSource()
    const signupDate = user.createdAt?.toISOString() || new Date().toISOString()

    const identificationData: UserIdentificationData = {
      clerk_id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      signup_date: signupDate,
      first_action: pathname,
      ...trafficData,
    }

    // Identify user in PostHog
    posthog.identify(user.id, identificationData)

    // Set initial user properties
    posthog.setPersonProperties({
      email: user.primaryEmailAddress?.emailAddress,
      first_name: user.firstName,
      last_name: user.lastName,
      signup_date: signupDate,
      account_creation_source: 'roleplay_page',
      initial_landing_page: trafficData?.landing_page,
      initial_referrer: trafficData?.referrer,
      initial_traffic_source: trafficData?.traffic_source,
      ...trafficData,
    })

    // Track identification event
    posthog.capture('user_identified', {
      identification_method: 'clerk_auth',
      signup_date: signupDate,
      ...identificationData,
    })

    identifiedRef.current = true
  }, [isLoaded, isSignedIn, user, posthog, pathname, captureTrafficSource])

  // Track page views and user progression
  useEffect(() => {
    if (!posthog || !isSignedIn) return

    const page = pathname.split('/').pop() || 'home'

    // Track page view
    posthog.capture('page_view', {
      page,
      full_path: pathname,
      search_params: Object.fromEntries(searchParams.entries()),
    })

    // Track onboarding progression
    if (pathname === '/roleplay') {
      trackAction('onboarding_roleplay_accessed')
    } else if (pathname === '/') {
      trackAction('homepage_viewed')
    }
  }, [pathname, searchParams, posthog, isSignedIn, trackAction])

  // Return tracking functions for components to use
  return {
    trackAction,
    updateSegmentation: updateBehavioralSegmentation,
    isIdentified: identifiedRef.current,
    captureTrafficSource,
  }
}