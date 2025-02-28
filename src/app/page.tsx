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

export const metadata: Metadata = {
  title: "Consuelo - See it. Try it. Buy it.",
  description:
    "The personalized virtual fitting solution for Ecommerce retailers. Our innovative SaaS platform enables customers to try on clothes online ensuring the perfect fit and reducing returns.",
};

export default function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  return (
    <main>
      <ScrollUp />
      <WavyBackgroundDemo />
      <Testimonials />
      <Features />
      <Contact />
      <Pricing />
      <FaqSection />
      <TeamSection />
      <HomeBlogSection
        posts={posts}
        subtitle="Latest Updates"
        title="News & Insights"
        paragraph="Stay up to date with the latest developments in AI fashion technology, industry trends, and how Consuelo is revolutionizing the online shopping experience."
      />
      <Contact />
      <Clients />
    </main>
  );
}
