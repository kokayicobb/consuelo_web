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
    <div className="relative mx-auto flex max-w-full overflow-hidden px-12 pt-16 pb-12 sm:px-6 lg:px-8">
    {/* Content Container */}
    <div className="container relative z-10 mx-auto">
      <div className="animate-fade-in flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-violet-100 px-4 py-2 text-base font-medium dark:bg-violet-100">
            <Zap className="mr-2 h-5 w-5 text-violet-600 dark:text-violet-600" />
            <span className="text-violet-900 dark:text-violet-900">
              Revolutionizing E-commerce Fitting
            </span>
          </div>
          
          <h1 className="font-regular max-w-4xl text-center text-5xl tracking-tighter md:text-7xl">
            <span className="text-spektr-cyan-50 mb-4 block">This is something</span>
            <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-2">
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
          
          <p className="mt-6 max-w-2xl text-lg text-violet-950 dark:text-violet-950 sm:text-xl">
            Be the brand that nails the perfect fit every time by giving your
            customers AI-driven sizing recommendations that boost their
            confidence when they shop online.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-6">
            <Link
              href="/contact"
              className="group relative inline-flex h-12 w-full transform cursor-pointer items-center justify-center overflow-hidden rounded-md px-8 transition-transform duration-300 hover:scale-105 sm:w-auto"
            >
              <span className="absolute inset-0 z-[1] rounded-md border border-violet-600"></span>
              <span className="absolute inset-0 z-[2] rounded-md bg-violet-600 opacity-100 transition-opacity duration-300 group-hover:opacity-90"></span>
              <span className="relative z-[3] flex items-center text-base font-medium text-white">
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
              className="group relative inline-flex h-12 w-full transform cursor-pointer items-center justify-center overflow-hidden rounded-md px-8 transition-transform duration-300 hover:scale-105 sm:w-auto"
            >
              <span className="absolute inset-0 z-[1] rounded-md bg-gradient-to-r from-pink-500 to-blue-500 opacity-100"></span>
              <span className="absolute inset-[2px] z-[2] rounded-[3px] bg-[hsl(270,95%,95%)]"></span>
              <span className="relative z-[3] flex items-center bg-gradient-to-r from-[#FF1493] to-[#00BFFF] bg-clip-text text-base font-medium text-transparent">
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
          
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            No credit card required. Start for free.
          </p>
        </div>
      </div>
    </div>
  );
}

export { Hero };
