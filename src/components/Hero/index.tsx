"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/ui/animated-hero";
import WavyBackground from "../ui/wavy-background";

export function WavyBackgroundDemo() {
  return (
    <div className="relative -mt-16"> {/* Negative margin to pull up and compensate for header space */}
    <WavyBackground
      colors={["#8b5cf6", "#7c3aed", "#6d28d9"]}
      backgroundFill="hsl(270, 95%, 95%)"
      waveOpacity={1.9}
      speed="fast"
      className="min-h-screen" // Ensure it fills the viewport
    >
      <Hero />
      </WavyBackground>
    </div>
  );
}
