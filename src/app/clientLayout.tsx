"use client";

import Footer from "@/components/Footer/index";
import { Header } from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import ShimmerLoader from "@/app/loading";
import ToasterContext from "./api/contex/ToasetContex";
import { AuthProvider } from "@/contexts/AuthContext"; // Add this import

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
    <ShimmerLoader />
  ) : (
    <SessionProvider>
      <AuthProvider>
        {" "}
        {/* Add this wrapper */}
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
      </AuthProvider>{" "}
      {/* Close the wrapper */}
    </SessionProvider>
  );
}
