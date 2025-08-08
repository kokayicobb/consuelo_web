import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import MindBodySVG from "./Logos/mindbody";
import GoogleCalendarSVG from "./Logos/google-calendar";
import MicrosoftTeamsSVG from "./Logos/microsoft-teams";
import ShopifySVG from "./Logos/shopify";
import StripeSVG from "./Logos/stripe";
import HubSpotSVG from "./Logos/hubspot";
import WooCommerceSVG from "./Logos/woocommerce";
import KlaviyoLogoSVG from "./Logos/klaviyo";

export default function IntegrationsSection() {
  return (
    <section>
      <div className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              Power your business with seamless integrations
            </h2>
            <p className="mt-6 text-zinc-700 dark:text-zinc-300">
              Connect your e-commerce store or fitness facility with the tools
              you already use.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <IntegrationCard
              title="Klaviyo"
              description="Supercharge your email marketing with AI-driven customer segmentation and campaign optimization based on purchase behavior."
            >
              <KlaviyoLogoSVG />
            </IntegrationCard>
            <IntegrationCard
              title="Mindbody"
              description="Integrate class schedules, member data, and attendance metrics to optimize engagement and retention strategies."
            >
              <MindBodySVG className="h-20 w-20 text-[#E85815]" />
            </IntegrationCard>
            <IntegrationCard
              title="Shopify"
              description="Seamlessly sync store data, product catalogs, and customer information to create personalized shopping experiences."
            >
              <ShopifySVG />
            </IntegrationCard>

            <IntegrationCard
              title="Google Calendar"
              description="Automate appointment scheduling with smart availability management and AI-powered booking reminders."
            >
              <GoogleCalendarSVG />
            </IntegrationCard>

            <IntegrationCard
              title="Microsoft Teams"
              description="Enable team collaboration on customer journeys with shared insights and automated workflow notifications."
            >
              <MicrosoftTeamsSVG />
            </IntegrationCard>

            <IntegrationCard
              title="Stripe"
              description="Process payments and analyze transaction patterns to identify upsell opportunities and reduce churn."
            >
              <StripeSVG />
            </IntegrationCard>

            <IntegrationCard
              title="WooCommerce"
              description="Connect your WordPress-based store for seamless data synchronization and AI-powered product recommendations."
            >
              <WooCommerceSVG />
            </IntegrationCard>

            <IntegrationCard
              title="HubSpot"
              description="Enhance your existing CRM with AI insights that predict customer needs and automate personalized outreach."
            >
              <HubSpotSVG />
            </IntegrationCard>
          </div>
        </div>
      </div>
    </section>
  );
}

const IntegrationCard = ({
  title,
  description,
  children,
  link = "",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  link?: string;
}) => {
  return (
    <Card className="flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm backdrop-blur-[2px] dark:border-white/10 dark:bg-white/5">
      <div className="relative">
        <div className="*:size-10">{children}</div>

        <div className="space-y-2 py-6">
          <h3 className="text-base font-medium text-zinc-900 dark:text-white">
            {title}
          </h3>
          <p className="line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">
            {description}
          </p>
        </div>

        <div className="flex gap-3 border-t border-zinc-200 pt-6 dark:border-white/10">
          <Button
            asChild
            variant="link"
            size="sm"
            className="gap-1 pr-2 text-zinc-300 shadow-none hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            <Link href={link}>
              Learn More
              <ChevronRight className="ml-0 !size-3.5 opacity-50" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
