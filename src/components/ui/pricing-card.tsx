"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckIcon, ArrowRightIcon } from "lucide-react"
import NumberFlow from "@number-flow/react"

export type PlanLevel = "starter" | "pro" |  "custom" |"all" |string

export interface PricingFeature {
  name: string
  included: PlanLevel | null
}

export interface PricingPlan {
  name: string
  level: PlanLevel
  price: {
    monthly: number
    yearly: number
  }
  popular?: boolean
}

export interface PricingTableProps
  extends React.HTMLAttributes<HTMLDivElement> {
  features: PricingFeature[]
  plans: PricingPlan[]
  onPlanSelect?: (plan: PlanLevel) => void
  defaultPlan?: PlanLevel
  defaultInterval?: "monthly" | "yearly"
  containerClassName?: string
  buttonClassName?: string
}

export function PricingTable({
  features,
  plans,
  onPlanSelect,
  defaultPlan = "pro",
  defaultInterval = "monthly",
  className,
  containerClassName,
  buttonClassName,
  ...props
}: PricingTableProps) {
  const [isYearly, setIsYearly] = React.useState(defaultInterval === "yearly")
  const [selectedPlan, setSelectedPlan] = React.useState<PlanLevel>(defaultPlan)

  const handlePlanSelect = (plan: PlanLevel) => {
    setSelectedPlan(plan)
    onPlanSelect?.(plan)
  }

  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-4 sm:py-8 md:py-16 px-4",
        "fade-bottom overflow-hidden pb-0",
      )}
    >
      <div
        className={cn("w-full max-w-3xl mx-auto px-4", containerClassName)}
        {...props}
      >
        <div className="flex justify-end mb-4 sm:mb-8">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-3 py-1 rounded-md transition-colors",
                !isYearly ? "bg-accent/10 text-accent" : "text-muted-foreground",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-3 py-1 rounded-md transition-colors",
                isYearly ? "bg-accent/10 text-accent" : "text-muted-foreground",
              )}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => handlePlanSelect(plan.level)}
              className={cn(
                "flex-1 p-4 rounded-xl text-left transition-all",
                "border border-border",
                selectedPlan === plan.level &&
                  "ring-2 ring-accent ring-offset-2 ring-offset-background",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{plan.name}</span>
                {plan.popular && (
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
							<NumberFlow
                  format={{
                    style: "currency",
                    currency: "USD",
                    trailingZeroDisplay: "stripIfInteger",
                  }}
                  value={isYearly ? plan.price.yearly : plan.price.monthly}
                  className="text-2xl font-bold"
                />
                <span className="text-sm font-normal text-muted-foreground">
                  /{isYearly ? "year" : "month"}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px] divide-y divide-border">
              <div className="flex items-center p-4 bg-muted/50">
                <div className="flex-1 text-sm font-medium">Features</div>
                <div className="flex items-center gap-8 text-sm">
                  {plans.map((plan) => (
                    <div
                      key={plan.level}
                      className="w-16 text-center font-medium"
                    >
                      {plan.name}
                    </div>
                  ))}
                </div>
              </div>
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className={cn(
                    "flex items-center p-4 transition-colors",
                    feature.included === selectedPlan &&
                      "bg-accent/5",
                  )}
                >
                  <div className="flex-1 text-sm">{feature.name}</div>
                  <div className="flex items-center gap-8 text-sm">
                    {plans.map((plan) => (
                      <div
                        key={plan.level}
                        className={cn(
                          "w-16 flex justify-center",
                          plan.level === selectedPlan && "font-medium",
                        )}
                      >
                        {shouldShowCheck(feature.included, plan.level) ? (
                          <CheckIcon className="w-5 h-5 text-accent" />
                        ) : (
                          <span className="text-muted-foreground/30">
                            -
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            className={cn(
              "w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-2 rounded-xl",
              buttonClassName,
            )}
          >
            Get started with {plans.find((p) => p.level === selectedPlan)?.name}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}

function shouldShowCheck(
  included: PricingFeature["included"],
  level: string,
): boolean {
  if (included === "all") return true;
  if (level === "custom") return included === "custom" || included === "all";
  if (level === "scale") return included === "scale" || included === "pro" || included === "starter" || included === "all";
  if (level === "pro") return included === "pro" || included === "starter" || included === "all";
  if (level === "starter") return included === "starter" || included === "all";
  return false;
}