"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";

// Dynamically import the PoseDetection component
const DynamicPoseDetection = dynamic(
  () => import("@/components/Dashboard/dashboard"),
  {
    ssr: false,
  },
);

// Create a global state to control header & footer visibility
// This needs to be outside your component to be globally accessible
let globalHeaderHidden = false;
let globalFooterHidden = false;

const Dashboard = () => {
  const pathname = usePathname();
  
  useEffect(() => {
    // Set custom attributes on the document body to hide both header and footer
    document.body.setAttribute("data-hide-header", "true");
    document.body.setAttribute("data-hide-footer", "true");
    
    // Clean up when component unmounts
    return () => {
      document.body.removeAttribute("data-hide-header");
      document.body.removeAttribute("data-hide-footer");
    };
  }, []);

  return (
    <main className="w-full h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicPoseDetection />
      </Suspense>
    </main>
  );
};

export default Dashboard;