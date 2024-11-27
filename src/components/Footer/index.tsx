import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-4">
              <img
                src="/apple-touch-icon.png"
                alt="Consuelo Logo"
                className="h-12 w-auto text-muted-foreground [&>path]:fill-current"
              />
              <img
                src="/images/logo/logo.svg"
                alt="Consuelo Logo"
                className="h-16 w-auto dark:invert"
              />
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Smart technology for perfect customer fit. Transforming how you
              serve
            </p>
            <div className="mt-8 flex space-x-6 text-muted-foreground">
              <Facebook className="h-6 w-6 cursor-pointer hover:text-primary" />
              <Twitter className="h-6 w-6 cursor-pointer hover:text-primary" />
              <Instagram className="h-6 w-6 cursor-pointer hover:text-primary" />
              <Linkedin className="h-6 w-6 cursor-pointer hover:text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-2">
            <div>
              <p className="font-medium">Company</p>
              <nav className="mt-4 flex flex-col space-y-2 text-sm text-muted-foreground">
                <Link className="hover:text-primary" href="/about">
                  About
                </Link>
                <Link className="hover:text-primary" href="/team">
                  Team
                </Link>
                <Link className="hover:text-primary" href="/careers">
                  Careers
                </Link>
                <Link className="hover:text-primary" href="/press">
                  Press
                </Link>
              </nav>
            </div>
            <div>
              <p className="font-medium">Solutions</p>
              <nav className="mt-4 flex flex-col space-y-2 text-sm text-muted-foreground">
                <Link className="hover:text-primary" href="/ai-consulting">
                  Virtual Try-On
                </Link>
                <Link className="hover:text-primary" href="/machine-learning">
                  Fit Calculator
                </Link>
                <Link className="hover:text-primary" href="/data-analytics">
                  3D Product Viewer
                </Link>
                <div className="relative">
                  <span className="absolute -top-1 right-0 animate-pulse text-[12px] font-medium text-accent">
                    FREE
                  </span>
                  <Link className="hover:text-primary" href="/nlp">
                    Competition Dashboard
                  </Link>
                </div>
              </nav>
            </div>
            <div>
              <p className="font-medium">Legal</p>
              <nav className="mt-4 flex flex-col space-y-2 text-sm text-muted-foreground">
                <Link className="hover:text-primary" href="/privacy">
                  Privacy Policy
                </Link>
                <Link className="hover:text-primary" href="/terms">
                  Terms of Service
                </Link>
                <Link className="hover:text-primary" href="/cookies">
                  Cookie Policy
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Consuelo. All rights reserved.
          </p>
          <div className="mt-4 flex items-center space-x-4 sm:mt-0">
            <p className="text-sm font-medium text-muted-foreground">
              Stay updated with our newsletter
            </p>
            <div className="flex">
              <Input
                className="max-w-[200px]"
                placeholder="Enter your email"
                type="email"
              />
              <Button type="submit" className="ml-2">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
