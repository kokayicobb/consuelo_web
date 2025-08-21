"use client"

import type { ReactNode } from "react"

interface LiquidOrbButtonProps {
  onMouseDown?: () => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: () => void
  onTouchEnd?: () => void
  disabled?: boolean
  isPressed?: boolean
  className?: string
  children: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export default function LiquidOrbButton({
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  disabled = false,
  isPressed = false,
  className = "",
  children,
  size = "lg",
}: LiquidOrbButtonProps) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
    xl: "w-48 h-48",
  }

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  }

  return (
    <div className="relative">
      <button
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        disabled={disabled}
        className={`
          liquid-orb-button
          ${sizeClasses[size]}
          rounded-full
          relative
          overflow-hidden
          border-0
          transition-transform
          duration-300
          ease-out
          ${isPressed ? "scale-95" : "hover:scale-105"}
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          ${className}
        `}
      >
        {/* Glass background with subtle color */}
        <div className="glass-base absolute inset-0 rounded-full" />

        {/* Inner shadow for bowl depth */}
        <div className="inner-shadow absolute inset-0 rounded-full" />

        {/* Highlight for 3D curvature */}
        <div className="sphere-highlight absolute inset-0 rounded-full" />

        {/* Multiple flowing liquid blobs - now with lighter, more water-like colors */}
        <div className="liquid-blob-1 absolute inset-0" />
        <div className="liquid-blob-2 absolute inset-0" />
        <div className="liquid-blob-3 absolute inset-0" />
        <div className="liquid-blob-4 absolute inset-0" />
        <div className="liquid-blob-5 absolute inset-0" />
        <div className="liquid-blob-6 absolute inset-0" />

        <div className="liquid-streak-1 absolute inset-0" />
        <div className="liquid-streak-2 absolute inset-0" />
        <div className="liquid-streak-3 absolute inset-0" />

        {/* Glass refraction effect */}
        <div className="glass-refraction absolute inset-0 rounded-full" />

        {/* Enhanced edge highlight with 3D rim lighting effect */}
        <div className="glass-edge absolute inset-0 rounded-full" />

        {/* Top highlight for glass sphere effect */}
        <div className="top-highlight absolute inset-0 rounded-full" />

        {/* Content */}
        <div className={`relative z-10 flex items-center justify-center text-white/90 ${iconSizes[size]}`}>
          {children}
        </div>
      </button>

      <style jsx>{`
        .liquid-orb-button {
          background: transparent;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 
            0 8px 32px rgba(139, 92, 246, 0.1),
            inset 0 0 20px rgba(255, 255, 255, 0.08);
        }

        .liquid-orb-button:hover {
          box-shadow: 
            0 12px 40px rgba(139, 92, 246, 0.15),
            inset 0 0 30px rgba(255, 255, 255, 0.12);
        }

        .glass-base {
          background: radial-gradient(circle at center, 
            rgba(255, 255, 255, 0.08) 0%, 
            rgba(139, 92, 246, 0.03) 50%,
            rgba(124, 58, 237, 0.05) 100%
          );
        }

        /* Added 3D depth effects */
        .inner-shadow {
          background: radial-gradient(circle at center, 
            transparent 0%,
            transparent 60%,
            rgba(88, 28, 135, 0.15) 85%,
            rgba(59, 7, 100, 0.25) 100%
          );
          mix-blend-mode: multiply;
        }

        .sphere-highlight {
          background: radial-gradient(ellipse 60% 40% at 35% 25%, 
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 255, 255, 0.12) 30%,
            transparent 70%
          );
          mix-blend-mode: overlay;
        }

        .top-highlight {
          background: radial-gradient(ellipse 80% 30% at 50% 15%, 
            rgba(255, 255, 255, 0.18) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 100%
          );
          mix-blend-mode: screen;
        }

        /* Deeper, richer purple liquid blobs while maintaining water-like transparency */
        .liquid-blob-1 {
          background: radial-gradient(circle at 25% 25%, 
            rgba(255, 255, 255, 0.15) 0%,
            rgba(220, 208, 255, 0.12) 20%,
            rgba(109, 40, 217, 0.15) 40%,
            transparent 70%
          );
          border-radius: 40% 60% 70% 30% / 60% 40% 30% 70%;
          animation: blob1 6s ease-in-out infinite;
          filter: blur(6px);
          /* Added subtle 3D transform for depth */
          transform-style: preserve-3d;
        }

        .liquid-blob-2 {
          background: radial-gradient(circle at 75% 75%, 
            rgba(255, 255, 255, 0.12) 0%,
            rgba(196, 181, 253, 0.1) 25%,
            rgba(107, 33, 168, 0.12) 50%,
            transparent 75%
          );
          border-radius: 60% 40% 30% 70% / 40% 60% 70% 30%;
          animation: blob2 7s ease-in-out infinite reverse;
          filter: blur(8px);
          transform-style: preserve-3d;
        }

        .liquid-blob-3 {
          background: radial-gradient(circle at 50% 80%, 
            rgba(255, 255, 255, 0.18) 0%,
            rgba(233, 213, 255, 0.08) 30%,
            rgba(126, 34, 206, 0.1) 60%,
            transparent 80%
          );
          border-radius: 30% 70% 40% 60% / 70% 30% 60% 40%;
          animation: blob3 8s ease-in-out infinite;
          filter: blur(10px);
          transform-style: preserve-3d;
        }

        .liquid-blob-4 {
          background: radial-gradient(circle at 20% 60%, 
            rgba(255, 255, 255, 0.2) 0%,
            rgba(208, 188, 255, 0.1) 35%,
            rgba(88, 28, 135, 0.08) 70%,
            transparent 85%
          );
          border-radius: 70% 30% 60% 40% / 30% 70% 40% 60%;
          animation: blob4 9s ease-in-out infinite reverse;
          filter: blur(7px);
          transform-style: preserve-3d;
        }

        .liquid-blob-5 {
          background: radial-gradient(circle at 80% 30%, 
            rgba(255, 255, 255, 0.14) 0%,
            rgba(221, 214, 254, 0.08) 40%,
            rgba(124, 58, 237, 0.1) 70%,
            transparent 90%
          );
          border-radius: 50% 50% 30% 70% / 60% 40% 60% 40%;
          animation: blob5 6.5s ease-in-out infinite;
          filter: blur(9px);
          transform-style: preserve-3d;
        }

        .liquid-blob-6 {
          background: radial-gradient(circle at 40% 40%, 
            rgba(255, 255, 255, 0.16) 0%,
            rgba(245, 243, 255, 0.06) 45%,
            rgba(109, 40, 217, 0.06) 80%,
            transparent 95%
          );
          border-radius: 40% 60% 50% 50% / 50% 50% 50% 50%;
          animation: blob6 7.5s ease-in-out infinite reverse;
          filter: blur(5px);
          transform-style: preserve-3d;
        }

        /* Added light streaks for more dynamic water movement */
        .liquid-streak-1 {
          background: linear-gradient(45deg, 
            transparent 0%,
            rgba(255, 255, 255, 0.08) 20%,
            rgba(220, 208, 255, 0.06) 40%,
            transparent 60%,
            rgba(255, 255, 255, 0.04) 80%,
            transparent 100%
          );
          border-radius: 60% 40% 80% 20% / 30% 70% 20% 80%;
          animation: streak1 4s ease-in-out infinite;
          filter: blur(4px);
        }

        .liquid-streak-2 {
          background: linear-gradient(-45deg, 
            transparent 0%,
            rgba(255, 255, 255, 0.1) 30%,
            rgba(196, 181, 253, 0.05) 50%,
            transparent 70%,
            rgba(255, 255, 255, 0.06) 90%,
            transparent 100%
          );
          border-radius: 80% 20% 60% 40% / 40% 60% 30% 70%;
          animation: streak2 5s ease-in-out infinite reverse;
          filter: blur(6px);
        }

        .liquid-streak-3 {
          background: linear-gradient(135deg, 
            transparent 0%,
            rgba(255, 255, 255, 0.12) 25%,
            rgba(233, 213, 255, 0.04) 45%,
            transparent 65%,
            rgba(255, 255, 255, 0.08) 85%,
            transparent 100%
          );
          border-radius: 70% 30% 50% 50% / 60% 40% 70% 30%;
          animation: streak3 4.5s ease-in-out infinite;
          filter: blur(3px);
        }

        .glass-refraction {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.15) 0%, 
            transparent 40%,
            rgba(255, 255, 255, 0.08) 60%,
            transparent 100%
          );
          mix-blend-mode: overlay;
        }

        .glass-edge {
          background: transparent;
          /* Enhanced border with 3D rim lighting effect */
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            inset 0 0 20px rgba(255, 255, 255, 0.08),
            inset 0 0 40px rgba(139, 92, 246, 0.04),
            inset 0 2px 8px rgba(255, 255, 255, 0.15),
            inset 0 -2px 8px rgba(88, 28, 135, 0.1);
        }

        /* Enhanced animations with subtle 3D rotation for sphere effect */
        @keyframes blob1 {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg) rotateY(0deg);
          }
          25% {
            transform: translate(35%, -25%) scale(1.4) rotate(90deg) rotateY(15deg);
          }
          50% {
            transform: translate(-25%, 35%) scale(0.7) rotate(180deg) rotateY(30deg);
          }
          75% {
            transform: translate(-35%, -15%) scale(1.2) rotate(270deg) rotateY(15deg);
          }
        }

        @keyframes blob2 {
          0%, 100% {
            transform: translate(0, 0) scale(1.3) rotate(0deg) rotateX(0deg);
          }
          33% {
            transform: translate(-30%, 30%) scale(0.8) rotate(120deg) rotateX(10deg);
          }
          66% {
            transform: translate(40%, -20%) scale(1.5) rotate(240deg) rotateX(-10deg);
          }
        }

        @keyframes blob3 {
          0%, 100% {
            transform: translate(0, 0) scale(0.8) rotate(0deg) rotateY(0deg) rotateX(0deg);
          }
          20% {
            transform: translate(25%, -35%) scale(1.3) rotate(72deg) rotateY(8deg) rotateX(5deg);
          }
          40% {
            transform: translate(-40%, 25%) scale(1.1) rotate(144deg) rotateY(-8deg) rotateX(-5deg);
          }
          60% {
            transform: translate(30%, 40%) scale(1.4) rotate(216deg) rotateY(12deg) rotateX(8deg);
          }
          80% {
            transform: translate(-20%, -30%) scale(0.75) rotate(288deg) rotateY(-5deg) rotateX(-3deg);
          }
        }

        @keyframes blob4 {
          0%, 100% {
            transform: translate(0, 0) scale(1.2) rotate(0deg) rotateY(0deg);
          }
          25% {
            transform: translate(-25%, -40%) scale(1.45) rotate(90deg) rotateY(15deg);
          }
          50% {
            transform: translate(35%, 30%) scale(0.65) rotate(180deg) rotateY(30deg);
          }
          75% {
            transform: translate(-30%, 20%) scale(1.25) rotate(270deg) rotateY(15deg);
          }
        }

        @keyframes blob5 {
          0%, 100% {
            transform: translate(0, 0) scale(1.35) rotate(0deg) rotateY(0deg);
          }
          30% {
            transform: translate(40%, 25%) scale(0.85) rotate(108deg) rotateY(8deg) rotateX(5deg);
          }
          60% {
            transform: translate(-35%, -40%) scale(1.45) rotate(216deg) rotateY(-8deg) rotateX(-5deg);
          }
          90% {
            transform: translate(25%, -25%) scale(1.15) rotate(324deg) rotateY(12deg) rotateX(8deg);
          }
        }

        @keyframes blob6 {
          0%, 100% {
            transform: translate(0, 0) scale(0.75) rotate(0deg) rotateY(0deg) rotateX(0deg);
          }
          35% {
            transform: translate(-40%, 35%) scale(1.35) rotate(126deg) rotateY(8deg) rotateX(5deg);
          }
          70% {
            transform: translate(45%, -30%) scale(0.9) rotate(252deg) rotateY(-8deg) rotateX(-5deg);
          }
        }

        /* Added streak animations for flowing water effect */
        @keyframes streak1 {
          0%, 100% {
            transform: translateX(-100%) rotate(0deg) scaleY(0.5);
            opacity: 0;
          }
          50% {
            transform: translateX(100%) rotate(180deg) scaleY(1.2);
            opacity: 1;
          }
        }

        @keyframes streak2 {
          0%, 100% {
            transform: translateY(-100%) rotate(0deg) scaleX(0.6);
            opacity: 0;
          }
          50% {
            transform: translateY(100%) rotate(-180deg) scaleX(1.4);
            opacity: 1;
          }
        }

        @keyframes streak3 {
          0%, 100% {
            transform: translate(-70%, -70%) rotate(0deg) scale(0.4);
            opacity: 0;
          }
          50% {
            transform: translate(70%, 70%) rotate(135deg) scale(1.6);
            opacity: 1;
          }
        }

        /* Smoother press animations - faster than normal but not jarring */
        .liquid-orb-button:active .liquid-blob-1 { animation-duration: 3s; }
        .liquid-orb-button:active .liquid-blob-2 { animation-duration: 3.5s; }
        .liquid-orb-button:active .liquid-blob-3 { animation-duration: 4s; }
        .liquid-orb-button:active .liquid-blob-4 { animation-duration: 4.5s; }
        .liquid-orb-button:active .liquid-blob-5 { animation-duration: 3.2s; }
        .liquid-orb-button:active .liquid-blob-6 { animation-duration: 3.8s; }
        .liquid-orb-button:active .liquid-streak-1 { animation-duration: 2s; }
        .liquid-orb-button:active .liquid-streak-2 { animation-duration: 2.5s; }
        .liquid-orb-button:active .liquid-streak-3 { animation-duration: 2.2s; }

        Disabled state - keep animations and full opacity
        .liquid-orb-button:disabled .liquid-blob-1,
        .liquid-orb-button:disabled .liquid-blob-2,
        .liquid-orb-button:disabled .liquid-blob-3,
        .liquid-orb-button:disabled .liquid-blob-4,
        .liquid-orb-button:disabled .liquid-blob-5,
        .liquid-orb-button:disabled .liquid-blob-6,
        .liquid-orb-button:disabled .liquid-streak-1,
        .liquid-orb-button:disabled .liquid-streak-2,
        .liquid-orb-button:disabled .liquid-streak-3 {
          animation-play-state: running;
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
