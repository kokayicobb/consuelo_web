"use client"
import { PricingTable } from "../ui/pricing-card";

const features = [
  // Flexible Pay-Per-Scan Features
  { name: "Pay as you go ($0.20 per try-on)", included: "starter" },
  { name: "Minimum 100 try-ons purchase", included: "starter" },
  { name: "No expiration date", included: "starter" },
 
  
  // Growth Plan Features
  { name: "1,000 monthly try-ons included", included: "pro" },
  { name: "Additional try-ons at $0.18 each", included: "pro" },
  { name: "Enhanced analytics", included: "pro" },
  
  // Scale Plan Features
  { name: "5,000 monthly try-ons included", included: "scale" },
  { name: "Additional try-ons at $0.15 each", included: "scale" },
  { name: "Priority support", included: "scale" },
  
  // Enterprise Features
  { name: "Custom volume-based pricing", included: "custom" },
  { name: "Dedicated account manager", included: "custom" },
  { name: "Priority processing", included: "custom" },
  { name: "API access", included: "custom" }
];

const plans = [
  {
    name: "Flexible Pay-Per-Scan",
    price: { monthly: 20, yearly: 20 },
    level: "starter",
  },
  {
    name: "Growth Plan",
    price: { monthly: 149, yearly: 1499 },
    level: "pro",
    popular: true,
  },
  {
    name: "Scale Plan",
    price: { monthly: 449, yearly: 4499 },
    level: "scale",
  },
  {
    name: "Enterprise",
    price: { monthly: 0, yearly: 0 },
    level: "custom",
  },
];

export default function Pricing() {
  return (
    <PricingTable
      features={features}
      plans={plans}
      defaultPlan="pro"
      defaultInterval="monthly"
      onPlanSelect={(plan) => console.log("Selected plan:", plan)}
      containerClassName="py-12"
      buttonClassName="bg-primary hover:bg-primary/90"
    />
  );
}