// src/app/(site)/stories/page.tsx
import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import StoriesGrid from "./StoriesGrid";
import Faq from "@/components/Faq";
import Pricing from "@/components/Pricing";

// Type definitions
interface Feature {
  _id: string
  title: string
  description: string
  image?: any
  imagePath?: string
  video?: {
    videoType: 'youtube' | 'vimeo' | 'loom' | 'upload' | 'url'
    url?: string
    file?: any
    autoplay?: boolean
    loop?: boolean
    muted?: boolean
  }
  heroVideo?: string
  slug: { current: string }
  isHero: boolean
  gradientFrom: string
  gradientTo: string
  order: number
}

export const metadata: Metadata = {
  title: 'Stories - Consuelo',
  description: 'Explore all our customer success stories and use cases.',
};

// GROQ query for fetching stories
const FEATURES_QUERY = `*[_type == "feature"] | order(order asc) {
  _id,
  title,
  description,
  image,
  imagePath,
  video,
  heroVideo,
  slug,
  isHero,
  gradientFrom,
  gradientTo,
  order
}`;

const options = { next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 30 } };

export default async function StoriesPage() {
  // Fetch all features from Sanity
  const features = await client.fetch<Feature[]>(FEATURES_QUERY, {}, options);

  return (
    <main className="min-h-screen bg-white dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-8 py-24">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Stories
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover how our customers are transforming their businesses with Consuelo
          </p>
        </div>
        
        <StoriesGrid features={features} />
        <div className="h-32"></div>
        <Pricing />
        <Faq />
      </div>
    </main>
  );
}