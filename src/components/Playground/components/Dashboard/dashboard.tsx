"use client";

import { useState } from "react";
import { Home, Shirt, User, Code, LogOut, Sparkles } from "lucide-react";
import Image from "next/image";

// Tab content components
import HomeContent from "./home-content";
import TryOnStudioContent from "./try-on-studio-content";
import ModelGenerationContent from "./model-generation-content";
import DeveloperAPIContent from "./developer-api-content";

type Tab = "home" | "try-on" | "model-generation" | "developer-api";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeContent />;
      case "try-on":
        return <TryOnStudioContent />;
      case "model-generation":
        return <ModelGenerationContent />;
      case "developer-api":
        return <DeveloperAPIContent />;
      default:
        return <HomeContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 flex-shrink-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
                alt="Consuelo Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-bold">Consuelo</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex w-full items-center rounded-lg px-4 py-2.5 text-sm ${
              activeTab === "home"
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Home className="mr-3 h-5 w-5" />
            Home
          </button>

          <button
            onClick={() => setActiveTab("try-on")}
            className={`flex w-full items-center rounded-lg px-4 py-2.5 text-sm ${
              activeTab === "try-on"
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Shirt className="mr-3 h-5 w-5" />
            Try-on Studio
          </button>

          <button
            onClick={() => setActiveTab("model-generation")}
            className={`flex w-full items-center rounded-lg px-4 py-2.5 text-sm ${
              activeTab === "model-generation"
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <User className="mr-3 h-5 w-5" />
            Model Generation
          </button>

          <button
            onClick={() => setActiveTab("developer-api")}
            className={`flex w-full items-center rounded-lg px-4 py-2.5 text-sm ${
              activeTab === "developer-api"
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Code className="mr-3 h-5 w-5" />
            Developer API
          </button>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
            <LogOut className="mr-3 h-5 w-5" />
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <div className="flex items-center">
            <h1 className="mr-4 text-xl font-bold">
              {activeTab === "home" && "Home"}
              {activeTab === "try-on" && "Try-on Studio"}
              {activeTab === "model-generation" && "Model Generation"}
              {activeTab === "developer-api" && "Developer API"}
            </h1>
            <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
              Free Plan
            </span>
            <button className="ml-4 flex items-center rounded-lg bg-yellow-400 px-4 py-1.5 text-sm text-black hover:bg-yellow-500">
              <Sparkles className="mr-2 h-4 w-4" />
              Subscribe to a Plan
            </button>
          </div>

          <div className="flex items-center">
            <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-300">
              <Image
                src="/placeholder.svg?height=36&width=36"
                alt="User profile"
                width={36}
                height={36}
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
