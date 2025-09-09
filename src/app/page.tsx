// src/app/page.tsx
import { WavyBackgroundDemo } from "@/components/Hero";
import HomeBlogSection from "@/components/Blog/HomeBlogSection";
import Clients from "@/components/Clients";
import ScrollUp from "@/components/Common/ScrollUp";
import Features from "@/components/Features";
import { HorizontalScrollFeatures } from "@/components/Stories";
import Pricing from "@/components/Pricing";
import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import UseCases from "@/components/UseCases";
import { client } from "@/sanity/lib/client";
import { type SanityDocument } from "next-sanity"
import JsonLd, { consueloOrganizationSchema, consueloWebApplicationSchema } from "@/components/JsonLd";

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

interface UseCase {
  _id: string
  title: string
  description: string
  category: "insurance" | "b2b"
  slug: { current: string }
  loomVideoUrl: string
  altText: string
  order: number
  productName?: "Zara" | "Mercury"
};

export const metadata: Metadata = {
  title: 'Consuelo: Voice AI that shortens ramp time on sales teams.',
  description:
   'The AI Native business management platform that just works. Shorten the ramp time of newly onboarded sales agents and help your top performers pivot to new products.',
};

// GROQ queries for fetching data
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

const USE_CASES_QUERY = `*[_type == "useCase"] | order(order asc) {
  _id,
  title,
  description,
  category,
  slug,
  loomVideoUrl,
  altText,
  order,
  productName
}`;

const options = { next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 30 } };

export default async function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);
  
  // Fetch features and use cases from Sanity
  const [features, useCases] = await Promise.all([
    client.fetch<Feature[]>(FEATURES_QUERY, {}, options),
    client.fetch<UseCase[]>(USE_CASES_QUERY, {}, options),
  ]);

  return (
    <main>
      <JsonLd data={consueloOrganizationSchema} />
      <JsonLd data={consueloWebApplicationSchema} />
      <ScrollUp />
      <WavyBackgroundDemo />
      <Features features={features} />
      <UseCases useCases={useCases} />
      <HorizontalScrollFeatures features={features} />
      <Pricing />

      <Clients />
    </main>
  );
}
