'use client';

import { ThemeProvider } from "next-themes";
import { Toaster } from '@/components/ui/sonner';
import ToasterContext from "../api/contex/ToasetContex";

export default function BlankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      enableSystem={true}
      defaultTheme="light"
    >
      <ToasterContext />
      <Toaster />
      <div className="min-h-screen">
        {children}
      </div>
    </ThemeProvider>
  );
}