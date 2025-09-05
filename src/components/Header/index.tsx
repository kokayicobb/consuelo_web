"use client";
// src/components/Header/index.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Search } from "lucide-react";
import ThemeToggler from "./ThemeToggler";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  // Check if we're in a dashboard or app route
  const isAppRoute =
    pathname?.startsWith("/app") || pathname?.startsWith("/dashboard") || pathname?.startsWith("/sign-in");

  // All hooks must be called at the top level, before any conditional logic
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if header should be hidden
  const shouldHideHeader =
    typeof document !== "undefined" &&
    document.body.getAttribute("data-hide-header") === "true";

  // Check if sidebar should be hidden
  const shouldHideSidebar =
    typeof document !== "undefined" &&
    document.body.getAttribute("data-hide-sidebar") === "true";

  // If we're on an app route or header should be hidden, don't render anything
  if (isAppRoute || shouldHideHeader) {
    return null;
  }

  const navItems = [
    { name: "Employees", href: "/platform" },
    // { name: "Platform", href: "/platform" },
    { name: "Connections", href: "/integrations" },
    { name: "Pricing", href: "/pricing" },
    { name: "How It Works", href: "/platform" },
    { name: "SaleForce", href: "/integrations" },
    { name: "Hubspot", href: "/integrations" },
  ];

  return (
    <>
      {/* Top header bar - always fully transparent */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-transparent transition-all duration-300">
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
              <SheetContent side="right" className="w-[240px] p-0">
                <div className="flex h-full flex-col">
                  <div className="border-b p-4">
                    <Link href="/" className="flex items-center">
                      <span className="text-xl font-semibold">consuelo</span>
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
                      {/* Mobile auth buttons */}
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className="block w-full py-3 text-left text-sm transition-colors hover:text-primary">
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <button className="block w-full py-3 text-left text-sm transition-colors hover:text-primary">
                            Sign Up
                          </button>
                        </SignUpButton>
                      </SignedOut>
                      <SignedIn>
                        <Link
                          href="/app"
                          className="block py-3 text-sm transition-colors hover:text-primary"
                        >
                          Go to App
                        </Link>
                      </SignedIn>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 justify-start bg-white px-2 py-3 text-black mr-2"
                        >
                          <Search className="mr-2 h-4 w-4 opacity-70" />
                          <span>Search</span>
                        </Button>
                        <ThemeToggler />
                      </div>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right side items - only visible on desktop */}
          <div className="hidden items-center space-x-4 md:flex">
            <ThemeToggler />
            <Button variant="default">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="default">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="default">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link href="/app">
                <Button variant="default">
                  Go to App
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Left sidebar - visible on desktop unless hidden */}
      {!shouldHideSidebar && (
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
      )}

      {/* Main content container with padding for header and sidebar */}
      <div className={cn("pt-16", !shouldHideSidebar ? "md:pl-48" : "")}>
        {/* Your page content goes here */}
      </div>
    </>
  );
}