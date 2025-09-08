"use client";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PricingTier } from "./pricing-card";

interface FeatureCardProps {
  tier: PricingTier;
}

export function FeatureCard({ tier }: FeatureCardProps) {
  return (
    <Card className="w-full rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm backdrop-blur-[2px] dark:border-white/10 dark:bg-transparent">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
        {tier.name} 
      </h3>
      <div className="space-y-4">
        {tier.features.map((feature, index) => {
          const featureName = typeof feature === 'string' ? feature : feature.name;
          // Check if this is the credits feature
          const isCreditsFeature = featureName.includes("cost per hour");

          if (isCreditsFeature) {
            // Extract the number from the feature text
            const creditsMatch = featureName.match(/(\d+,\d+)/);
            const creditsText = creditsMatch ? creditsMatch[1] : "";

            return (
              <div key={index} className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-300" />
                <div className="text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {creditsText}
                  </span>{" "}
                  cost per hour{" "}
                  <a
                    href="/login"
                    className="text-zinc-600 underline decoration-[0.8px] hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            );
          }

          // Check if this is the concurrent tasks feature
          const isTasksFeature = featureName.includes("tasks concurrently");

          if (isTasksFeature) {
            // Extract the number from the feature text
            const tasksMatch = featureName.match(/(\d+)/);
            const tasksNumber = tasksMatch ? tasksMatch[1] : "";

            return (
              <div key={index} className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-300" />
                <div className="text-zinc-700 dark:text-zinc-300">
                  Run up to{" "}
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {tasksNumber}
                  </span>{" "}
                  tasks concurrently
                </div>
              </div>
            );
          }

          // Default rendering for other features
          return (
            <div key={index} className="flex gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-300" />
              <div className="text-zinc-700 dark:text-zinc-300">{featureName}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
