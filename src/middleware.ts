import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/platform',
  '/integrations',
  '/pricing',
  '/terms',
  '/privacy',
  '/waitlist',
  '/how-it-works',
  '/roleplay',
  '/((?!api|_next|.*\\.).+)', // Allow all slug pages but exclude API routes and Next.js internals
  "/api/scraping/process-job",
  "/api/roleplay/(.*)",
  "/api/cached-video",
  "/api/test",
  "/api/tts",
  "/api/stripe/webhook",
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}