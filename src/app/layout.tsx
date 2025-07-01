// app/layout.tsx
import { metadata } from './metadata'
import "../styles/index.css";
import "../styles/prism-vsc-dark-plus.css";
import ClientLayout from './clientLayout';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Analytics from '@/components/Analytics'
import { PostHogProvider } from './providers'

import { Toaster } from '@/components/ui/sonner';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>

      <body> 
      <PostHogProvider>
            <Toaster /> 
            {/* <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn> */}
            <ClientLayout>{children}</ClientLayout>
            <Analytics />
            <SpeedInsights />
            </PostHogProvider>
        
      </body>
    </html>
    </ClerkProvider>
  );
}

export { metadata }