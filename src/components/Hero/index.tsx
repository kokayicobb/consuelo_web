"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import SimpleSphere from "@/components/roleplay/SimpleSphere";
import { HoverBorderGradient } from "./hover-button";

export function WavyBackgroundDemo() {
  const router = useRouter();

  // Simplified browser detection for specific styling needs
  const isInstagram = typeof window !== 'undefined' && /Instagram/.test(navigator.userAgent);
  const isLinkedIn = typeof window !== 'undefined' && /LinkedIn/.test(navigator.userAgent);
  const isEmbeddedBrowser = isInstagram || isLinkedIn;

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div
      className="relative flex w-full flex-col items-center justify-between bg-transparent h-[80vh] max-h-[80vh] sm:h-[85vh] sm:max-h-[85vh] md:h-[90vh] md:max-h-[90vh] lg:h-[85vh] lg:max-h-[85vh] pt-4 md:pt-8 pb-0"
    >
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-4 sm:mb-6 md:mb-6 lg:mb-12 text-center"
        >
          <h1 className="mb-6 md:mb-8 text-3xl md:text-6xl font-medium text-foreground leading-tight">
            <div className="text-center">Train agents how to</div>
            <div className="text-center">close how you close.</div>
          </h1>

          <div className={`flex justify-center ${
            isEmbeddedBrowser
              ? 'mb-4 sm:mb-5' // Tighter spacing on mobile
              : 'mb-4 md:mb-6' // Slightly reduced spacing on web
          }`}>
            <SimpleSphere
              size="xl"
              className={`${
                isEmbeddedBrowser
                  ? 'w-[280px] h-[280px] sm:w-[360px] sm:h-[360px]'
                  : 'w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[560px] md:h-[560px]'
              }`}
              onClick={() => {
                console.log("Starting chat with Consuelo...");
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2 px-1"
          >
            <a
              href="/mercury"
              className="rounded-full border border-border bg-transparent px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground transition-colors hover:bg-card/10"
            >
             On-Call Coach
            </a>
            <a
              href="/zara"
              className="rounded-full border border-border bg-transparent px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground transition-colors hover:bg-card/10"
            >
              Sales Roleplay
            </a>
            <a
              href="/mercury"
              className="rounded-full border border-border bg-transparent px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-foreground transition-colors hover:bg-card/10"
            >
              Call Analytics
            </a>

            <Link href="/roleplay">
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2"
              >
                <span>Talk to Consuelo</span>
              </HoverBorderGradient>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator - responsive positioning */}
      <div className="flex flex-col items-center pb-0 sm:pb-2 md:pb-16 lg:pb-20">
        <motion.button
          onClick={scrollToFeatures}
          className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-lg p-2 min-h-[44px] min-w-[44px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              opacity: { duration: 0.5, delay: 1 },
              y: { duration: 0.5, delay: 1 },
            },
          }}
        >
          <p className="text-xs md:text-sm text-muted-foreground text-center">Scroll to explore</p>
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
            animate={{ y: [0, 5, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </motion.svg>
        </motion.button>
      </div>
    </div>
  );
}