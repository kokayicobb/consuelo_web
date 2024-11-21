import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consuelo',
  description: 'AI-Powered Fit Technology',
  metadataBase: new URL('https://www.consuelo.shop/'),
  applicationName: 'Consuelo',
  keywords: ['AI','Virtual Fitting Room', 'Fashion', 'Fit Technology' ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.consuelo.shop/',
    siteName: 'Consuelo',
    title: 'Consuelo',
    description: 'AI-Powered Fit Technology',
    images: [{
      url: '/images/logo.png',  // Remove 'public' from path
      width: 1200,
      height: 630,
      alt: 'Consuelo App Preview'
		}],
    // Added fields for better social sharing
    countryName: 'United States',
    emails: ['Info@consuelo.shop'],
   
  },
  twitter: {
    card: 'summary_large_image',
    site: '@YourTwitterHandle',
    creator: '@YourTwitterHandle',
    title: 'Consuelo',
    description: 'AI-Powered Fit Technology',
    images: ['/images/logo.png']  // Remove 'public' from path
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
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Consuelo',
  }
}