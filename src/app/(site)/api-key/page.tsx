import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Use dynamic import for the component
const DynamicApiKeyRequestForm = dynamic(
  () => import("@/components/API Key/RequestForm"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Request API Key | Consuelo",
  description: "Request an API key for the Consuelo platform",
};

const ApiKeyRequestPage = () => {
  return (
    <main>
      <Breadcrumb pageName="Request API Key" />
      <Suspense fallback={<div className="p-6">Loading request form...</div>}>
        <DynamicApiKeyRequestForm />
      </Suspense>
    </main>
  );
};

export default ApiKeyRequestPage;