"use client";

import React from "react";
import { WavyBackground } from "../ui/wavy-background";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export function WavyBackgroundDemo() {
  return (
    <WavyBackground className="max-w-full mx-auto py-12 md:py-12 px-12 sm:px-6 lg:px-8 min-h-screen flex items-center relative">
      {/* Animated background waves */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Add your animation logic or SVG waves here */}
      </div>
      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div className="mb-6 inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-100 px-3 py-1 text-sm font-medium">
            <Zap className="mr-1 h-4 w-4 text-violet-600 dark:text-violet-600" />
            <span className="text-violet-900 dark:text-violet-900">
              Revolutionizing E-commerce Fitting
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-purple-900">
              Perfect fit.
            </span>{" "}
            <span className="text-violet-950 dark:text-violet-950">
              Powered by tomorrow's tech.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-violet-950 dark:text-violet-950">
            Be the brand that nails the perfect fit every time by giving your
            customers AI-driven sizing recommendations that boost their
            confidence when they shop online.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white transform hover:scale-105 transition-transform duration-300"
            >
              <Link href="/contact">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-black text-violet-400 border-black hover:bg-black hover:border-black hover:opacity-80 transform hover:scale-105 transition-transform duration-300"
            >
              <Link href="/contact">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            No credit card required. Start for free.
          </p>
        </div>
      </div>
    </WavyBackground>
  );
}