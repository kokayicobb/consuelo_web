
import ScrollUp from "@/components/Common/ScrollUp";
import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import UseCases from "@/components/UseCases";

import IntegrationsSection from "@/components/ui/integrations";


export const metadata: Metadata = {
  title: "Consuelo - See it. Try it. Buy it.",
  description:
    'The AI Native business management platform that just works.',
};

export default function Home() {
  
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  return (
    <main>
      <ScrollUp />
      <IntegrationsSection  />
     
    </main>
  );
}
