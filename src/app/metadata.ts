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
    apple: '/apple-icon.png'
  }
}