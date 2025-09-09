'use client'

interface JsonLdProps {
  data: object
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Pre-built structured data for your homepage
export const consueloOrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Consuelo",
  "legalName": "Consuelo HQ",
  "url": "https://www.consuelohq.com",
  "logo": "https://www.consuelohq.com/images/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@consuelohq.com",
    "contactType": "customer service",
    "areaServed": "US",
    "availableLanguage": "en"
  },
  "sameAs": [
    "https://twitter.com/consuelohq",
    "https://linkedin.com/company/consuelohq"
  ],
  "description": "AI-powered sales agent training platform that shortens ramp time for newly onboarded sales agents and helps top performers pivot to new products.",
  "foundingDate": "2024",
  "founder": {
    "@type": "Person",
    "name": "Consuelo Team"
  },
  "industry": "Software",
  "numberOfEmployees": "2-10"
}

export const consueloWebApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Consuelo: On The Job",
  "url": "https://www.consuelohq.com",
  "description": "Shorten the ramp time of newly onboarded sales agents and help your top performers pivot to new products with AI-powered training and CRM automation.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "category": "SaaS",
    "price": "Contact for pricing",
    "priceCurrency": "USD"
  },
  "creator": {
    "@type": "Organization",
    "name": "Consuelo HQ"
  },
  "datePublished": "2024-01-01",
  "inLanguage": "en-US",
  "isAccessibleForFree": false,
  "screenshot": "https://www.consuelohq.com/images/dashboard-screenshot.png"
}

export const consueloBreadcrumbSchema = (items: Array<{ name: string; url?: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
})