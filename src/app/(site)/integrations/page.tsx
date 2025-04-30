
import ScrollUp from "@/components/Common/ScrollUp";
import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import UseCases from "@/components/UseCases";

import IntegrationsSection from "@/components/ui/integrations";


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
      <IntegrationsSection  />
     
    </main>
  );
}
