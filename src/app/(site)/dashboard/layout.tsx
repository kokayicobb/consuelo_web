// src/app/(site)/dashboard/layout.tsx
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* No navigation menu here */}
      {children}
    </div>
  );
}