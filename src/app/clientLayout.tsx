'use client';

import Footer from "@/components/Footer/index";
import { Header } from "@/components/Header"
import ScrollToTop from "@/components/ScrollToTop";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, Suspense } from "react";
import ShimmerLoader from "@/app/loading";
import ToasterContext from "./api/contex/ToasetContex";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return loading ? (
    <ShimmerLoader />
  ) : (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        enableSystem={false}
        defaultTheme="light"
      >
        <ToasterContext />
        <Header />
        <Suspense fallback={<ShimmerLoader />}>
          <main>{children}</main>
        </Suspense>
        <Footer />
        <ScrollToTop />
      </ThemeProvider>
    </SessionProvider>
  );
}