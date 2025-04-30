
import ScrollUp from "@/components/Common/ScrollUp";

import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";




import PlatformSection from "@/components/Platform-Screen";

export const metadata: Metadata = {
  title: "Consuelo - See it. Try it. Buy it.",
  description:
    "The personalized virtual fitting solution for Ecommerce retailers. Our innovative SaaS platform enables customers to try on clothes online ensuring the perfect fit and reducing returns.",
};

export default function Home() {
  
 

  return (
    <main>
      <ScrollUp />
      <PlatformSection  />
     
    </main>
  );
}
