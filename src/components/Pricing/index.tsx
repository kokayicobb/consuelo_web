"use client"

import * as React from "react"
import { PricingCard } from "../ui/pricing-card"
import { Tab } from "../ui/pricing-tab"

const features = [
  // Starter Features
  { name: "Pay-per-scan pricing", included: "starter" },
  { name: "Minimum 100 scans purchase", included: "starter" },
  { name: "Basic analytics", included: "starter" },
  { name: "Standard support", included: "starter" },
  
  // Growth Features
  { name: "300 monthly scans included", included: "growth" },
  { name: "Additional scans at reduced rate", included: "growth" },
  { name: "Enhanced analytics", included: "growth" },
  { name: "Priority email support", included: "growth" },
  
  // Scale Features
  { name: "2,500 monthly scans included", included: "scale" },
  { name: "Bulk scan pricing", included: "scale" },
  { name: "Advanced analytics dashboard", included: "scale" },
  { name: "Priority support", included: "scale" },
  
  // Enterprise Features
  { name: "Custom volume-based pricing", included: "enterprise" },
  { name: "Dedicated account manager", included: "enterprise" },
  { name: "Custom integrations", included: "enterprise" },
  { name: "SLA guarantees", included: "enterprise" }
];

const pricingTiers = [
  {
    name: "Starter",
    price: { monthly: 20, yearly: 200 },
    description: "Perfect for testing our virtual try-on solution",
    features: features.filter(f => f.included === "starter").map(f => f.name),
    cta: "Get Started",
    level: "starter",
    highlighted: false
  },
  {
    name: "Growth",
    price: { monthly: 49, yearly: 490 },
    description: "Ideal for growing businesses with regular scan needs",
    features: features.filter(f => f.included === "growth").map(f => f.name),
    cta: "Start Growing",
    level: "growth",
    popular: true
  },
  {
    name: "Scale",
    price: { monthly: 299, yearly: 2990 },
    description: "For businesses with high-volume scanning requirements",
    features: features.filter(f => f.included === "scale").map(f => f.name),
    cta: "Scale Up",
    level: "scale",
    highlighted: false
  },
  {
    name: "Enterprise",
    price: { monthly: "Custom", yearly: "Custom" },
    description: "Custom solutions for large-scale implementations",
    features: features.filter(f => f.included === "enterprise").map(f => f.name),
    cta: "Contact Sales",
    level: "enterprise",
    highlighted: true
  }
];

export default function Pricing() {
  const [interval, setInterval] = React.useState("monthly")

  return (
    <div className="container py-12">
      <div className="mx-auto mb-8 flex max-w-fit items-center justify-center rounded-full border bg-muted p-1">
        <Tab
          text="Monthly"
          selected={interval === "monthly"}
          setSelected={() => setInterval("monthly")}
        />
        <Tab
          text="Yearly"
          selected={interval === "yearly"}
          setSelected={() => setInterval("yearly")}
          discount={true}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((tier) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            paymentFrequency={interval}
          />
        ))}
      </div>
    </div>
  )
}