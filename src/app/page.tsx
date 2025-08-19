// src/app/page.tsx
import { WavyBackgroundDemo } from "@/components/Hero";
import HomeBlogSection from "@/components/Blog/HomeBlogSection";
import Clients from "@/components/Clients";
import ScrollUp from "@/components/Common/ScrollUp";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import UseCases from "@/components/UseCases";
import { client } from "@/sanity/lib/client";
import { type SanityDocument } from "next-sanity";

export const metadata: Metadata = {
  title: "Consuelo: The CRM You Need",
  description:
   'The AI Native business management platform that just works.',
};

// GROQ queries for fetching data
const FEATURES_QUERY = `*[_type == "feature"] | order(order asc) {
  _id,
  title,
  description,
  image,
  imagePath,
  href,
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
  image,
  imagePath,
  href,
  altText,
  order
}`;

const options = { next: { revalidate: 30 } };

export default async function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);
  
  // Fetch features and use cases from Sanity
  const [features, useCases] = await Promise.all([
    client.fetch<SanityDocument[]>(FEATURES_QUERY, {}, options),
    client.fetch<SanityDocument[]>(USE_CASES_QUERY, {}, options),
  ]);

  return (
    <main>
      <ScrollUp />
      <WavyBackgroundDemo />
      <Features features={features} />
      {/* Use Case gallery Place here */}

      <UseCases useCases={useCases} />
      <Pricing />

      <Clients />
    </main>
  );
}
