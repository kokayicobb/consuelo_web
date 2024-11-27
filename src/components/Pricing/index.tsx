"use client";
import SectionTitle from "../Common/SectionTitle";
import PricingCard from "./PricingCard";
import { pricingData } from "@/stripe/pricingData";

const Pricing = () => {
  return (
    <section
      id="pricing"
      className="relative z-20 overflow-hidden bg-gradient-to-b from-white to-gray-100 pb-0 pt-20 dark:from-dark dark:to-dark-800 lg:pb-[90px] lg:pt-[120px]"
    >
      <div className="container mx-auto px-4">
        <div className="mb-[60px]">
          <SectionTitle
            subtitle="Pricing Plans"
            title="Choose Your Perfect Plan"
            paragraph="Unlock the full potential of your business with our flexible pricing options. Scale effortlessly and manage costs as you grow."
            center
          />
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {pricingData.map((product, i) => (
            <PricingCard key={i} product={product} />
          ))}     
        </div>
      </div>
    </section>
  );
};

export default Pricing;

