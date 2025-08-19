'use client';

import { ReactNode } from 'react';

interface LiquidOrbButtonProps {
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  disabled?: boolean;
  isPressed?: boolean;
  className?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function LiquidOrbButton({
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  disabled = false,
  isPressed = false,
  className = '',
  children,
  size = 'lg'
}: LiquidOrbButtonProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
    xl: 'w-48 h-48'
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

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
          ${isPressed ? 'scale-95' : 'hover:scale-105'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${className}
        `}
      >
        {/* Glass background with subtle color */}
        <div className="glass-base absolute inset-0 rounded-full" />
        
        {/* Multiple flowing liquid blobs */}
        <div className="liquid-blob-1 absolute inset-0" />
        <div className="liquid-blob-2 absolute inset-0" />
        <div className="liquid-blob-3 absolute inset-0" />
        <div className="liquid-blob-4 absolute inset-0" />
        <div className="liquid-blob-5 absolute inset-0" />
        <div className="liquid-blob-6 absolute inset-0" />
        
        {/* Glass refraction effect */}
        <div className="glass-refraction absolute inset-0 rounded-full" />
        
        {/* Subtle edge highlight for glass effect */}
        <div className="glass-edge absolute inset-0 rounded-full" />
        
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
            0 8px 32px rgba(139, 92, 246, 0.15),
            inset 0 0 20px rgba(255, 255, 255, 0.05);
        }

        .liquid-orb-button:hover {
          box-shadow: 
            0 12px 40px rgba(139, 92, 246, 0.25),
            inset 0 0 30px rgba(255, 255, 255, 0.08);
        }

        .glass-base {
          background: radial-gradient(circle at center, 
            rgba(255, 255, 255, 0.03) 0%, 
            rgba(139, 92, 246, 0.05) 50%,
            rgba(124, 58, 237, 0.08) 100%
          );
        }

        .liquid-blob-1 {
          background: radial-gradient(circle at 25% 25%, 
            rgba(147, 51, 234, 0.25) 0%, 
            rgba(168, 85, 247, 0.15) 30%, 
            transparent 70%
          );
          border-radius: 40% 60% 70% 30% / 60% 40% 30% 70%;
          animation: blob1 12s ease-in-out infinite;
          filter: blur(8px);
        }

        .liquid-blob-2 {
          background: radial-gradient(circle at 75% 75%, 
            rgba(139, 92, 246, 0.2) 0%, 
            rgba(124, 58, 237, 0.12) 35%, 
            transparent 65%
          );
          border-radius: 60% 40% 30% 70% / 40% 60% 70% 30%;
          animation: blob2 15s ease-in-out infinite reverse;
          filter: blur(10px);
        }

        .liquid-blob-3 {
          background: radial-gradient(circle at 50% 80%, 
            rgba(167, 139, 250, 0.18) 0%, 
            rgba(139, 92, 246, 0.1) 40%, 
            transparent 70%
          );
          border-radius: 30% 70% 40% 60% / 70% 30% 60% 40%;
          animation: blob3 18s ease-in-out infinite;
          filter: blur(12px);
        }

        .liquid-blob-4 {
          background: radial-gradient(circle at 20% 60%, 
            rgba(124, 58, 237, 0.22) 0%, 
            rgba(147, 51, 234, 0.08) 45%, 
            transparent 75%
          );
          border-radius: 70% 30% 60% 40% / 30% 70% 40% 60%;
          animation: blob4 20s ease-in-out infinite reverse;
          filter: blur(9px);
        }

        .liquid-blob-5 {
          background: radial-gradient(circle at 80% 30%, 
            rgba(168, 85, 247, 0.15) 0%, 
            rgba(139, 92, 246, 0.08) 50%, 
            transparent 80%
          );
          border-radius: 50% 50% 30% 70% / 60% 40% 60% 40%;
          animation: blob5 14s ease-in-out infinite;
          filter: blur(11px);
        }

        .liquid-blob-6 {
          background: radial-gradient(circle at 40% 40%, 
            rgba(147, 51, 234, 0.2) 0%, 
            rgba(124, 58, 237, 0.1) 40%, 
            transparent 60%
          );
          border-radius: 40% 60% 50% 50% / 50% 50% 50% 50%;
          animation: blob6 16s ease-in-out infinite reverse;
          filter: blur(7px);
        }

        .glass-refraction {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            transparent 40%,
            rgba(255, 255, 255, 0.05) 60%,
            transparent 100%
          );
          mix-blend-mode: overlay;
        }

        .glass-edge {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            inset 0 0 20px rgba(139, 92, 246, 0.05),
            inset 0 0 40px rgba(168, 85, 247, 0.03);
        }

        @keyframes blob1 {
          0%, 100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          25% {
            transform: translate(30%, -20%) scale(1.3) rotate(90deg);
          }
          50% {
            transform: translate(-20%, 30%) scale(0.8) rotate(180deg);
          }
          75% {
            transform: translate(-30%, -10%) scale(1.1) rotate(270deg);
          }
        }

        @keyframes blob2 {
          0%, 100% {
            transform: translate(0, 0) scale(1.2) rotate(0deg);
          }
          33% {
            transform: translate(-25%, 25%) scale(0.9) rotate(120deg);
          }
          66% {
            transform: translate(35%, -15%) scale(1.4) rotate(240deg);
          }
        }

        @keyframes blob3 {
          0%, 100% {
            transform: translate(0, 0) scale(0.9) rotate(0deg);
          }
          20% {
            transform: translate(20%, -30%) scale(1.2) rotate(72deg);
          }
          40% {
            transform: translate(-35%, 20%) scale(1) rotate(144deg);
          }
          60% {
            transform: translate(25%, 35%) scale(1.3) rotate(216deg);
          }
          80% {
            transform: translate(-15%, -25%) scale(0.85) rotate(288deg);
          }
        }

        @keyframes blob4 {
          0%, 100% {
            transform: translate(0, 0) scale(1.1) rotate(0deg);
          }
          25% {
            transform: translate(-20%, -35%) scale(1.35) rotate(90deg);
          }
          50% {
            transform: translate(30%, 25%) scale(0.75) rotate(180deg);
          }
          75% {
            transform: translate(-25%, 15%) scale(1.15) rotate(270deg);
          }
        }

        @keyframes blob5 {
          0%, 100% {
            transform: translate(0, 0) scale(1.25) rotate(0deg);
          }
          30% {
            transform: translate(35%, 20%) scale(0.95) rotate(108deg);
          }
          60% {
            transform: translate(-30%, -35%) scale(1.35) rotate(216deg);
          }
          90% {
            transform: translate(20%, -20%) scale(1.05) rotate(324deg);
          }
        }

        @keyframes blob6 {
          0%, 100% {
            transform: translate(0, 0) scale(0.85) rotate(0deg);
          }
          35% {
            transform: translate(-35%, 30%) scale(1.25) rotate(126deg);
          }
          70% {
            transform: translate(40%, -25%) scale(0.95) rotate(252deg);
          }
        }

        /* Pressed state - speeds up animations */
        .liquid-orb-button:active .liquid-blob-1 { animation-duration: 3s; }
        .liquid-orb-button:active .liquid-blob-2 { animation-duration: 3.5s; }
        .liquid-orb-button:active .liquid-blob-3 { animation-duration: 4s; }
        .liquid-orb-button:active .liquid-blob-4 { animation-duration: 4.5s; }
        .liquid-orb-button:active .liquid-blob-5 { animation-duration: 3.2s; }
        .liquid-orb-button:active .liquid-blob-6 { animation-duration: 3.8s; }

        /* Disabled state */
        .liquid-orb-button:disabled .liquid-blob-1,
        .liquid-orb-button:disabled .liquid-blob-2,
        .liquid-orb-button:disabled .liquid-blob-3,
        .liquid-orb-button:disabled .liquid-blob-4,
        .liquid-orb-button:disabled .liquid-blob-5,
        .liquid-orb-button:disabled .liquid-blob-6 {
          animation-play-state: paused;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}