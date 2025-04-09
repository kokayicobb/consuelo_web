// components/PageLayout.tsx
import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-40 bg-background">
      {children}
    </div>
  );
}