"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

const getPixelRatio = (context: CanvasRenderingContext2D) => {
  return window.devicePixelRatio || 1;
};

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: any;
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
  const noise = createNoise3D();
  let w: number,
    h: number,
    nt: number,
    i: number,
    x: number,
    ctx: any,
    canvas: any;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  const init = () => {
    canvas = canvasRef.current;
    ctx = canvas.getContext("2d");
    w = window.innerWidth;
    h = window.innerHeight;
    const pixelRatio = getPixelRatio(ctx);
    canvas.width = w * pixelRatio;
    canvas.height = h * pixelRatio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(pixelRatio, pixelRatio);
    ctx.filter = `blur(${blur}px)`;
    nt = 0;

    window.onresize = function () {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * pixelRatio;
      canvas.height = h * pixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(pixelRatio, pixelRatio);
      ctx.filter = `blur(${blur}px)`;
    };

    render();
  };

  const waveColors = colors ?? [
    "#c4b5fd",  // Lighter violet
    "#818cf8",  // Light indigo
    "#6366f1",  // Indigo
    "#4f46e5",  // Darker indigo
    "#4338ca"   // Darkest indigo
  ];

  const drawWave = (n: number) => {
    ctx.beginPath();
    ctx.lineWidth = waveWidth || 50;
    ctx.strokeStyle = waveColors[n % waveColors.length];
    const step = Math.max(5, Math.floor(w / 100));
    for (i = 0; i < w; i += step) {
      x = noise(i / 800, 0.3 * n, nt) * 100;
      ctx.lineTo(i, h * 0.5 + x);
    }
    ctx.stroke();
    ctx.closePath();
  };

  const render = () => {
    nt += getSpeed();
    ctx.fillStyle = backgroundFill || "hsl(270, 95%, 95%)";
    ctx.globalAlpha = waveOpacity || 0.5;
    ctx.fillRect(0, 0, w, h);
    const waveCount = w < 600 ? 2 : 4;
    for (let n = 0; n < waveCount; n++) {
      drawWave(n);
    }
    requestAnimationFrame(render);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center overflow-hidden",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
      ></canvas>
      <div
        className={cn(
          "relative z-10 w-full px-4 py-10 md:py-20",
          "flex flex-col items-center justify-center",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default WavyBackground;