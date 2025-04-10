"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if header should be hidden
  const shouldHide =
    typeof document !== "undefined" &&
    document.body.getAttribute("data-hide-header") === "true";

  // Return null if the header should be hidden
  if (shouldHide) {
    return null;
  }

  const navItems = [
    { name: "Agents", href: "/app" },
    { name: "Platform", href: "/app" },
    { name: "Integrations", href: "/safety" },
    { name: "Pricing", href: "/stories" },
    { name: "How It Works", href: "/company" },
    { name: "Shopify", href: "/api" },
    { name: "Klayvio", href: "/company" },
  ];

  return (
    <>
      {/* Top header bar - always fully transparent */}
      <header
        className="fixed left-0 right-0 top-0 z-50 transition-all duration-300 bg-transparent"
      >
        <div className="flex h-16 items-center justify-between px-8">
          {/* Animated Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-8 w-[100px]">
              <span
                className={cn(
                  "absolute inset-0 flex items-center text-2xl font-semibold transition-all duration-500 ease-in-out",
                  isScrolled
                    ? "translate-y-2 opacity-0"
                    : "translate-y-0 opacity-100",
                )}
              >
                consuelo
              </span>
              <img
                src="/apple-touch-icon.png"
                alt="Consuelo Logo"
                className={cn(
                  "absolute inset-0 h-10 w-10 transition-all duration-500 ease-in-out",
                  isScrolled
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0",
                )}
              />
            </div>
          </Link>

          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-0">
                <div className="flex h-full flex-col">
                  <div className="border-b p-4">
                    <Link href="/" className="flex items-center">
                      <span className="text-xl font-semibold">OpenAI</span>
                    </Link>
                  </div>
                  <nav className="flex-1 overflow-auto p-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block py-3 text-sm transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    ))}
                    <div className="mt-6 border-t pt-6">
                      <Link
                        href="/login"
                        className="block py-3 text-sm transition-colors hover:text-primary"
                      >
                        Log in
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-0 py-3"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        <span>Search</span>
                      </Button>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right side items - only visible on desktop */}
          <div className="hidden items-center space-x-4 md:flex">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-transparent text-foreground hover:bg-secondary/50"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Link href="/login">
              <Button
                variant="ghost"
                className="rounded-full bg-secondary/50 px-4 py-2 text-foreground hover:bg-secondary/80"
              >
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Left sidebar - visible on desktop */}
      <div className="fixed bottom-0 left-0 top-0 hidden w-48 pl-8 pt-16 md:flex">
        <nav className="mt-20 flex flex-col">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="py-3 text-sm transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content container with padding for header and sidebar */}
      <div className="pt-16 md:pl-48">{/* Your page content goes here */}</div>
    </>
  );
}