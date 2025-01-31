"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => [
      "Effortless",
      "Accurate",
      "Innovative",
      "Seamless",
      "Personalized",
      "Smart",
      "Revolutionary",
      "Confident",
      "Precise",
      "Tailored",
    ],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-full items-center overflow-hidden px-12 pb-12 pt-6 sm:px-6 md:pt-8 lg:px-8">
      {/* Wavy Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 w-[300%] -translate-x-1/2 -translate-y-1/2 md:w-[240%] lg:w-[170%] xl:w-[140%] 2xl:w-[120%]">
          <svg
            viewBox="0 0 1200 800"
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="pathGradient"
                x1="0%"
                y1="50%"
                x2="100%"
                y2="50%"
              >
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6d28d9" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="areaGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.05" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d="M 0 500 Q 600 -100 1200 500"
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="2"
              filter="url(#glow)"
              className="animate-orb-path"
            />

            <path
              d="M 0 500 Q 600 -100 1200 500 L 1200 800 L 0 800 Z"
              fill="url(#areaGradient)"
              className="opacity-80"
            />
          </svg>
        </div>

        <div className="animate-gradient-pulse absolute inset-0 bg-gradient-to-b from-violet-500/10 via-violet-400/15 to-transparent" />
      </div>
      {/* Content Container */}
      <div className="container relative z-10 mx-auto">
        <div className="animate-fade-in flex flex-col items-center text-center">
          <div className="mb-2 inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-sm font-medium dark:bg-violet-100">
            <Zap className="mr-1 h-4 w-4 text-violet-600 dark:text-violet-600" />
            <span className="text-violet-900 dark:text-violet-900">
              Revolutionizing E-commerce Fitting
            </span>
          </div>
          <h1 className="font-regular max-w-2xl text-center text-4xl tracking-tighter md:text-6xl">
            <span className="text-spektr-cyan-50 mb-2">This is something</span>
            <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-2 md:pt-0">
              &nbsp;
              {titles.map((title, index) => (
                <motion.span
                  key={index}
                  className="absolute font-semibold"
                  initial={{ opacity: 0, y: "-100" }}
                  transition={{ type: "spring", stiffness: 50 }}
                  animate={
                    titleNumber === index
                      ? {
                          y: 0,
                          opacity: 1,
                        }
                      : {
                          y: titleNumber > index ? -150 : 150,
                          opacity: 0,
                        }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-base text-violet-950 dark:text-violet-950 sm:text-lg">
            Be the brand that nails the perfect fit every time by giving your
            customers AI-driven sizing recommendations that boost their
            confidence when they shop online.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-6">
            <Link
              href="/contact"
              className="group relative inline-flex h-10 w-full transform cursor-pointer items-center justify-center overflow-hidden rounded-md px-8 transition-transform duration-300 hover:scale-105 sm:w-auto"
            >
              <span className="absolute inset-0 z-[1] rounded-md border border-violet-600"></span>
              <span className="absolute inset-0 z-[2] rounded-md bg-violet-600 opacity-100 transition-opacity duration-300 group-hover:opacity-90"></span>
              <span className="relative z-[3] flex items-center text-sm font-medium text-white">
                Get Started
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="ml-2 h-4 w-4"
                >
                  <path
                    d="M9 6L15 12L9 18"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
            <Link
              href="/virtual-try-on"
              className="group relative inline-flex h-10 w-full transform cursor-pointer items-center justify-center overflow-hidden rounded-md px-8 transition-transform duration-300 hover:scale-105 sm:w-auto"
            >
              <span className="absolute inset-0 z-[1] rounded-md bg-gradient-to-r from-pink-500 to-blue-500 opacity-100"></span>
              <span className="absolute inset-[2px] z-[2] rounded-[3px] bg-[hsl(270,95%,95%)]"></span>
              <span className="relative z-[3] flex items-center bg-gradient-to-r from-[#FF1493] to-[#00BFFF] bg-clip-text text-sm font-medium text-transparent">
                Demo Playground
                <ArrowRight
                  strokeWidth={2}
                  className="ml-2 h-4 w-4 [&>path]:fill-transparent [&>path]:stroke-[url(#gradient)]"
                />
                <svg width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#FF1493" />
                      <stop offset="100%" stopColor="#00BFFF" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            No credit card required. Start for free.
          </p>
        </div>
      </div>
    </div>
  );
}

export { Hero };
