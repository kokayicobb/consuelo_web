'use client';

import Footer from "@/components/Footer/index";
import { Header } from "@/components/Header"
import ScrollToTop from "@/components/ScrollToTop";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import SimpleLoader from "@/app/loading";
import ToasterContext from "./api/contex/ToasetContex";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [headerVisible, setHeaderVisible] = useState<boolean>(false);
  const pathname = usePathname();
  
  // Check if we're in a dashboard or app route
  const isAppRoute = pathname?.startsWith('/app') || pathname?.startsWith('/dashboard');

  useEffect(() => {
    // Initialize the header visibility based on scroll position
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setHeaderVisible(scrollPosition > 0);
    };

    // Initial check for header visibility
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);
    
    const timer = setTimeout(() => setLoading(false), 1000);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return loading ? (
    <SimpleLoader />
  ) : (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        enableSystem={true}
        defaultTheme="light"
      >
        <ToasterContext />
        <div className={`header-wrapper ${headerVisible ? 'header-visible' : 'header-hidden'}`}>
          <Header />
        </div>
        <main className={!isAppRoute ? "md:pl-64" : ""}>{children}</main>
        <Footer />
        <ScrollToTop />
      </ThemeProvider>
    </SessionProvider>
  );
}