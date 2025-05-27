"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PaperclipIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function WavyBackgroundDemo() {
  const [inputValue, setInputValue] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationState, setAnimationState] = useState<"idle" | "animating">(
    "idle",
  );
  const [isFocused, setIsFocused] = useState(false);

  const placeholders = [
    "Help me log this sales call with auto-populated notes...",
    "Analyze my customer data to identify churn risks...",
    "Show me which leads need follow-up this week...",
    "Create a customized email sequence for new clients...",
    "Generate a performance report for my marketing campaigns...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (animationState === "idle" && !inputValue) {
        setAnimationState("animating");
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % placeholders.length);
          setAnimationState("idle");
        }, 1000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [animationState, placeholders.length, inputValue]);

  return (
    <div className="relative flex min-h-[80vh] w-full flex-col items-center justify-center bg-transparent">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-medium text-foreground">
          How can I help your team?
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-2xl px-1"
        >
          <div className="relative w-full">
            <div
              className={cn(
                "relative rounded-3xl border border-border bg-transparent transition-all duration-300",
                "shadow-[0_0_15px_rgba(0,0,0,0.05)]",
                isFocused
                  ? "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
                  : "hover:shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.05)]",
              )}
            >
              <div className="relative min-h-[120px] w-full">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="min-h-[120px] w-full resize-none rounded-3xl bg-transparent px-4 py-5 text-foreground outline-none"
                  placeholder=""
                />

                {!inputValue && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden px-4 py-5 text-muted-foreground">
                    <div className="relative h-full">
                      <motion.div
                        key={`current-${currentIndex}`}
                        initial={{ y: 0, opacity: 1 }}
                        animate={{
                          y: animationState === "animating" ? -20 : 0,
                          opacity: animationState === "animating" ? 0 : 1,
                        }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0"
                      >
                        {placeholders[currentIndex]}
                      </motion.div>

                      <motion.div
                        key={`next-${currentIndex}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{
                          y: animationState === "animating" ? 0 : 20,
                          opacity: animationState === "animating" ? 1 : 0,
                        }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0"
                      >
                        {placeholders[(currentIndex + 1) % placeholders.length]}
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button className="rounded-full p-1.5 transition-colors hover:bg-muted/20">
                  <PaperclipIcon size={18} className="text-muted-foreground" />
                </button>
                <button className="rounded-full bg-emerald-600 p-1.5 text-white">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 4V20M12 4L6 10M12 4L18 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 px-1"
        >
          <button className="rounded-full border border-border bg-transparent px-4 py-2 text-sm text-foreground transition-colors hover:bg-card/10">
            Lead Scoring
          </button>
          <button className="rounded-full border border-border bg-transparent px-4 py-2 text-sm text-foreground transition-colors hover:bg-card/10">
            Call Notes
          </button>
          <button className="rounded-full border border-border bg-transparent px-4 py-2 text-sm text-foreground transition-colors hover:bg-card/10">
            Data Integration
          </button>
          <button className="rounded-full border border-border bg-transparent px-4 py-2 text-sm text-foreground transition-colors hover:bg-card/10">
            Churn Analysis
          </button>
          <button className="rounded-full border border-border bg-transparent px-4 py-2 text-sm text-foreground transition-colors hover:bg-card/10">
            Reporting
          </button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-row items-center gap-1"
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