"use client";

import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* This layout will override the parent layout for this route */}
      {/* You can customize this as needed */}
      <main className="dashboard-content">{children}</main>
    </div>
  );
}