"use client";
// src/components/Header/index.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Search, PanelRight } from "lucide-react";
import ThemeToggler from "./ThemeToggler";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
import { themeConfig } from "@/lib/theme";

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
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

  const navItems = themeConfig.navigation.items;

  return (
    <>
      {/* Top header bar - uses theme background */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-background transition-all duration-300">
        <div className="flex h-16 items-center justify-between px-8">
          {/* Animated Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-8 w-[100px]">
              <span
                className={cn(
                  "absolute inset-0 flex items-center text-2xl font-semibold transition-all duration-500 ease-in-out text-primary",
                  isScrolled
                    ? "translate-y-2 opacity-0"
                    : "translate-y-0 opacity-100",
                )}
              >
{themeConfig.branding.logo.text}
              </span>
              <img
                src={themeConfig.branding.logo.image.src}
                alt={themeConfig.branding.logo.image.alt}
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
          <div className="md:hidden -mr-2">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="!h-8 !w-8 !p-4">
                  <PanelRight className="!h-5 !w-5 text-primary" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] p-0 bg-transparent backdrop-blur-md border-l border-border/20 [&_button]:!text-white [&_button_svg]:!text-white [&_button]:!opacity-100 [&_button_svg]:!opacity-100 [&_*]:!outline-none [&_*]:!ring-0 [&_*]:!border-transparent [&_*]:focus:!outline-none [&_*]:focus:!ring-0 [&_*]:focus:!border-transparent [&_*]:focus-visible:!outline-none [&_*]:focus-visible:!ring-0 [&_*]:focus-visible:!ring-offset-0" style={{"--tw-ring-shadow": "none", "--tw-ring-offset-shadow": "none", "--tw-ring-offset-width": "0px"} as React.CSSProperties}>
                <div className="flex h-full flex-col">
                  <div className="border-b border-white/20 p-4">
                    <Link href="/" className="flex items-center">
                      <span className="text-xl font-semibold text-white">{themeConfig.branding.name}</span>
                    </Link>
                  </div>
                  <div className="p-4 border-b border-white/20">
                    {/* Mobile auth buttons and theme toggler */}
                    <div className="flex items-center justify-between">
                      <div>
                        <SignedOut>
                          <SignUpButton mode="modal">
                            <button className="py-2 text-sm transition-colors hover:text-white/80 text-white">
                              {themeConfig.buttons.auth.signUp}
                            </button>
                          </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                          <Link
                            href="/roleplay"
                            className="block py-2 text-sm transition-colors hover:text-white/80 text-white"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            {themeConfig.buttons.auth.goToApp}
                          </Link>
                        </SignedIn>
                      </div>
                      <div className="[&_button]:text-white [&_svg]:text-white">
                        <ThemeToggler />
                      </div>
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="mx-4 my-3 h-0.5 bg-white/60"></div>
                  <nav className="flex-1 overflow-auto p-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block py-3 text-sm transition-colors hover:text-white/80 text-white"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right side items - only visible on desktop */}
          <div className="hidden items-center space-x-4 md:flex">
            <ThemeToggler />
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-primary duration-300"
            >
              <Search className="h-[22px] w-[22px]" />
              <span className="sr-only">{themeConfig.buttons.search.ariaLabel}</span>
            </Button>
            
            <SignedOut>
              <SignUpButton mode="modal">
                <Button variant="default">
                  {themeConfig.buttons.auth.signUp}
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <Link href="/roleplay">
                <Button variant="default">
                  {themeConfig.buttons.auth.goToApp}
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
                className="py-3 text-sm transition-colors hover:text-accent text-primary"
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