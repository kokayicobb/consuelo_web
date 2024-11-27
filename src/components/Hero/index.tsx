"use client";

import React from "react";
import { WavyBackground } from "../ui/wavy-background";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from 'lucide-react';
import Link from "next/link";

export function WavyBackgroundDemo() {
  return (
    <WavyBackground className="max-w-full mx-auto py-0 md:py-0">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-100 px-3 py-1 text-sm font-medium">
            <Zap className="mr-1 h-4 w-4 text-violet-600 dark:text-violet-600" />
            <span className="text-violet-900 dark:text-violet-900">
              Revolutionizing E-commerce Fitting
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-violet-800 dark:text-violet-800">Perfect fit.</span>{" "}
            <span className="text-violet-950 dark:text-violet-950">Powered by tomorrow's tech.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-violet-950 dark:text-violet-950">
            Be the brand that nails the perfect fit every time by giving your
            customers AI-driven sizing recommendations that boost their
            confidence when they shop online.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 text-white">
              <Link href="/contact">Get Started</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="bg-black text-violet-400 border-black hover:bg-black hover:border-black hover:opacity-80"
            >
              <Link href="/contact">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </WavyBackground>
  );
}