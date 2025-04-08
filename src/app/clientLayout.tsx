// app/ClientLayout.tsx
'use client';

import Footer from "@/components/Footer/index";
import { Header } from "@/components/Header"
import ScrollToTop from "@/components/ScrollToTop";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import SimpleLoader from "@/app/loading";
import ToasterContext from "./api/contex/ToasetContex";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return loading ? (
    <SimpleLoader />
  ) : (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        enableSystem={false}
        defaultTheme="light"
      >
        <ToasterContext />
        <Header />
        <main>{children}</main>
        <Footer />
        <ScrollToTop />
      </ThemeProvider>
    </SessionProvider>
  );
}