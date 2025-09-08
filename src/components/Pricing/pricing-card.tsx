"use client";
import Link from "next/link";
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
    <Card className="flex w-full flex-col justify-between rounded-3xl border border-zinc-200 dark:border-white/10 dark:bg-transparent bg-white shadow-sm p-7 backdrop-blur-[2px] min-h-[400px]">
      <div className="flex-1">
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

        <div className="mt-6">
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            {tier.name === "Zara: Roleplay Agent" 
              ? "Zara works seamlessly with any sales platform, including Salesforce, HubSpot, GoHighLevel, and more."
              : "Mercury works seamlessly with any phone system, including Twilio, RingCentral, Aircall, and more."}
          </p>
        </div>

        <div className="mt-12 flex items-start gap-3">
          {typeof price === "number" ? (
            <>
              <span className="text-7xl font-bold text-zinc-900 dark:text-white">${price}</span>
              <div className="flex flex-col">
                <span className="text-xs text-zinc-900 dark:text-white -mt-3 uppercase">
                  per minute
                </span>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-4 text-left uppercase">
                  {tier.name === "Zara: Roleplay Agent" ? (
                    <>
                      1 hour<br />
                      per month<br />
                      minimum
                    </>
                  ) : (
                    <>
                      5 hours<br />
                      per month<br />
                      minimum
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <span className="text-7xl font-bold text-zinc-900 dark:text-white">{price}</span>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/sign-in" className="flex-1">
          <Button 
            className={cn(
              "w-full rounded-full py-3 text-sm font-medium",
              "bg-zinc-900 text-white hover:text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:text-zinc-900"
            )}
          >
            {tier.cta || "Free 14 day trial"}
          </Button>
        </Link>
        <Link href="/contact" className="flex-1">
          <Button 
            variant="default"
            className="w-full rounded-full py-3 text-sm font-medium"
          >
            Get a Demo
          </Button>
        </Link>
      </div>
    </Card>
  );
}