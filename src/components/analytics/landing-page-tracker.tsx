'use client'

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useSearchParams } from 'next/navigation';

interface Feature {
  _id: string;
  title: string;
  description: string;
  isHero: boolean;
  order: number;
}

interface UseCase {
  _id: string;
  title: string;
  description: string;
  category: "insurance" | "b2b";
  order: number;
  productName?: "Zara" | "Mercury";
}

interface LandingPageTrackerProps {
  features: Feature[];
  useCases: UseCase[];
}

export function LandingPageTracker({ features, useCases }: LandingPageTrackerProps) {
  const posthog = usePostHog();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthog) return;

    // Capture enhanced landing page view with UTM attribution
    const utmData = {
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_content: searchParams.get('utm_content'),
      utm_term: searchParams.get('utm_term'),
    };

    // Determine traffic source quality
    let traffic_source_quality = 'unknown';
    if (utmData.utm_source) {
      const paidSources = ['google', 'facebook', 'linkedin', 'twitter', 'bing'];
      const organicSources = ['organic', 'direct', 'referral'];

      if (paidSources.some(source => utmData.utm_source?.includes(source)) && utmData.utm_medium === 'cpc') {
        traffic_source_quality = 'paid_high_intent';
      } else if (utmData.utm_medium === 'email') {
        traffic_source_quality = 'email_nurture';
      } else if (organicSources.includes(utmData.utm_source)) {
        traffic_source_quality = 'organic_discovery';
      } else {
        traffic_source_quality = 'other_paid';
      }
    }

    // Track comprehensive landing page view
    posthog.capture('landing_page_viewed', {
      page_type: 'homepage',
      ...utmData,
      traffic_source_quality,
      referrer: document.referrer || 'direct',
      features_count: features.length,
      use_cases_count: useCases.length,
      hero_features: features.filter(f => f.isHero).length,
      b2b_use_cases: useCases.filter(uc => uc.category === 'b2b').length,
      insurance_use_cases: useCases.filter(uc => uc.category === 'insurance').length,
      timestamp: new Date().toISOString(),
    });

    // Set initial user properties for segmentation
    posthog.setPersonProperties({
      landing_page_viewed: true,
      initial_landing_page: '/',
      initial_utm_source: utmData.utm_source,
      initial_utm_medium: utmData.utm_medium,
      initial_utm_campaign: utmData.utm_campaign,
      initial_traffic_source_quality: traffic_source_quality,
      landing_page_view_date: new Date().toISOString(),
      features_exposed: features.length,
      use_cases_exposed: useCases.length,
    });

    // Track acquisition channel effectiveness
    if (utmData.utm_source || utmData.utm_medium) {
      posthog.capture('acquisition_channel_hit', {
        channel: utmData.utm_source || 'unknown',
        medium: utmData.utm_medium || 'unknown',
        campaign: utmData.utm_campaign || 'unknown',
        quality_score: traffic_source_quality,
        landing_content_quality: {
          features_available: features.length,
          use_cases_available: useCases.length,
          has_hero_content: features.some(f => f.isHero),
        }
      });
    }

    // Store UTM data in localStorage for session tracking
    if (utmData.utm_source) {
      localStorage.setItem('consuelo_attribution', JSON.stringify({
        ...utmData,
        traffic_source_quality,
        landing_timestamp: new Date().toISOString(),
      }));
    }

  }, [posthog, searchParams, features, useCases]);

  return null; // This component only handles tracking
}