# PostHog Analytics Implementation Plan
*For Launch Mode - Getting First Paying Customers*

## Executive Summary
This plan optimizes PostHog analytics for conversion tracking and revenue optimization during product launch. Focus: track every step from visitor → signup → trial → paying customer.

## Current State Analysis

### ✅ What's Working
- PostHog initialized with session recording
- Basic autocapture enabled
- Clerk user authentication system
- Stripe payment processing with webhooks
- Enhanced PostHog config in dashboard components

### ❌ Critical Gaps
- **No user identification** - PostHog doesn't know who users are
- **Missing conversion funnel** - Can't track visitor → customer journey
- **No revenue attribution** - Can't connect payments to user behavior
- **Limited engagement tracking** - Missing product usage depth metrics

## Implementation Priority (Launch Mode)

### 🔥 Phase 1: Conversion Funnel (Week 1)
**Goal**: Track complete visitor → paying customer journey

**Critical Events**:
```javascript
// Landing Page
posthog.capture('landing_page_viewed', {
  traffic_source: utm_source,
  referrer: document.referrer,
  page_variant: 'v1'
})

posthog.capture('signup_button_clicked', {
  location: 'hero' | 'pricing' | 'navigation',
  user_intent: 'trial' | 'demo' | 'pricing'
})

// Signup Flow
posthog.capture('signup_completed', {
  signup_method: 'email' | 'google' | 'github',
  traffic_source: utm_source,
  time_to_signup: duration_ms
})

// First Product Experience
posthog.capture('first_session_started', {
  scenario_selected: scenario_name,
  time_since_signup: duration_minutes
})

posthog.capture('aha_moment', {
  session_duration: duration_minutes,
  completion_status: 'completed' | 'partial',
  satisfaction_signals: ['feedback_requested', 'positive_reaction']
})
```

**Key Files**:
- `src/app/page.tsx` (landing)
- `src/app/layout.tsx` (signup)
- `src/app/(site)/roleplay/page.tsx` (product)

### 🔥 Phase 2: Revenue Tracking (Week 1)
**Goal**: Optimize payment conversion and track LTV

**Revenue Events**:
```javascript
// Payment Intent
posthog.capture('payment_flow_started', {
  trigger_context: 'onboarding' | 'low_balance' | 'feature_gate',
  credit_amount: selected_amount,
  user_balance: current_credits
})

posthog.capture('payment_completed', {
  transaction_id: stripe_session_id,
  revenue: amount_usd,
  credits_purchased: credit_amount,
  payment_method: 'card' | 'apple_pay',
  customer_ltv_estimate: calculated_ltv
})

// Revenue Attribution
posthog.capture('customer_acquired', {
  first_payment_amount: amount,
  days_to_conversion: signup_to_payment_days,
  acquisition_source: original_utm_source,
  total_sessions_before_payment: session_count
})
```

**Key Files**:
- `src/components/roleplay/PaymentModal.tsx`
- `src/app/api/stripe/webhook/route.ts`
- `src/components/roleplay/CreditsDisplay.tsx`

### 🔥 Phase 3: Product Engagement (Week 2)
**Goal**: Understand feature usage and product-market fit signals

**Engagement Events**:
```javascript
// Feature Usage Depth
posthog.capture('session_quality_high', {
  duration_minutes: session_length,
  interactions_count: total_interactions,
  completion_rate: percentage,
  user_satisfaction: 'high' | 'medium' | 'low'
})

posthog.capture('repeat_usage', {
  session_number: current_session_count,
  days_since_first: days_active,
  usage_pattern: 'power_user' | 'regular' | 'casual',
  feature_expansion: expanded_features_list
})

// Value Realization
posthog.capture('skill_improvement_detected', {
  improvement_metric: 'feedback_score' | 'session_length' | 'completion_rate',
  improvement_amount: percentage_increase,
  sessions_to_improvement: session_count
})
```

**Key Files**:
- All `src/components/roleplay/` components
- Session tracking in roleplay page

### 🔥 Phase 4: User Segmentation (Week 2)
**Goal**: Identify who converts and optimize for those personas

**Segmentation Properties**:
```javascript
// User Identification (on signup)
posthog.identify(clerk_user_id, {
  email: user_email,
  signup_date: new Date(),
  acquisition_source: utm_source,
  first_action: 'demo' | 'pricing' | 'blog',
  user_segment: 'enterprise' | 'smb' | 'individual'
})

// Behavioral Segmentation
posthog.capture('user_segment_identified', {
  segment_type: 'power_user' | 'evaluator' | 'casual',
  engagement_score: calculated_score,
  conversion_likelihood: 'high' | 'medium' | 'low',
  feature_preferences: preferred_features_array
})
```

