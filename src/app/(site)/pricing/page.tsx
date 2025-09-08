import Breadcrumb from "@/components/Common/Breadcrumb";
import Faq from "@/components/Faq";
import Pricing from "@/components/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Start a 14-day free trial of Consuelo Today",
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
