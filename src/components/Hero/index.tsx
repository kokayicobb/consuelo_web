"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { Hero } from "@/components/ui/animated-hero";

export function WavyBackgroundDemo() {
  return (
    <div className="block">
      <Hero />
    </div>
  );
}