**Key Files**:
- Create: `src/hooks/usePostHogIdentify.ts`
- Update: `src/app/layout.tsx`
- Update: `src/app/providers.tsx`

### 🔥 Phase 5: Launch Dashboard (Week 3)
**Goal**: Real-time insights for launch optimization

**Dashboard Metrics**:
- **Conversion Funnel**: Visitor → Signup → Trial → Payment (%)
- **Revenue Metrics**: Daily revenue, MRR, LTV, CAC
- **Product Metrics**: DAU, session quality, feature adoption
- **Launch KPIs**: Signup velocity, payment conversion, user retention

**A/B Testing Framework**:
- Landing page variations
- Pricing experiments
- Onboarding flows
- Feature introduction sequences

## Success Metrics (30-Day Launch Goals)

### Primary KPIs
- **Conversion Rate**: Landing → Signup (target: 15%+)
- **Trial → Payment**: First payment within 7 days (target: 20%+)
- **Revenue Growth**: Weekly revenue increase (target: 50%+)
- **User Engagement**: Average sessions per user (target: 3+)

### Secondary KPIs
- **Customer Acquisition Cost**: < $50 per customer
- **Customer Lifetime Value**: > $150 per customer
- **Product Market Fit**: NPS > 50, retention > 40%
- **Feature Adoption**: Core feature usage > 80%

## Technical Implementation Notes

### PostHog Configuration
```javascript
// Enhanced initialization for launch tracking
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: 'https://us.i.posthog.com',
  person_profiles: 'identified_only',

  // Launch-optimized settings
  autocapture: true,
  capture_pageview: true,
  session_recording: {
    maskAllInputs: false,
    recordCrossOriginIframes: true,
  },

  // Revenue tracking
  capture_performance: true,
  bootstrap: {
    featureFlags: {
      'conversion_optimization': true,
      'revenue_tracking': true
    }
  },

  // Launch cohorts
  loaded: function(posthog) {
    // Identify launch cohort users
    posthog.capture('launch_cohort_user', {
      cohort_start_date: '2025-09-13',
      launch_phase: 'early_access'
    })
  }
})
```

### User Properties Schema
```javascript
// Standard user properties for segmentation
const userProperties = {
  // Identity
  clerk_id: string,
  email: string,
  signup_date: Date,

  // Acquisition
  traffic_source: string,
  referrer: string,
  utm_campaign: string,
  landing_page: string,

  // Behavior
  total_sessions: number,
  days_active: number,
  feature_usage: array,
  engagement_score: number,

  // Revenue
  ltv: number,
  total_revenue: number,
  payment_count: number,
  avg_session_value: number,

  // Segmentation
  user_type: 'power_user' | 'casual' | 'evaluator',
  conversion_likelihood: 'high' | 'medium' | 'low',
  churn_risk: 'high' | 'medium' | 'low'
}
```

### Event Properties Schema
```javascript
// Standard event properties for analysis
const eventProperties = {
  // Context
  page_url: string,
  user_agent: string,
  session_id: string,
  timestamp: Date,

  // User Journey
  funnel_step: string,
  previous_action: string,
  time_since_last_action: number,
  session_duration: number,

  // Business Context
  revenue_impact: number,
  conversion_value: number,
  feature_category: string,
  user_intent: string,

  // Technical
  load_time: number,
  error_occurred: boolean,
  performance_score: number
}
```

## Launch Optimization Playbook

### Week 1: Foundation
1. Deploy conversion funnel tracking
2. Implement revenue attribution
3. Set up user identification
4. Launch basic dashboard

### Week 2: Optimization
1. Analyze initial conversion data
2. Implement A/B tests for drop-off points
3. Enhanced product engagement tracking
4. Customer segment identification

### Week 3: Scale
1. Advanced dashboard with cohort analysis
2. Automated insights and alerts
3. Revenue optimization experiments
4. Product-market fit measurement

### Week 4: Growth
1. Expand successful acquisition channels
2. Optimize pricing based on data
3. Feature development prioritization
4. Customer success automation

## ROI Expectations

### Immediate (Week 1-2)
- **Identify conversion bottlenecks** → 10-20% conversion improvement
- **Optimize payment flow** → 15-25% revenue increase
- **User behavior insights** → Better product decisions

### Medium-term (Month 1-2)
- **Customer segmentation** → 30%+ improvement in targeting
- **Feature usage optimization** → 25%+ engagement increase
- **Revenue attribution** → 50%+ improvement in CAC/LTV ratios

### Long-term (Month 2-6)
- **Product-market fit validation** → Sustainable growth foundation
- **Automated optimization** → Continuous conversion improvements
- **Predictive analytics** → Proactive customer success

---

*This plan is optimized for getting your first 100 paying customers. Each implementation phase builds on the previous one and focuses on immediate actionable insights for conversion optimization.*