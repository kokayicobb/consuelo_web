# User Identification & Segmentation Implementation

## Overview

This implementation provides comprehensive user identification and behavioral segmentation for Consuelo using Clerk authentication and PostHog analytics. The system automatically identifies users upon signup and tracks their behavior to understand conversion patterns.

## Components Added

### 1. User Identification Hook
**File:** `src/hooks/usePostHogIdentify.ts`

Automatically identifies users with Clerk data and tracks behavioral patterns:
- ✅ Identifies users immediately on signup with Clerk ID
- ✅ Sets user properties: signup_date, traffic_source, first_action
- ✅ Tracks user progression through onboarding stages
- ✅ Captures UTM parameters and attribution data
- ✅ Updates behavioral segmentation in real-time

### 2. Enhanced Analytics Integration
**Files:**
- `src/app/providers.tsx` (enhanced PostHog setup)
- `src/app/layout.tsx` (integration layer)
- `src/app/user-identification.tsx` (provider component)

Features:
- ✅ Enhanced session recording for UX insights
- ✅ Advanced autocapture for conversion analysis
- ✅ UTM parameter capture and attribution
- ✅ Performance and frustration tracking (rageclick)

### 3. Behavioral Tracking (Roleplay Page)
**File:** `src/app/(site)/roleplay/page.tsx`

Comprehensive tracking of user interactions:
- ✅ Page access and return visits
- ✅ Call initiation and completion
- ✅ Voice vs text message preferences
- ✅ Scenario selection patterns
- ✅ Feedback generation requests
- ✅ Audio controls usage (mute/unmute)
- ✅ Session duration and engagement metrics

### 4. Landing Page Analytics
**Files:**
- `src/components/analytics/landing-page-tracker.tsx`
- `src/components/Pricing/pricing-tracker.tsx`
- `src/app/page.tsx` (integration)

Tracks:
- ✅ Landing page views with full attribution
- ✅ Pricing section engagement
- ✅ Traffic source quality assessment
- ✅ Referrer analysis and source quality

### 5. User Segmentation Engine
**File:** `src/utils/user-segmentation.ts`

Advanced behavioral analysis:
- ✅ User type classification (power_user, casual, evaluator, new_user)
- ✅ Conversion likelihood scoring (high, medium, low)
- ✅ Feature preference analysis (voice vs text)
- ✅ Support needs assessment (self_serve vs needs_help)
- ✅ Engagement level measurement
- ✅ Acquisition channel quality scoring

### 6. Analytics API Endpoints
**File:** `src/app/api/analytics/user-segments/route.ts`

Provides:
- ✅ User segmentation data queries
- ✅ Conversion funnel analysis
- ✅ Traffic source effectiveness
- ✅ Actionable insights generation

## Events Being Tracked

### User Identification & Onboarding
- `user_identified` - When user signs up with Clerk
- `roleplay_page_accessed` - User accesses main product page
- `landing_page_viewed` - Homepage visits with attribution
- `pricing_viewed` - Pricing section engagement

### Conversion Funnel
- `call_start_attempted` - User tries to start roleplay call
- `call_started` - Successfully connected to roleplay
- `call_ended` - Call completion with metrics
- `scenario_selected` - Scenario choice patterns
- `feedback_requested` - Post-call analysis requests
- `feedback_generated` - Successful feedback completion

### Feature Usage Patterns
- `voice_message_sent` - Voice interaction usage
- `text_message_sent` - Text interaction usage
- `audio_muted` / `audio_unmuted` - Audio control preferences
- `command_palette_opened` - UI interaction patterns

### Acquisition Attribution
- `enhanced_page_loaded` - Page loads with UTM data
- `acquisition_channel_hit` - Traffic source tracking

## User Properties Set

### Identification Data
- `clerk_id` - Unique user identifier
- `email` - User email address
- `signup_date` - Account creation timestamp
- `first_action` - Initial page accessed
- `traffic_source` - How user found the site
- `landing_page` - First page visited

### Behavioral Segmentation
- `user_type_identified` - User classification
- `conversion_likelihood` - Probability of converting
- `feature_preference` - Voice vs text preference
- `support_needs` - Help requirements
- `engagement_level` - Activity intensity

### Attribution Data
- `initial_utm_source` - Original traffic source
- `initial_utm_campaign` - Marketing campaign
- `initial_referrer` - Referring website
- `traffic_source_quality` - Source quality assessment

## Usage Instructions

### 1. The system automatically activates when users:
- Visit the homepage (UTM tracking)
- Sign up via Clerk (user identification)
- Access the roleplay page (behavioral tracking)

### 2. To view analytics in PostHog:
- User properties are automatically set
- Events are tracked in real-time
- Segmentation updates with each interaction

### 3. To access segmentation API:
```javascript
// GET /api/analytics/user-segments
// Returns user segments and conversion insights
```

## Key Insights Available

### 1. Conversion Analysis
- Which traffic sources convert best
- Optimal user journey patterns
- Feature preferences by user type

### 2. User Segmentation
- Power users vs casual users
- Voice-focused vs text-focused users
- Self-serve vs help-needed users

### 3. Acquisition Channel Effectiveness
- UTM campaign performance
- Traffic source quality scoring
- Referrer conversion rates

## PostHog Dashboard Setup

### Recommended Insights:
1. **Conversion Funnel**: Landing → Pricing → Roleplay → Call → Feedback
2. **User Types**: Pie chart of user_type_identified
3. **Feature Preference**: Voice vs Text usage patterns
4. **Traffic Source ROI**: Conversion by utm_source
5. **Engagement Metrics**: Session duration and action counts

### Key Metrics to Track:
- Signup conversion rate by traffic source
- Call completion rate by user type
- Feature adoption (voice vs text)
- Time to first call
- Feedback generation rate

## Implementation Status

✅ **Complete**: All core components implemented
✅ **Complete**: User identification with Clerk
✅ **Complete**: Behavioral tracking on roleplay page
✅ **Complete**: UTM parameter capture
✅ **Complete**: User segmentation engine
✅ **Complete**: Analytics API endpoints

## Next Steps

1. **Connect PostHog Query API** for real-time segmentation data
2. **Create PostHog dashboards** using the tracked events
3. **Set up automated campaigns** based on user segments
4. **Implement A/B testing** for conversion optimization
5. **Add cohort analysis** for user retention insights

The system is now ready to provide deep insights into user behavior and conversion patterns!