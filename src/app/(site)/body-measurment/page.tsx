import Breadcrumb from "@/components/Common/Breadcrumb";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Metadata } from "next";

// Dynamically import the PoseDetection component
const DynamicPoseDetection = dynamic(
  () =>
    import("@/components/Playground/components/Body Measurment/PoseDetection"),
  {
    ssr: false,
  },
);

export const metadata: Metadata = {
  title: "Body Measurment | Consuelo - AI-Powered Fit Technology",
  description: "This is About page description",
};

const VirtualTryOn = () => {
  return (
    <main>
      <Breadcrumb pageName="Body Measurment" />
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicPoseDetection />
      </Suspense>
    </main>
  );
};

export default VirtualTryOn;
