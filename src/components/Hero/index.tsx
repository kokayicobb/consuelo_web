"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import LiquidOrbButton from "@/components/roleplay/LiquidOrbButton";
import { HoverBorderGradient } from "./hover-button";

export function WavyBackgroundDemo() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-[85vh] h-[85vh] md:h-[85vh] w-full flex-col items-center justify-start bg-transparent pt-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h1 className="mb-8 text-4xl md:text-6xl font-medium text-foreground leading-tight">
          <div className="text-center block md:hidden">Train agents how to</div>
          <div className="text-center block md:hidden">close how you close.</div>
          <div className="text-center hidden md:block">Train agents how to</div>
          <div className="text-center hidden md:block">close how you close.</div>
          </h1>
          
          <div className="flex justify-center">
            <LiquidOrbButton 
              size="xl"
              className="w-80 h-80"
              onClick={() => {
                // Add chat functionality here
                console.log("Starting chat with Consuelo...");
              }}
            >
              
            </LiquidOrbButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2 px-1"
        >
          <button 
            onClick={() => router.push('/mercury/roleplay/zara')}
            className="rounded-full border border-border bg-transparent px-4 py-2 text-sm text-foreground transition-colors hover:bg-card/10"
          >
           On-Call Coach
          </button>
          <button className="rounded-full border border-border bg-transparent px-4 py-2 text-sm text-foreground transition-colors hover:bg-card/10">
            Sales Roleplay
          </button>
          <button className="rounded-full border border-border bg-transparent px-4 py-2 text-sm text-foreground transition-colors hover:bg-card/10">
            Call Analytics
          </button>
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
          >
            <span>Talk to Consuelo</span>
          </HoverBorderGradient>
        
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-1 md:bottom-0 left-1/2 flex -translate-x-1/2 flex-row items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            opacity: {
              duration: 0.5,
              delay: 1,
            },
          },
        }}
      >
        <p className="text-sm text-muted-foreground">Scroll to explore</p>
        <svg
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
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </motion.div>
    </div>
  );
}