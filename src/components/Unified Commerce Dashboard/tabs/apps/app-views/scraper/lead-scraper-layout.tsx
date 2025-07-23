// src/components/lead-scraper/LeadScraperLayout.tsx
"use client";

import { useState } from "react";
import LeadScraperDashboard from "./lead-scraper-dashboard";
import LeadScraperSidebar from "./lead-scraper-sidebar";


export default function LeadScraperLayout() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="relative h-screen w-full">
      {isFullscreen ? (
        <LeadScraperDashboard onClose={() => setIsFullscreen(false)} />
      ) : (
        <div className="flex h-full">
          {/* Other app content would go here */}
          <div className="flex-1 bg-gray-100">
            {/* Main app content */}
          </div>
          
          {/* Sidebar */}
          <div className="w-96 border-l bg-white shadow-lg">
            <LeadScraperSidebar 
              onToggleFullscreen={() => setIsFullscreen(true)}
              isFullscreen={isFullscreen}
            />
          </div>
        </div>
      )}
    </div>
  );
}