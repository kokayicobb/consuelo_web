import * as React from "react";
import { PricingCard } from "./pricing-card";
import { FeatureCard } from "./feature-card";
import { Tab } from "../ui/pricing-tab";
import { client } from "@/sanity/lib/client";
import { PRICING_PLANS_QUERY } from "@/sanity/lib/queries";
import { PricingTracker } from "./pricing-tracker";

interface PricingFeature {
  _id: string;
  name: string;
  description?: string;
  category: string;
  order: number;
}

interface PricingPlan {
  _id: string;
  name: string;
  slug: { current: string };
  monthlyPrice: number;
  description: string;
  cta: string;
  popular: boolean;
  beta: boolean;
  level: string;
  order: number;
  features: PricingFeature[];
}


export default async function Pricing() {
  const pricingTiers: PricingPlan[] = await client.fetch(PRICING_PLANS_QUERY);

  return (
    <div className="container flex flex-col items-center justify-center">
      <PricingTracker plans={pricingTiers} />
      <h2 className="mb-8 text-center text-5xl font-bold">
        Start training.<br />
        Close more deals.
      </h2>

      <div className="mb-12 max-w-3xl text-center">
        <p className="mb-4 text-lg text-muted-foreground">
          Choose your plan and get access to both Mercury AI coaching and Zara
          voice roleplay. Top up your account anytime and pay only for what you
          use.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {pricingTiers.map((tier) => (
          <div key={tier._id} className="w-full">
            <PricingCard tier={tier} />
          </div>
        ))}
      </div>

      <div className="mt-6 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {pricingTiers.map((tier) => (
          <div key={`feature-${tier._id}`} className="w-full">
            <FeatureCard tier={tier} />
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include both Mercury and Zara, post-call analytics, CRM
          integrations, and comprehensive sales insights. Start your free trial today.
        </p>
      </div>
    </div>
  );
}
