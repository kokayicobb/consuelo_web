import { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
}

export const metadata: Metadata = {
  title: {
    default: 'Consuelo: On The Job - AI Sales Agent Training Platform',
    template: '%s | Consuelo'
  },
  description: 'Shorten the ramp time of newly onboarded sales agents and help your top performers pivot to new products with AI-powered training and CRM automation.',
  metadataBase: new URL('https://www.consuelohq.com'),
  applicationName: 'Consuelo',
  keywords: [
    'AI sales training',
    'sales agent onboarding', 
    'CRM automation',
    'sales performance',
    'lead management',
    'sales coaching',
    'AI-powered sales',
    'sales enablement',
    'sales productivity',
    'customer relationship management'
  ],
  authors: [
    {
      name: 'Consuelo Team',
      url: 'https://www.consuelohq.com'
    }
  ],
  creator: 'Consuelo',
  publisher: 'Consuelo HQ',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.consuelohq.com',
    siteName: 'Consuelo',
    title: 'Consuelo: On The Job - AI Sales Agent Training Platform',
    description: 'Shorten the ramp time of newly onboarded sales agents and help your top performers pivot to new products with AI-powered training and CRM automation.',
    images: [{
      url: '/images/transparent.png',
      width: 1200,
      height: 630,
      alt: 'Consuelo - AI Sales Agent Training Platform',
      type: 'image/png',
    }],
    countryName: 'United States',
    emails: ['info@consuelohq.com'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@consuelohq',
    creator: '@consuelohq',
    title: 'Consuelo: On The Job - AI Sales Agent Training Platform',
    description: 'Shorten the ramp time of newly onboarded sales agents and help your top performers pivot to new products with AI-powered training.',
    images: [{
      url: '/images/transparent.png',
      width: 1200,
      height: 630,
      alt: 'Consuelo - AI Sales Agent Training Platform'
    }]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-touch-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#6c47ff'
      }
    ]
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://www.consuelohq.com',
    types: {
      'application/rss+xml': 'https://www.consuelohq.com/feed.xml'
    }
  },
  category: 'technology',
  classification: 'business',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'light dark',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Consuelo',
    startupImage: [
      {
        url: '/apple-startup-image-750x1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/apple-startup-image-828x1792.png', 
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/apple-startup-image-1125x2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)'
      },
      {
        url: '/apple-startup-image-1242x2688.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)'
      }
    ]
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
    yandex: process.env.YANDEX_VERIFICATION_ID,
    other: {
      'msvalidate.01': process.env.BING_VERIFICATION_ID,
      'facebook-domain-verification': process.env.FACEBOOK_VERIFICATION_ID
    }
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Consuelo',
    'application-name': 'Consuelo',
    'msapplication-TileColor': '#6c47ff',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#ffffff'
  }
}
