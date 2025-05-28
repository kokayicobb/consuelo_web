// File: components/dashboard/AiInsightsSection.jsx
"use client";
import React from "react";
import { Lightbulb } from "lucide-react";
import AiInsightCard from "../ui/insights-card";

const AiInsightsSection = () => {
  const insights = [
    {
      title: "Inventory Alert",
      description:
        'Your "Summer Breeze" dress collection is trending on TikTok but inventory is low. Consider restocking within 7 days.',
      primaryAction: "Restock Now",
      secondaryAction: "View Details",
    },
    {
      title: "Marketing Opportunity",
      description:
        "Cross-channel analysis shows your email subscribers aren't engaging with your Instagram. Create a targeted campaign.",
      primaryAction: "Create Campaign",
      secondaryAction: "View Details",
    },
    {
      title: "Price Optimization",
      description:
        'Your "Urban Classic" jeans have price elasticity. Increasing price by 8% could improve margins without affecting volume.',
      primaryAction: "Update Pricing",
      secondaryAction: "View Details",
    },
  ];

  return (
    <div className="mb-6 rounded-lg bg-gradient-to-r from-indigo-700 to-indigo-500 p-5 text-white shadow">
      <div className="mb-4 flex items-center">
        <Lightbulb size={24} className="mr-3" />
        <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {insights.map((insight, index) => (
          <AiInsightCard
            key={index}
            title={insight.title}
            description={insight.description}
            primaryAction={insight.primaryAction}
            secondaryAction={insight.secondaryAction}
          />
        ))}
      </div>
    </div>
  );
};

export default AiInsightsSection;
