"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface CircularRunnerButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CircularRunnerButton({
  children,
  className,
  onClick,
}: CircularRunnerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-full border border-border bg-transparent px-4 py-2 text-sm text-foreground transition-colors hover:bg-card/10",
        className
      )}
    >
      <div className="absolute inset-0 rounded-full">
        <div className="absolute inset-0 rounded-full opacity-30">
          <div 
            className="absolute h-1.5 w-1.5 rounded-full bg-purple-500 shadow-lg shadow-purple-500/60 animate-spin-orbit"
            style={{
              top: '2px',
              left: '50%',
              transformOrigin: '0 calc(50% + 18px)',
            }}
          />
        </div>
      </div>
      <span className="relative z-10">{children}</span>
    </button>
  );
}