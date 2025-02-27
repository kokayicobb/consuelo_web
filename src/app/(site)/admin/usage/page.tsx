import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Use dynamic import for the component
const DynamicUsageDashboard = dynamic(
  () => import("@/components/Admin/UsageDashboard"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "API Usage Dashboard | Consuelo Admin",
  description: "Monitor API usage and analytics for the Consuelo platform",
};

const ApiUsagePage = () => {
  return (
    <main>
      <Breadcrumb pageName="API Usage Dashboard" />
      <Suspense fallback={<div className="p-6">Loading usage dashboard...</div>}>
        <DynamicUsageDashboard />
      </Suspense>
    </main>
  );
};

export default ApiUsagePage;