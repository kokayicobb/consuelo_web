"use client"
import * as React from "react";
import { PricingCard } from "../ui/pricing-card";
import { Tab } from "../ui/pricing-tab";

const features = [
  // Starter Features
  { name: "$5 of initial usage", included: "growth" },
  { name: "Mercury AI coaching ($0.01/min)", included: "growth" },
  { name: "Zara voice AI roleplay ($0.15/min)", included: "growth" },
  { name: "Twilio integration for sales optimization", included: "growth" },
  { name: "Post-call analytics", included: "growth" },
  { name: "CRM integrations", included: "growth" },
  { name: "Basic sales performance insights", included: "growth" },
  
  // Pro Features
  { name: "$20 of initial usage", included: "scale" },
  { name: "Mercury AI coaching ($0.01/min)", included: "scale" },
  { name: "Zara voice AI roleplay ($0.15/min)", included: "scale" },
  { name: "Advanced sales scenario simulations", included: "scale" },
  { name: "Twilio integration for sales optimization", included: "scale" },
  { name: "Post-call analytics", included: "scale" },
  { name: "CRM integrations", included: "scale" },
  { name: "Advanced performance tracking & insights", included: "scale" },
  { name: "Custom roleplay scenarios", included: "scale" },
  { name: "Priority support", included: "scale" },
];

const pricingTiers = [
  {
    name: "Consuelo Starter",
    price: { monthly: 5, yearly: 5 },
    description: "Get started with AI-powered sales coaching and roleplay training.",
    features: features.filter(f => f.included === "growth").map(f => f.name),
    cta: "Log in to subscribe",
    level: "growth",
    popular: false,
    beta: false
  },
  {
    name: "Consuelo Pro",
    price: { monthly: 20, yearly: 20 },
    description: "Advanced AI sales training with premium features and extended usage credits.",
    features: features.filter(f => f.included === "scale").map(f => f.name),
    cta: "Log in to subscribe",
    level: "scale",
    popular: true,
    beta: false
  }
];

export default function Pricing() {
  const [interval, setInterval] = React.useState("monthly");
  
  return (
    <div className="container flex flex-col items-center justify-center">
      <h2 className="mb-8 text-5xl font-bold text-center">Pricing</h2>
      
      <div className="mb-12 text-center max-w-3xl">
        <p className="text-lg text-muted-foreground mb-4">
          Choose your plan and get access to both Mercury AI coaching and Zara voice roleplay. 
          Top up your account anytime and pay only for what you use.
        </p>
      </div>
      
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
      
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include both Mercury and Zara, post-call analytics, CRM integrations, and comprehensive sales insights. 
          Add credits to your account anytime to continue using the platform.
        </p>
      </div>
    </div>
  );
}