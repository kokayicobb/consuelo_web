# Design Document

## Overview

This design addresses the scroll performance and UX issues in the Stories component by optimizing the scroll animation, improving responsiveness, and ensuring complete scroll range across all device sizes. The solution focuses on removing the custom easing function that causes choppiness, adjusting scroll distances to ensure all cards are reachable, and implementing proper responsive breakpoints.

## Architecture

The Stories component uses Framer Motion's `useScroll` and `useTransform` hooks to create a horizontal scroll effect. The current implementation has three main issues:

1. **Custom easing function** - The cubic easing function causes non-linear motion that feels choppy
2. **Insufficient scroll distance** - The translation percentages don't account for the final "View All" card properly
3. **Binary responsive logic** - Only mobile/desktop breakpoints without tablet consideration

The fix will maintain the existing architecture but optimize the parameters and remove problematic customizations.

## Components and Interfaces

### Stories Component

**Current Issues:**
- Custom easing function in `useTransform` creates choppy motion
- Height calculation: `${Math.max(400, scrollFeatures.length * (isMobile ? 120 : 80))}vh` may be insufficient
- Translation calculation doesn't properly account for all cards plus the "View All" card
- Only two breakpoints (mobile < 768px, desktop >= 768px)

**Design Changes:**

1. **Remove Custom Easing**
   - Remove the custom easing function from `useTransform`
   - Use Framer Motion's default linear interpolation for smooth, predictable motion

2. **Improve Scroll Distance Calculation**
   - Calculate based on: (number of cards + 1 for "View All") × card width + gaps
   - Card width: 400px
   - Gap between cards: 32px (gap-8)
   - Formula: `totalWidth = (numCards + 1) * 400 + numCards * 32`
   - Translation percentage: `(totalWidth / viewportWidth) * 100`

3. **Add Tablet Breakpoint**
   - Mobile: < 768px
   - Tablet: 768px - 1024px  
   - Desktop: > 1024px

4. **Optimize Scroll Height**
   - Increase scroll height to allow more gradual scrolling
   - Mobile: `numCards * 150vh` (increased from 120vh)
   - Tablet: `numCards * 120vh`
   - Desktop: `numCards * 100vh` (increased from 80vh)

### Responsive Breakpoints

```typescript
const getDeviceType = (width: number): 'mobile' | 'tablet' | 'desktop' => {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}
```

### Translation Calculation

```typescript
// Calculate the total width needed to show all cards
const cardWidth = 400
const gapWidth = 32
const numCards = scrollFeatures.length
const viewAllCardWidth = 400

// Total width = all feature cards + view all card + gaps between them
const totalCardsWidth = (numCards + 1) * cardWidth + numCards * gapWidth

// Calculate how much we need to translate to show the last card
// We want the "View All" card to be visible with some padding
const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
const translateDistance = totalCardsWidth - viewportWidth + 200 // 200px padding

// Convert to percentage
const translatePercent = (translateDistance / viewportWidth) * 100
```

## Data Models

No data model changes required. The component continues to use the existing `Feature` interface.

## Error Handling

### Responsive Listener Cleanup
- Ensure resize event listener is properly cleaned up on unmount
- Add debouncing to resize handler to prevent excessive recalculations

### Fallback Values
- Provide fallback viewport width for SSR: 1920px
- Minimum scroll height: 300vh to ensure scrollability
- Maximum translation: Cap at reasonable value to prevent over-scrolling

## Testing Strategy

### Manual Testing Checklist

1. **Smooth Animation**
   - Scroll through stories on desktop with mouse wheel
   - Scroll through stories on mobile with touch
   - Verify no choppy or jerky motion

2. **Scroll Speed**
   - Verify cards start moving immediately on scroll
   - Verify scroll feels responsive, not sluggish
   - Test with slow and fast scroll speeds

3. **Complete Range**
   - On mobile (iPhone SE, iPhone 12, iPhone 14 Pro Max)
     - Scroll to end and verify "View All" card is fully visible
   - On tablet (iPad, iPad Pro)
     - Scroll to end and verify "View All" card is fully visible
   - On desktop (1920x1080, 2560x1440, 3840x2160)
     - Scroll to end and verify "View All" card is fully visible

4. **Responsive Behavior**
   - Resize browser window from mobile to desktop
   - Verify scroll adapts without refresh
   - Test at various breakpoints (767px, 768px, 1023px, 1024px)

### Device Testing Matrix

| Device Type | Screen Size | Expected Behavior |
|-------------|-------------|-------------------|
| Mobile Small | 375px | All cards visible, smooth scroll |
| Mobile Large | 428px | All cards visible, smooth scroll |
| Tablet | 768px | All cards visible, smooth scroll |
| Tablet Large | 1024px | All cards visible, smooth scroll |
| Desktop | 1920px | All cards visible, smooth scroll |
| Desktop Large | 2560px | All cards visible, smooth scroll |

## Implementation Notes

1. Remove the custom easing function completely - Framer Motion's default is smoother
2. Increase scroll container height for more gradual scrolling
3. Calculate translation based on actual card dimensions, not arbitrary percentages
4. Add proper padding at the end to ensure "View All" card is comfortably visible
5. Consider adding a subtle scroll indicator for users who might not realize the section scrolls
