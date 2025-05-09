import Breadcrumb from "@/components/Common/Breadcrumb";
import Faq from "@/components/Faq";
import Pricing from "@/components/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Pricing Page | Consuelo - AI-Powered Fit Technology",
  description: "This is pricing page description",
};

const PricingPage = () => {
  return (
    <>
     
      <Pricing />
      <Faq />
    </>
  );
};

export default PricingPage;
