"use client";
import * as React from "react";
import { PricingCard } from "./pricing-card";
import { FeatureCard } from "./feature-card";
import { Tab } from "../ui/pricing-tab";

const features = [
  // Zara Features
  { name: "Set up in under an hour", included: "growth" },
  { name: "Complete performance tracking & insights", included: "growth" },
  { name: "Contextual Learning", included: "growth" },
  { name: "Advanced sales scenario simulations", included: "growth" },

 
  { name: "CRM integrations", included: "growth" },
  { name: "A/B testing complex stratagies", included: "growth" },
  { name: "Priority support", included: "growth" },

  // Mercury Features
  { name: "Set up in under an hour", included: "scale" },
  { name: "Complete performance tracking & insights", included: "scale" },
  { name: "Contextual Learning", included: "scale" },
  { name: "Sequential Dialing", included: "scale" },

  { name: "Twilio integration for sales optimization", included: "scale" },
  
  { name: "CRM integrations", included: "scale" },

  
  { name: "Priority support", included: "scale" },
];

const pricingTiers = [
  {
    name: "Zara: Roleplay Agent",
    price: { monthly: 0.15, yearly: 5 },
    description:
      "Get started with AI-powered sales coaching and roleplay training.",
    features: features
      .filter((f) => f.included === "growth")
      .map((f) => f.name),
    cta: "Free 14 day trial",
    level: "growth",
    popular: false,
    beta: false,
  },
  {
    name: "Mercury: On-Call Agent",
    price: { monthly: 0.01, yearly: 20 },
    description:
      "Advanced AI sales training with premium features and extended usage credits.",
    features: features.filter((f) => f.included === "scale").map((f) => f.name),
    cta: "Free 14 day trial",
    level: "scale",
    popular: true,
    beta: false,
  },
];

export default function Pricing() {
  const [interval, setInterval] = React.useState("monthly");

  return (
    <div className="container flex flex-col items-center justify-center">
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
          <div key={tier.name} className="w-full">
            <PricingCard tier={tier} paymentFrequency={interval} />
          </div>
        ))}
      </div>

      <div className="mt-6 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {pricingTiers.map((tier) => (
          <div key={`${tier.name}`} className="w-full">
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
