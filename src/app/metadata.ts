import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consuelo - AI-Powered Fit Technology',
  description: 'The personalized virtual fitting solution for Ecommerce retailers. Our innovative SaaS platform enables customers to try on clothes online ensuring the perfect fit and reducing returns.',
  metadataBase: new URL('https://www.consuelohq.com'),
  applicationName: 'Consuelo',
  keywords: ['AI', 'Virtual Fitting Room', 'Fashion', 'Fit Technology'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.consuelohq.com',
    siteName: 'Consuelo',
    title: 'Consuelo - AI-Powered Fit Technology',
    description: 'The personalized virtual fitting solution for Ecommerce retailers.',
    images: [{
      url: '/images/transparent.png', // Use absolute URL
      width: 1200,
      height: 630,
      alt: 'Consuelo App Preview',
      type: 'image/png',
    }],
    countryName: 'United States',
    emails: ['Info@consuelohq.com'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@YourTwitterHandle',
    creator: '@YourTwitterHandle',
    title: 'Consuelo - AI-Powered Fit Technology',
    description: 'The personalized virtual fitting solution for Ecommerce retailers.',
    images: ['/images/transparent.png'] // Use absolute URL // Remove 'public' from path
  },
  icons: {
    icon: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    // Add other icon sizes for different devices
    other: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ]
  },
  
  // Add manifest for PWA support
  manifest: '/site.webmanifest',

  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Consuelo',
  }
}