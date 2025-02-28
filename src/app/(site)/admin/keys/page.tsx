import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Use dynamic import for the component
const DynamicApiKeysManagement = dynamic(
  () => import("@/components/Admin/ApiKeysManagement"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "API Key Management | Consuelo Admin",
  description: "Manage API keys for the Consuelo platform",
};

const ApiKeysPage = () => {
  return (
    <main>
      <Breadcrumb pageName="API Key Management" />
      <Suspense fallback={<div className="p-6">Loading API key management...</div>}>
        <DynamicApiKeysManagement />
      </Suspense>
    </main>
  );
};

export default ApiKeysPage;