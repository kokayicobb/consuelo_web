import Breadcrumb from "@/components/Common/Breadcrumb";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Metadata } from "next";

const EquestrianHelmetPage = dynamic(
  () => import("@/components/Playground/components/Store"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Playground | Consuelo - AI-Powered Fit Technology",
  description: "This is About page description",
};

const Playground = () => {
  return (
    <main>
      <Breadcrumb pageName="Playground" />
      <Suspense fallback={<div>Loading...</div>}>
        <EquestrianHelmetPage /> 
        
      </Suspense>
    </main>
  );
};

export default Playground;

