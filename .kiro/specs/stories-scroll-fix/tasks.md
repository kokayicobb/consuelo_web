# Implementation Plan

- [x] 1. Remove custom easing function and optimize scroll transform
  - Remove the custom easing function from the `useTransform` call to use Framer Motion's default linear interpolation
  - Simplify the `x` transform to use straightforward percentage-based translation
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [x] 2. Implement proper responsive breakpoints with three device types
  - Create a `getDeviceType` helper function that returns 'mobile', 'tablet', or 'desktop' based on window width
  - Update the responsive state to track device type instead of just boolean `isMobile`
  - Add proper TypeScript typing for device type
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3. Fix scroll distance calculation to ensure all cards are reachable
  - Calculate total width based on actual card dimensions: (numCards + 1) × 400px + gaps
  - Calculate translation percentage based on viewport width and total cards width
  - Add padding (200px) to ensure "View All" card is comfortably visible
  - Implement separate translation calculations for mobile, tablet, and desktop
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 2.3_

- [x] 4. Optimize scroll container height for better scroll feel
  - Increase scroll height multipliers: mobile (150vh), tablet (120vh), desktop (100vh)
  - Ensure minimum height of 300vh for scrollability
  - Update the section height calculation to use device-specific multipliers
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3_

- [x] 5. Add debouncing to resize handler for performance
  - Implement debounce logic for the resize event listener to prevent excessive recalculations
  - Set debounce delay to 150ms for optimal balance between responsiveness and performance
  - _Requirements: 4.4_

- [x] 6. Add SSR-safe viewport width handling
  - Add fallback viewport width (1920px) for server-side rendering
  - Ensure calculations work correctly before client-side hydration
  - _Requirements: 4.4_

- [x] 7. Clean up unused imports and fix deprecation warnings
  - Remove unused `urlFor` import
  - Replace deprecated `frameBorder` prop with `style={{ border: 0 }}`
  - _Requirements: N/A (code quality)_
