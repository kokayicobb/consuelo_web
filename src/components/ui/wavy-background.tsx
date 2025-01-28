
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
    "#c4b5fd",
    "#818cf8",
    "#6366f1",
    "#4f46e5",
    "#4338ca"
  ];

  const drawWave = (n: number) => {
    ctx.beginPath();
    ctx.lineWidth = waveWidth || 50;
    ctx.strokeStyle = waveColors[n % waveColors.length];
    // Adjust step calculation for better performance
    const step = Math.max(2, Math.floor(w / 150)); // More points on larger screens
    for (i = 0; i <= w + step; i += step) {
      // Normalize noise input based on screen width
      const noiseInput = i / (w * 0.3); // Adjust this value to control wave frequency
      // Scale noise output by screen height
      x = noise(noiseInput, 0.3 * n, nt) * (h * 0.15); // Adjust 0.15 to control wave amplitude
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
    // Adjust wave count based on screen size
    const waveCount = Math.floor(Math.min(6, Math.max(3, w / 200)));
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