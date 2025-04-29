"use client";

import React, { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force light theme when this layout is used
  useEffect(() => {
    // Remove dark class if present
    document.documentElement.classList.remove('dark');
    // Add light class
    document.documentElement.classList.add('light');
  }, []);

  return (
    <div className="dashboard-layout bg-white text-gray-800">
      {/* This layout will override the parent layout for this route */}
      {/* Explicitly using light theme classes */}
      <main className="dashboard-content bg-white text-gray-800">{children}</main>
    </div>
  );
}