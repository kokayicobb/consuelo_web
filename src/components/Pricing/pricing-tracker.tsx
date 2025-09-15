'use client'

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useInView } from 'react-intersection-observer';

interface PricingFeature {
  _id: string;
  name: string;
  description?: string;
  category: string;
  order: number;
}

interface PricingPlan {
  _id: string;
  name: string;
  slug: { current: string };
  monthlyPrice: number;
  description: string;
  cta: string;
  popular: boolean;
  beta: boolean;
  level: string;
  order: number;
  features: PricingFeature[];
}

interface PricingTrackerProps {
  plans: PricingPlan[];
}

export function PricingTracker({ plans }: PricingTrackerProps) {
  const posthog = usePostHog();
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView && posthog) {
      // Track pricing section view for conversion analysis
      posthog.capture('pricing_viewed', {
        plans_shown: plans.map(plan => ({
          name: plan.name,
          price: plan.monthlyPrice,
          level: plan.level,
          popular: plan.popular,
          beta: plan.beta,
        })),
        total_plans: plans.length,
        view_time: new Date().toISOString(),
        section: 'pricing',
      });

      // Set user property for conversion likelihood
      posthog.setPersonProperties({
        has_viewed_pricing: true,
        pricing_view_date: new Date().toISOString(),
        plans_available: plans.length,
      });
    }
  }, [inView, posthog, plans]);

  return <div ref={ref} className="absolute" />;
}