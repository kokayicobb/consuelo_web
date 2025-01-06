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
          <Link 
              href="/contact"
              className="relative inline-flex items-center justify-center h-10 px-8 w-full sm:w-auto rounded-md cursor-pointer overflow-hidden group transform hover:scale-105 transition-transform duration-300"
            >
              {/* Border */}
              <span className="absolute inset-0 border border-violet-600 rounded-md z-[1]"></span>
              
              {/* Background */}
              <span className="absolute inset-0 bg-violet-600 rounded-md z-[2] transition-opacity duration-300 opacity-100 group-hover:opacity-90"></span>
              
              {/* Text and icon */}
              <span className="relative z-[3] flex items-center text-sm font-medium text-white">
                Get Started
                <ArrowRight strokeWidth={2} className="ml-2 h-4 w-4" />
              </span>
            </Link>
            <Link 
      
      href="/playground"
      className="relative inline-flex items-center justify-center h-10 px-8 w-full sm:w-auto rounded-md cursor-pointer overflow-hidden group transform hover:scale-105 transition-transform duration-300"
    >
      {/* Gradient border background */}
      <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 opacity-100 rounded-md z-[1]"></span>
      
      {/* Inner background - smaller to create visible border */}
      <span className="absolute inset-[2px] bg-[hsl(270,95%,95%)] rounded-[3px] z-[2]"></span>
      {/* Text and icon */}
      <span className="relative z-[3] flex items-center text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#FF1493] to-[#00BFFF]">
        Demo Playground
        <ArrowRight strokeWidth={2} className="ml-2 h-4 w-4 [&>path]:fill-transparent [&>path]:stroke-[url(#gradient)]" />
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
    </WavyBackground>
  );
}