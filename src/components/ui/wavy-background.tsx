import React from 'react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function FloatingPaths({ 
  position, 
  colors,
  waveOpacity = 0.5,
  waveWidth = 0.5,
  speed = "fast"
}: { 
  position: number;
  colors?: string[];
  waveOpacity?: number;
  waveWidth?: number;
  speed?: "slow" | "fast";
}) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: colors?.[i % colors.length] || `currentColor`,
    width: waveWidth + i * 0.03,
  }));

  const duration = speed === "slow" ? 30 : 20;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            strokeOpacity={waveOpacity * (0.1 + path.id * 0.03)}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: duration + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors = ["#c4b5fd", "#818cf8", "#6366f1", "#4f46e5", "#4338ca"],
  waveWidth = 0.5,
  backgroundFill = "hsl(270, 95%, 95%)",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center overflow-hidden",
        containerClassName
      )}
      style={{ background: backgroundFill }}
      {...props}
    >
      <div 
        className="absolute inset-0"
        style={{
          filter: `blur(${blur}px)`
        }}
      >
        <FloatingPaths position={1} colors={colors} waveOpacity={waveOpacity} waveWidth={waveWidth} speed={speed} />
        <FloatingPaths position={-1} colors={colors} waveOpacity={waveOpacity} waveWidth={waveWidth} speed={speed} />
      </div>
      
      <div
        className={cn(
          "relative z-10 w-full px-4 py-10 md:py-20",
          "flex flex-col items-center justify-center",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default WavyBackground;