// src/app/page.tsx
import { WavyBackgroundDemo } from "@/components/Hero";
import HomeBlogSection from "@/components/Blog/HomeBlogSection";
import Clients from "@/components/Clients";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import FaqSection from "@/components/Faq";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import TeamSection from "@/components/Team";
import Testimonials from "@/components/Testimonials";
import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import UseCases from "@/components/UseCases";

export const metadata: Metadata = {
  title: "Consuelo: The CRM You Need",
  description:
   'The AI Native business management platform that just works.',
};

export default function Home() {
  
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  return (
    <main>
      <ScrollUp />
      <WavyBackgroundDemo />
      <Features />
      {/* Use Case gallery Place here */}

      <UseCases />
      <Pricing />

      <Clients />
    </main>
  );
}
