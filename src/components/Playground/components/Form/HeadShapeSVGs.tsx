import React from 'react';

interface HeadShapeSVGProps {
  className?: string;
}

export const LongOvalHead: React.FC<HeadShapeSVGProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Long/Oval head shape">
    <ellipse cx="50" cy="50" rx="30" ry="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="40" cy="45" r="3" fill="currentColor"/>
    <circle cx="60" cy="45" r="3" fill="currentColor"/>
    <path d="M40,60 Q50,65 60,60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const RoundHead: React.FC<HeadShapeSVGProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Round head shape">
    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="40" cy="45" r="3" fill="currentColor"/>
    <circle cx="60" cy="45" r="3" fill="currentColor"/>
    <path d="M40,60 Q50,68 60,60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const IntermediateHead: React.FC<HeadShapeSVGProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Intermediate head shape">
    <ellipse cx="50" cy="50" rx="32" ry="37" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="40" cy="45" r="3" fill="currentColor"/>
    <circle cx="60" cy="45" r="3" fill="currentColor"/>
    <path d="M40,60 Q50,66 60,60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
