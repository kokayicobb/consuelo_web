import Breadcrumb from "@/components/Common/Breadcrumb";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Metadata } from "next";

// Remove the direct import and only use the dynamic import
const DynamicVirtualTryOnPage = dynamic(
  () => import("@/components/Playground/components/Virtual Try On/store/index"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Playground | Consuelo - AI-Powered Fit Technology",
  description: "This is About page description",
};

const VirtualTryOn = () => {
  return (
    <main>
      <Breadcrumb pageName="Virtual Try On" />
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicVirtualTryOnPage />
      </Suspense>
    </main>
  );
};

export default VirtualTryOn;