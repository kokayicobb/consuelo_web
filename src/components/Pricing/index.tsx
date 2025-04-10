"use client"
import * as React from "react";
import { PricingCard } from "../ui/pricing-card";
import { Tab } from "../ui/pricing-tab";

const features = [
  // Growth Features
  { name: "3,900 credits per month", included: "growth" },
  { name: "Run up to 2 tasks concurrently", included: "growth" },
  { name: "Up to 8 integrations", included: "growth" },
  { name: "Enhanced stability with dedicated resources", included: "growth" },
  { name: "Extended context length", included: "growth" },
  { name: "Priority access during peak hours", included: "growth" },
  
  // Scale Features
  { name: "19,900 credits per month", included: "scale" },
  { name: "Run up to 5 tasks concurrently", included: "scale" },
  { name: "Unlimited integrations", included: "scale" },
  { name: "Access to high-effort mode and other beta features", included: "scale" },
  { name: "Enhanced stability with dedicated resources", included: "scale" },
  { name: "Extended context length", included: "scale" },
  { name: "Priority access during peak hours", included: "scale" },
];

const pricingTiers = [
  {
    name: "Consuelo Starter",
    price: { monthly: 39, yearly: 390 },
    description: "For growing businesses with regular integration needs.",
    features: features.filter(f => f.included === "growth").map(f => f.name),
    cta: "Log in to subscribe",
    level: "growth",
    popular: true,
    beta: true
  },
  {
    name: "Consuelo Pro",
    price: { monthly: 199, yearly: 1990 },
    description: "For businesses with advanced requirements and full platform access.",
    features: features.filter(f => f.included === "scale").map(f => f.name),
    cta: "Log in to subscribe",
    level: "scale",
    highlighted: false,
    beta: true
  }
];

export default function Pricing() {
  const [interval, setInterval] = React.useState("monthly");
  
  return (
    <div className="container flex flex-col items-center justify-center">
      <h2 className="mb-16 text-5xl font-bold text-center">Pricing</h2>
      
  
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {pricingTiers.map((tier) => (
          <div key={tier.name} className="w-full">
            <PricingCard
              tier={tier}
              paymentFrequency={interval}
            />
          </div>
        ))}
      </div>
    </div>
  );
}