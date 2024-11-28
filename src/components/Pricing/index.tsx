"use client";
import SectionTitle from "../Common/SectionTitle";
import PricingCard from "./PricingCard";
import { pricingData } from "@/stripe/pricingData";
import { Wallet } from "lucide-react";

const Pricing = () => {
  return (
    <section className="bg-background pt-16 pb-24 sm:pt-24 sm:pb-32">
  <div className="mx-auto max-w-7xl px-6 lg:px-8">
    <div className="text-center mb-12">
      {/* Top label matching the first section's style */}
      <div className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium">
        <Wallet className="mr-2 h-4 w-4 text-accent" />
        <span className="text-accent">Pricing</span>
      </div>

      {/* Title with matching gradient */}
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Choose Your <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Perfect Plan</span>
      </h2>

      {/* Subtitle matching the first section's style */}
      <p className="mt-4 text-lg text-muted-foreground">
        Unlock the full potential of your business with our flexible pricing options. Scale effortlessly and manage costs as you grow.
      </p>
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

