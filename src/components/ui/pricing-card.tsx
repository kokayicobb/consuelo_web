"use client";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Assuming you have this utility

export interface PricingTier {
  name: string;
  price: Record<string, number | string>;
  description?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  beta?: boolean;
  credits?: number;
  concurrentTasks?: number;
  level?: string;
  popular?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
  paymentFrequency: string;
}

export function PricingCard({ tier, paymentFrequency }: PricingCardProps) {
  const price = tier.price[paymentFrequency];
  const isHighlighted = tier.highlighted || tier.popular;

  return (
    <Card className="flex h-[600px] w-full flex-col justify-between rounded-3xl border border-zinc-200 dark:border-white/10 dark:bg-white/5 bg-white shadow-sm p-7 backdrop-blur-[2px]">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{tier.name}</h2>
          {tier.beta && (
            <Badge
              variant="outline"
              className="rounded-md border-zinc-600 bg-transparent px-2 py-0.5 text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Beta
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-baseline">
          {typeof price === "number" ? (
            <>
              <span className="text-4xl font-bold text-zinc-900 dark:text-white">${price}</span>
              <span className="ml-1 text-lg text-zinc-600 dark:text-zinc-400">
                / {paymentFrequency === "monthly" ? "month" : "year"}
              </span>
            </>
          ) : (
            <span className="text-4xl font-bold text-zinc-900 dark:text-white">{price}</span>
          )}
        </div>

        <Button 
          className={cn(
            "mt-6 w-full rounded-full py-4 text-base font-medium",
            "bg-zinc-100 text-zinc-900 hover:bg-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          )}
        >
          {tier.cta || "Log in to subscribe"}
        </Button>
      </div>

      <div className="mt-8 flex-grow space-y-4">
        {tier.features.map((feature, index) => {
          // Check if this is the credits feature
          const isCreditsFeature = feature.includes("credits per month");

          if (isCreditsFeature) {
            // Extract the number from the feature text
            const creditsMatch = feature.match(/(\d+,\d+)/);
            const creditsText = creditsMatch ? creditsMatch[1] : "";

            return (
              <div key={index} className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-600 dark:text-zinc-300" />
                <div className="text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {creditsText}
                  </span>{" "}
                  credits per month{" "}
                  <a
                    href="#"
                    className="text-zinc-600 dark:text-zinc-400 underline decoration-[0.8px] hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            );
          }

          // Check if this is the concurrent tasks feature
          const isTasksFeature = feature.includes("tasks concurrently");

          if (isTasksFeature) {
            // Extract the number from the feature text
            const tasksMatch = feature.match(/(\d+)/);
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
              <div className="text-zinc-700 dark:text-zinc-300">{feature}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}