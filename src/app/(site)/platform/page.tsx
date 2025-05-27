
import ScrollUp from "@/components/Common/ScrollUp";

import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";




import PlatformSection from "@/components/Platform-Screen";

export const metadata: Metadata = {
  title: "Consuelo - See it. Try it. Buy it.",
  description:
    'The AI Native business management platform that just works.',
};

export default function Home() {
  
 

  return (
    <main>
      <ScrollUp />
      <PlatformSection  />
     
    </main>
  );
}
