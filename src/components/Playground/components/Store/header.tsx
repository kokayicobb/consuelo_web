"use client";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes gradient-xy {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }

    .animate-gradient-xy {
      animation: gradient-xy 4s ease-in-out infinite;
      background-size: 200% 200%;
    }
  `;
  document.head.appendChild(style);

  return (
    <>
      <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/KaskLogo.png"
                  alt="Your Brand Logo"
                  width={120}
                  height={40}
                />
              </Link>
              <nav className="hidden md:ml-6 md:flex md:space-x-4">
                <Link
                  href="/about"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Products
                </Link>
                <Link
                  href="/about"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Categories
                </Link>
                <Link
                  href="/about"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Contact
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="hidden sm:block">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 sm:w-64"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <Button variant="primary" size="icon" className="relative ml-4">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-white">
                  3
                </span>
              </Button>
              <Button variant="primary" size="icon" className="ml-2 md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Virtual Fitting Room button outside header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative inline-block">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-400 rounded-lg blur-sm opacity-75 animate-gradient-xy"></div>
          <Link 
            href="/virtual-try-on" 
            className="relative flex items-center justify-center px-4 py-2 bg-white dark:bg-background rounded-lg leading-none text-foreground text-sm font-medium 
                      transition duration-200 hover:text-violet-500 dark:hover:text-violet-400 hover:shadow-xl hover:bg-white/90 dark:hover:bg-background/90
                      ring-1 ring-violet-200 dark:ring-violet-700">
            Virtual Fitting Room
          </Link>
        </div>
      </div>
    </>
  );
}