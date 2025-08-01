"use client"
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import GoogleCalendarSVG from "../ui/Logos/google-calendar";
import HubSpotSVG from "../ui/Logos/hubspot";
import KlaviyoLogoSVG from "../ui/Logos/klaviyo";
import MicrosoftTeamsSVG from "../ui/Logos/microsoft-teams";
import MindBodySVG from "../ui/Logos/mindbody";
import ShopifySVG from "../ui/Logos/shopify";
import StripeSVG from "../ui/Logos/stripe";
import WooCommerceSVG from "../ui/Logos/woocommerce";
import MuseCRMComparator from "./ui/comparison";
import { useState } from "react";
import DemoRequestModal from "./ui/request-demo";

export default function PlatformSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 isolate hidden contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-12">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
            <div className="mx-auto max-w-5xl px-6">
              <div className="sm:mx-auto lg:mr-auto lg:mt-0">
                <h1 className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16">
                  Consuelo: AI Naitve CRM
                </h1>
                <p className="mt-8 max-w-2xl text-pretty text-lg">
                  Unify your data and unlock actionable insights with our
                  specialized CRM for E-Commerce and Health & Fitness
                  businesses.
                </p>

                <div className="mt-12 flex items-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl bg-gray-800 px-5 text-base text-white hover:bg-gray-300"
                  >
                    <Link href="#link">
                      <span className="text-nowrap">Start Building</span>
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-15.5 rounded-xl border-0 bg-white px-5 text-base text-gray-700 shadow-none outline-none ring-0 hover:bg-gray-100 focus:ring-0 focus:ring-offset-0"
                    onClick={() => setIsModalOpen(true)} // Update this line
                  >
                    <span className="text-nowrap">Request a demo</span>
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <div className="relative -mx-4 -mb-6 mt-4 overflow-hidden sm:mx-0 sm:mt-8 md:mt-12">
                <div
                  aria-hidden
                  className="bg-linear-to-b absolute inset-0 z-10 from-transparent from-35% to-background"
                />
                <div className="py-16">
                  <div className="mx-auto max-w-5xl px-6">
                    <div className="inset-shadow-2xs dark:inset-shadow-white/20 relative mx-auto w-full max-w-4xl overflow-hidden rounded-xl border-0 bg-gray-50 p-0 shadow-lg shadow-zinc-950/15 ring-0 ring-background">
                      <Image
                        className="aspect-16/9 relative hidden w-full rounded-none bg-gray-50 dark:block"
                        src="/Dashboard.png"
                        alt="Unified dashboard displaying consolidated KPIs across all connected platforms"
                        width="3000"
                        height="1688"
                        priority
                        quality={95}
                      />
                      <Image
                        className="z-2 aspect-16/9 relative w-full rounded-xl border-0 bg-gray-50 dark:hidden"
                        src="/Dashboard2.png"
                        alt="Unified dashboard displaying consolidated KPIs across all connected platforms"
                        width={3000}
                        height={1688}
                        priority
                        quality={95}
                        style={{
                          objectFit: "cover",
                          maxHeight: "calc(100vh - 160px)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-background py-8">
          <MuseCRMComparator />
        </section>
        <section className="bg-background pb-16 pt-16 md:pb-32">
          <div className="relative m-auto max-w-5xl px-6">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-medium">
                Powerful Platform Integrations
              </h2>
              <Link
                href="/integrations"
                className="inline-flex items-center text-sm hover:underline"
              >
                <span>Explore All Connections</span>
                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-14 md:grid-cols-4">
              <div className="flex">
                <KlaviyoLogoSVG />
              </div>

              <div className="flex">
                <MindBodySVG className="h-200 w-200 text-[#E85815]" />
              </div>
              <div className="flex">
                <ShopifySVG />
              </div>
              <div className="flex">
                <GoogleCalendarSVG />
              </div>
              <div className="flex">
                <MicrosoftTeamsSVG />
              </div>
              <div className="flex">
                <StripeSVG />
              </div>
              <div className="flex">
                <WooCommerceSVG />
              </div>
              <div className="flex">
                <HubSpotSVG />
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Add the modal component */}
      <DemoRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
