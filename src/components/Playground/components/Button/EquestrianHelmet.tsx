import React from 'react';

const EquestrianHelmet = ({ className, size = 48 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Main helmet shell */}
    <path d="M4 12C4 8 7 5 12 5C17 5 20 8 20 12" />
    {/* Helmet brim */}
    <path d="M3 13C3 13 6 14 12 14C18 14 21 13 21 13" />
    {/* Ventilation slots */}
    <path d="M8 8.5C8 8.5 10 7 12 7C14 7 16 8.5 16 8.5" />
    {/* Chin strap */}
    <path d="M7 14C7 14 8 18 12 18C16 18 17 14 17 14" />
  </svg>
);

export default EquestrianHelmet;