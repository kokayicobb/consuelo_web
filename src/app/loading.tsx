"use client"
import React from 'react';

const LoaderWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#111111] z-50">
    {children}
  </div>
);

const ShimmerLoader = () => (
  <LoaderWrapper>
    <div className="overflow-hidden">
      <h1 
        className="text-6xl font-bold font-mono"
        style={{ 
					fontFamily: "'Inter', sans-serif",
					background: 'linear-gradient(to right, #8A2BE2, #FF69B4)',
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					backgroundSize: '200% 100%',
					animation: 'shimmerText 4s infinite linear'
				}}
      >
        CONSUELO
      </h1>
      <style jsx>{`
        @keyframes shimmerText {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  </LoaderWrapper>
);

export default ShimmerLoader;

