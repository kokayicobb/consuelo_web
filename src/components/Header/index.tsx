"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import {
  IconShirt,
  IconRuler,
  IconCube,
  IconChartBar,
  IconMail,
  IconLock,
  IconPolygon,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext"; // Import the useAuth hook

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Laptop,
  Users,
  Zap,
  BarChart,
  BookOpen,
  Phone,
  PenTool,
  Shirt,
  Ruler,
  Sparkles,
  Menu,
  LogOut,
  User,
} from "lucide-react";

const solutions: {
  title: string;
  href: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "Virtual Try-On",
    href: "/virtual-try-on",
    description:
      "Experience clothes virtually with our advanced 3D modeling technology.",
    icon: <Shirt className="h-6 w-6" />,
  },
  {
    title: "Fit Calculator",
    href: "/playground",
    description:
      "Get personalized size recommendations based on your body measurements.",
    icon: <Ruler className="h-6 w-6" />,
  },
  {
    title: "Competition Dashboard",
    href: "/solutions/fit-analysis",
    description:
      "Analyze your performance against competitors with our comprehensive dashboard.",
    icon: <IconChartBar className="h-6 w-6" />,
  },
  {
    title: "3D Product Viewer",
    href: "/playground",
    description:
      "Give customers a 360-degree view of products, enhancing their online shopping experience.",
    icon: <IconCube className="h-6 w-6" />,
  },
];

const resources: {
  title: string;
  href: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "Blog",
    href: "/blogs",
    description:
      "Read the latest news and insights about AI in fashion and e-commerce.",
    icon: <BookOpen className="h-6 w-6" />,
  },
  {
    title: "Case Studies",
    href: "/about",
    description:
      "Explore how leading brands are using Consuelo to revolutionize online shopping.",
    icon: <BarChart className="h-6 w-6" />,
  },
  {
    title: "Documentation",
    href: "/about",
    description:
      "Access detailed guides and API references for integrating Consuelo.",
    icon: <Laptop className="h-6 w-6" />,
  },
  {
    title: "Webinars",
    href: "/about",
    description:
      "Watch on-demand webinars about the future of AI in fashion retail.",
    icon: <Users className="h-6 w-6" />,
  },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { user, signOut } = useAuth(); // Get user and signOut function from auth context

  // And update the scroll detection:
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Increased threshold
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle logout
  const handleSignOut = async () => {
    try {
      await signOut();
      // No need to redirect, the signOut function should handle that
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isDarkMode = theme === "dark";
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/images/logo/logo.svg"
              alt="Consuelo Logo"
              className="h-10 w-auto dark:invert"
            />
          </Link>
        </div>
        <div className="flex-1" />
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-accent/10">
                Solutions
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-4">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/about"
                      >
                        <img
                          src="/apple-touch-icon.png"
                          alt="Consuelo Logo"
                          className="h-9 w-9 text-muted-foreground [&>path]:fill-current"
                        />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Consuelo
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Revolutionizing e-commerce with AI-powered fitting
                          solutions for a perfect shopping experience.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  {solutions.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                      icon={item.icon}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-accent/10">
                Resources
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {resources.map((item) => (
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                      icon={item.icon}
                    >
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent hover:bg-accent/10",
                  )}
                >
                  Pricing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent hover:bg-accent/10",
                  )}
                >
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/contact" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent hover:bg-accent/10",
                  )}
                >
                  Contact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="ml-4 hidden items-center space-x-4 md:flex">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="rounded-full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Icons.sun className="h-5 w-5 scale-100  dark:scale-0" />
            <Icons.moon className="absolute h-5 w-5 scale-0  dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Conditional rendering based on authentication state */}
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="rounded-full">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-full"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" className="rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <div className="flex flex-col space-y-4 py-4">
                <Link href="/" className="flex items-center space-x-2 px-4">
                  <img
                    src="/images/logo/logo.svg"
                    alt="Consuelo Logo"
                    className="h-8 w-auto dark:invert"
                  />
                </Link>
                <div className="space-y-1 px-4">
                  <h4 className="font-medium">Solutions</h4>
                  {solutions.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="flex items-center space-x-2 py-1 text-sm"
                    >
                      <span>{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
                <div className="space-y-1 px-4">
                  <h4 className="font-medium">Resources</h4>
                  {resources.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="flex items-center space-x-2 py-1 text-sm"
                    >
                      <span>{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
                <div className="space-y-1 px-4">
                  <Link href="/pricing" className="block py-1 text-sm">
                    Pricing
                  </Link>
                  <Link href="/about" className="block py-1 text-sm">
                    About
                  </Link>
                  <Link href="/contact" className="block py-1 text-sm">
                    Contact
                  </Link>
                </div>

                {/* Conditional rendering for mobile auth */}
                {user ? (
                  <>
                    <div className="px-4 pt-4">
                      <p className="text-sm font-medium">Logged in as:</p>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <div className="px-4 pt-2">
                      <Link href="/dashboard" className="block w-full">
                        <Button className="w-full" variant="outline">
                          Dashboard
                        </Button>
                      </Link>
                    </div>
                    <div className="px-4 pt-2">
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 pt-4">
                      <Link href="/signin" className="block w-full">
                        <Button className="w-full" variant="outline">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                    <div className="px-4">
                      <Link href="/signup" className="block w-full">
                        <Button className="w-full" variant="outline">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                variant="outline"
                size="icon"
                aria-label="Toggle theme"
                className="w-full"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <span>Toggle theme</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10 focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
