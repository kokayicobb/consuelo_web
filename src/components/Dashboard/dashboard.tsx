"use client";

import { useState } from "react";
import { History, Shirt, User, Code, LogOut, Sparkles } from "lucide-react";
import Image from "next/image";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"; // Adjust the import path as needed

// Tab content components
import HomeContent from "./home-content";
import TryOnStudioContent from "./try-on-studio-content";
import ModelGenerationContent from "./model-generation-content";
import DeveloperAPIContent from "./developer-api-content";

// Import or create new content components for bottom links
import ProContent from "./bottom-links/pro-content";
import EnterpriseContent from "./bottom-links/enterprise-content";
import ApiContent from "./bottom-links/api-content";
import BlogContent from "./bottom-links/blog-content";
import CareersContent from "./bottom-links/careers-content";
import StoreContent from "./bottom-links/store-content";
import FinanceContent from "./bottom-links/finance-content";

type Tab = "try-on" | "history" | "model-generation" | "developer-api";
type BottomLink = "pro" | "enterprise" | "api" | "blog" | "careers" | "store" | "investors" | null;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("try-on");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeBottomLink, setActiveBottomLink] = useState<BottomLink>(null);

  const renderContent = () => {
    // First check if a bottom link is active
    if (activeBottomLink) {
      switch (activeBottomLink) {
        case "pro":
          return <ProContent onBack={() => setActiveBottomLink(null)} />;
        case "enterprise":
          return <EnterpriseContent onBack={() => setActiveBottomLink(null)} />;
        case "api":
          return <ApiContent onBack={() => setActiveBottomLink(null)} />;
        case "blog":
          return <BlogContent onBack={() => setActiveBottomLink(null)} />;
        case "careers":
          return <CareersContent onBack={() => setActiveBottomLink(null)} />;
        case "store":
          return <StoreContent onBack={() => setActiveBottomLink(null)} />;
        case "investors":
          return <FinanceContent onBack={() => setActiveBottomLink(null)} />;
      }
    }

    // If no bottom link is active, show the main tab content
    switch (activeTab) {
      case "try-on":
        return <TryOnStudioContent />;
      case "history":
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
      onClick: () => {
        setActiveTab("try-on");
        setActiveBottomLink(null);
      },
    },
    {
      label: "Model Generation",
      href: "#model-generation",
      icon: <User className="h-5 w-5 text-neutral-200" />,
      onClick: () => {
        setActiveTab("model-generation");
        setActiveBottomLink(null);
      },
    },
    {
      label: "History",
      href: "#history",
      icon: <History className="h-5 w-5 text-neutral-200" />,
      onClick: () => {
        setActiveTab("history");
        setActiveBottomLink(null);
      },
    },
    {
      label: "Developer API",
      href: "#developer-api",
      icon: <Code className="h-5 w-5 text-neutral-200" />,
      onClick: () => {
        setActiveTab("developer-api");
        setActiveBottomLink(null);
      },
    },
    {
      label: "Log Out",
      href: "#logout",
      icon: <LogOut className="h-5 w-5 text-neutral-200" />,
    },
  ];

  // Define bottom links with their click handlers
  const bottomLinks = [
    { text: "Pro", onClick: () => setActiveBottomLink("pro") },
    { text: "Enterprise", onClick: () => setActiveBottomLink("enterprise") },
    { text: "API", onClick: () => setActiveBottomLink("api") },
    { text: "Blog", onClick: () => setActiveBottomLink("blog") },
    { text: "Careers", onClick: () => setActiveBottomLink("careers") },
    { text: "Store", onClick: () => setActiveBottomLink("store") },
    { text: "Investors", onClick: () => setActiveBottomLink("investors") }
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
                  activeTab === "try-on" && !activeBottomLink
                    ? "rounded-lg bg-secondary font-medium text-accent"
                    : "text-white hover:bg-muted/30 hover:text-accent"
                }
              />
              <SidebarLink
                link={links[1]}
                className={
                  activeTab === "model-generation" && !activeBottomLink
                    ? "rounded-lg bg-secondary font-medium text-accent"
                    : "text-white hover:bg-muted/30 hover:text-accent"
                }
              />
              <SidebarLink
                link={links[2]}
                className={
                  activeTab === "history" && !activeBottomLink
                    ? "rounded-lg bg-secondary font-medium text-accent"
                    : "text-white hover:bg-muted/30 hover:text-accent"
                }
              />
              <SidebarLink
                link={links[3]}
                className={
                  activeTab === "developer-api" && !activeBottomLink
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
              {activeBottomLink 
                ? bottomLinks.find(link => link.text.toLowerCase() === activeBottomLink)?.text 
                : activeTab === "try-on" && "Try-on Studio" ||
                  activeTab === "history" && "History" ||
                  activeTab === "model-generation" && "Model Generation" ||
                  activeTab === "developer-api" && "Developer API"}
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
                width={28}
                height={28}
                className="object-cover"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background p-6">
          {renderContent()}
        </main>

        {/* Bottom Links */}
        <div className="mt-auto px-4 py-2 border-t border-border bg-card">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs">
            {bottomLinks.map((item, index) => (
              <div 
                key={item.text} 
                className="transition-opacity duration-300"
              >
                <button
                  onClick={item.onClick}
                  className={`text-muted-foreground transition-colors hover:text-accent ${
                    activeBottomLink === item.text.toLowerCase() ? "text-accent font-medium" : ""
                  }`}
                >
                  {item.text}
                </button>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <button
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                English
              </button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}