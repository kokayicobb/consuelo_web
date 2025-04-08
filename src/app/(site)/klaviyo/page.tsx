
import Breadcrumb from "@/components/Common/Breadcrumb";
import KlaviyoConnect from "@/components/Klaviyo";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klaviyo Integration | Consuelo - AI-Powered Fit Technology",
};

const KlaviyoConnectPage = () => {
  return (
    <>
      <Breadcrumb pageName="Klaviyo Integration" />

      <KlaviyoConnect />
    </>
  );
};

export default KlaviyoConnectPage;
