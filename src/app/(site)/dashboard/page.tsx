import Breadcrumb from "@/components/Common/Breadcrumb";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Metadata } from "next";

// Dynamically import the PoseDetection component
const DynamicPoseDetection = dynamic(
  () => import("@/components/Playground/components/Dashboard/dashboard"),
  {
    ssr: false,
  },
);

export const metadata: Metadata = {
  title: "Dashboard | Consuelo - AI-Powered Fit Technology",
  description: "This is About page description",
};

const VirtualTryOn = () => {
  return (
    <main>
      <Breadcrumb pageName="Dashboard" />
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicPoseDetection />
      </Suspense>
    </main>
  );
};

export default VirtualTryOn;
