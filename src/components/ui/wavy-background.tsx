"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

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
    w = ctx.canvas.width = window.innerWidth;
    h = ctx.canvas.height = window.innerHeight;
    ctx.filter = `blur(${blur}px)`;
    nt = 0;
    window.onresize = function () {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };
    render();
  };

  const waveColors = colors ?? [
    "#c4b5fd",
    "#818cf8",
    "#6366f1",
    "#4f46e5",
    "#4338ca",
  ];

  const drawWave = (n: number) => {
    ctx.beginPath();
    ctx.lineWidth = waveWidth || 50;
    ctx.strokeStyle = waveColors[n % waveColors.length];
    for (i = 0; i < w; i += 5) {
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
    for (let n = 0; n < 4; n++) {
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
        "min-h-[800px] flex flex-col items-center justify-center overflow-hidden",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
      ></canvas>
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};

