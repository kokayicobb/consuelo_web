import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

const Footer = () => {
  const [isHidden, setIsHidden] = useState(false);
  
  useEffect(() => {
    // Check if the footer should be hidden based on the data attribute
    const checkVisibility = () => {
      const shouldHide = document.body.getAttribute("data-hide-footer") === "true";
      setIsHidden(shouldHide);
    };

    // Run once on initial load
    checkVisibility();

    // Set up an observer to monitor changes to the body's attributes
    const observer = new MutationObserver(checkVisibility);
    observer.observe(document.body, { attributes: true });

    // Clean up the observer when component unmounts
    return () => observer.disconnect();
  }, []);

  // Don't render the footer if it should be hidden
  if (isHidden) {
    return null;
  }
  return (
    <footer className="bg-transparent">
      <div className="mx-auto max-w-7xl px-8 py-20 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <img
                  src="/apple-touch-icon.png"
                  alt="Consuelo Logo"
                  className="h-12 w-auto text-muted-foreground [&>path]:fill-current cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
              <span className="text-2xl font-medium">consuelo</span>
            </div>
<p className="mt-5 max-w-xs text-xs text-muted-foreground">
  Consuelo, derived from the Spanish word for "consolation," 
  is an AI layer that turns your insights into actions.
</p>

<div className="my-4"></div> 
<p className="mb-10 text-xs text-muted-foreground sm:mb-0">
  © {new Date().getFullYear()} Consuelo AI.
</p>
</div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-2">
            <div>
              <p className="font-medium text-foreground">Follow Us</p>
              <nav className="mt-5 flex flex-col space-y-3 text-sm text-muted-foreground">
                <Link
                  className="flex items-center gap-1 transition-colors hover:text-accent"
                  href="https://www.linkedin.com/company/consuelo/"
                >
                  <span>LinkedIn</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  className="flex items-center gap-1 transition-colors hover:text-accent"
                  href="https://www.instagram.com/consuelohq?igsh=bG9ybmVrMGpxaW54&utm_source=qr"
                >
                  <span>Instagram</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  className="flex items-center gap-1 transition-colors hover:text-accent"
                  href=""
                >
                  <span>X (Twitter)</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </nav>
            </div>
            <div>
              <p className="font-medium text-foreground">Company</p>
              <nav className="mt-5 flex flex-col space-y-3 text-sm text-muted-foreground">
                <Link
                  className="transition-colors hover:text-accent"
                  href="/contact"
                >
                  Feedback
                </Link>
                <Link
                  className="transition-colors hover:text-accent"
                  href="/contact"
                >
                  Media Inquiries
                </Link>
                <Link
                  className="transition-colors hover:text-accent"
                  href="https://www.linkedin.com/in/kokayicobb"
                >
                  Careers
                </Link>
              </nav>
            </div>
            
            <div>
              <p className="font-medium text-foreground">Legal</p>
              <nav className="mt-5 flex flex-col space-y-3 text-sm text-muted-foreground">
                <Link
                  className="transition-colors hover:text-accent"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
                <Link
                  className="transition-colors hover:text-accent"
                  href="/terms"
                >
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <Separator className="my-10" />
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <p className="mb-5 text-xs text-muted-foreground sm:mb-0">
            
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-5 sm:mt-0">
            <p className="text-sm font-medium text-muted-foreground">
              Stay updated with our newsletter
            </p>
            <div className="flex h-10">
              <Input
                className="h-10 w-[220px] border-border/40 focus:border-accent/20"
                placeholder="Enter your email"
                type="email"
              />
              <Button
                type="submit"
                className="ml-3 h-10 bg-accent text-accent-foreground transition-colors hover:bg-accent/90"
              >
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