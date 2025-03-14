"use client";

import { useState } from "react";
import { Home, Shirt, User, Code, LogOut, Sparkles } from "lucide-react";
import Image from "next/image";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"; // Adjust the import path as needed

// Tab content components
import HomeContent from "./home-content";
import TryOnStudioContent from "./try-on-studio-content";
import ModelGenerationContent from "./model-generation-content";
import DeveloperAPIContent from "./developer-api-content";

type Tab = "try-on" | "home" | "model-generation" | "developer-api";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("try-on");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "try-on":
        return <TryOnStudioContent />;
      case "home":
        return <HomeContent />;
      case "model-generation":
        return <ModelGenerationContent />;
      case "developer-api":
        return <DeveloperAPIContent />;
      default:
        return <TryOnStudioContent />;
    }
  };

  const links = [
    {
      label: "Try-on Studio",
      href: "#try-on",
      icon: <Shirt className="h-5 w-5 text-neutral-200" />,
      onClick: () => setActiveTab("try-on"),
    },
    {
      label: "Model Generation",
      href: "#model-generation",
      icon: <User className="h-5 w-5 text-neutral-200" />,
      onClick: () => setActiveTab("model-generation"),
    },
    {
      label: "Home",
      href: "#home",
      icon: <Home className="h-5 w-5 text-neutral-200" />,
      onClick: () => setActiveTab("home"),
    },
    {
      label: "Developer API",
      href: "#developer-api",
      icon: <Code className="h-5 w-5 text-neutral-200" />,
      onClick: () => setActiveTab("developer-api"),
    },
    {
      label: "Log Out",
      href: "#logout",
      icon: <LogOut className="h-5 w-5 text-neutral-200" />,
    },
  ];

  return (
    <div className="dark flex h-screen bg-background">
      {/* Sidebar with the new component */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="mb-6 flex items-center gap-2 px-2">
              <div className="h-8 w-8 flex-shrink-0">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
                  alt="Consuelo Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">Consuelo</span>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <SidebarLink
                link={links[0]}
                className={
                  activeTab === "try-on"
                    ? "rounded-lg bg-secondary font-medium text-accent"
                    : "text-white hover:bg-muted/30 hover:text-accent"
                }
              />
              <SidebarLink
                link={links[1]}
                className={
                  activeTab === "model-generation"
                    ? "rounded-lg bg-secondary font-medium text-accent"
                    : "text-white hover:bg-muted/30 hover:text-accent"
                }
              />
              <SidebarLink
                link={links[2]}
                className={
                  activeTab === "home"
                    ? "rounded-lg bg-secondary font-medium text-accent"
                    : "text-white hover:bg-muted/30 hover:text-accent"
                }
              />
              <SidebarLink
                link={links[3]}
                className={
                  activeTab === "developer-api"
                    ? "rounded-lg bg-secondary font-medium text-accent"
                    : "text-white hover:bg-muted/30 hover:text-accent"
                }
              />
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-auto pt-4">
            <SidebarLink
              link={links[4]}
              className="text-white hover:bg-destructive/20 hover:text-destructive"
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-card p-4">
          <div className="flex items-center">
            <h1 className="mr-4 text-xl font-bold text-white">
              {activeTab === "try-on" && "Try-on Studio"}
              {activeTab === "home" && "Home"}
              {activeTab === "model-generation" && "Model Generation"}
              {activeTab === "developer-api" && "Developer API"}
            </h1>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-white">
              Free Plan
            </span>
            <button className="ml-4 flex items-center rounded-lg bg-accent px-4 py-1.5 text-sm text-white transition-colors hover:bg-accent/80">
              <Sparkles className="mr-2 h-4 w-4" />
              Subscribe to a Plan
            </button>
          </div>

          <div className="flex items-center">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted">
              <Image
                src="/Shopify logo.png"
                alt="User profile"
                width={28} // Reduce size to zoom out
                height={28} // Reduce size to zoom out
                className="object-cover" // This ensures the image covers the area nicely
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}