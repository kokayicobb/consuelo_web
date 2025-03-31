"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Users,
  PieChart,
  Lightbulb,
  Settings,
  Globe,
  MessageCircle,
  Send,
} from "lucide-react";
import Header from "./header";
import ChannelsContent from "../home/channels-content";
import HomeContent from "../home/home-content";
import InventoryContent from "../home/inventory-content";
import CustomersContent from "../home/customer-content";
import MarketingContent from "../home/marketing-content";
import AIInsightsContent from "../home/ai-insights";
import IntegrationsContent from "../home/integration-content";
import SettingsContent from "../home/settings-content";
import ChatContent from "../home/chat-content";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Chat Interface Component for use with ExpandableChat
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { text: "Hi there! How can I help you today?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim() === "") return;
    
    // Add user message
    setMessages([...messages, { text: inputValue, sender: "user" }]);
    setInputValue("");
    
    // Simulate bot response (would be replaced with actual API call)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Thanks for your message! I'll help you with that.", 
        sender: "bot" 
      }]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
     <ExpandableChatHeader className="bg-black text-white">
  <div className="flex items-center">
    <div className="mr-2 h-8 w-8 rounded-full bg-white flex items-center justify-center">
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
        alt="Consuelo Logo"
        className="h-6 w-6"
      />
    </div>
    <span className="font-medium">Consuelo </span>
  </div>
</ExpandableChatHeader>

<ExpandableChatBody className="bg-gray-50 p-4 space-y-4 w-full">
  {messages.map((message, index) => (
    <div
      key={index}
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          message.sender === "user"
            ? "bg-black text-white"
            : "bg-white text-gray-800 border border-gray-200"
        }`}
      >
        {message.text}
      </div>
    </div>
  ))}
</ExpandableChatBody>

<ExpandableChatFooter className="bg-white border-t border-gray-200">
  <div className="flex items-center gap-2 w-full">
    <Input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Type your message..."
      className="flex-1"
    />
    <Button onClick={handleSend} size="icon" className="bg-black hover:bg-gray-800">
      <Send size={16} />
    </Button>
  </div>
</ExpandableChatFooter>
    </>
  );
};

const MainLayout = () => {
  // Create a state to track the active tab
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Effect to sync URL hash with state
  useEffect(() => {
    // Function to handle hash change
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "home";
      setActiveTab(hash);
    };

    // Set initial state based on current hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Clean up event listener
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Function to render the correct content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <ChatContent />;
      case "dashboard":
        return <HomeContent />;
      case "channels":
        return <ChannelsContent />;
      case "inventory":
        return <InventoryContent />;
      case "customers":
        return <CustomersContent />;
      case "marketing":
        return <MarketingContent />;
      case "ai-insights":
        return <AIInsightsContent />;
      case "integrations":
        return <IntegrationsContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return <HomeContent />;
    }
  };

  // Define the navigation items
  const navItems = [
    {
      label: "Home",
      href: "#home",
      icon: <MessageCircle size={20} className="text-gray-200" />,
      onClick: () => setActiveTab("home"),
    },
    {
      label: "Dashboard",
      href: "#dashboard",
      icon: <LayoutDashboard size={20} className="text-gray-200" />,
      onClick: () => setActiveTab("dashboard"),
    },
    {
      label: "Channel Performance",
      href: "#channels",
      icon: <BarChart3 size={20} className="text-gray-200" />,
      onClick: () => setActiveTab("channels"),
    },
    {
      label: "Inventory Intelligence",
      href: "#inventory",
      icon: <Package size={20} className="text-gray-200" />,
      onClick: () => setActiveTab("inventory"),
    },
    {
      label: "Customer Insights",
      href: "#customers",
      icon: <Users size={20} className="text-gray-200" />,
      onClick: () => setActiveTab("customers"),
    },
    {
      label: "Marketing Analytics",
      href: "#marketing",
      icon: <PieChart size={20} className="text-gray-200" />,
      onClick: () => setActiveTab("marketing"),
    },
    {
      label: "AI Recommendations",
      href: "#ai-insights",
      icon: <Lightbulb size={20} className="text-gray-200" />,
      onClick: () => setActiveTab("ai-insights"),
    },
    {
      label: "Connected Platforms",
      href: "#integrations",
      icon: <Globe size={20} className="text-gray-200" />,
      onClick: () => setActiveTab("integrations"),
    },
    {
      label: "Settings",
      href: "#settings",
      icon: <Settings size={20} className="text-gray-200" />,
      onClick: () => setActiveTab("settings"),
    },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100 md:flex-row">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody>
          <div className="mb-6 flex items-center justify-center gap-2 px-2">
            <div className="h-8 w-8 flex-shrink-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
                alt="Consuelo Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className={`text-xl font-bold text-white ${!sidebarOpen && 'hidden'}`}>
              Consuelo
            </span>
          </div>
    
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <SidebarLink
              key={item.href}
              link={item}
              className={`${
                activeTab === item.href.replace("#", "")
                  ? "bg-gray-700/40 font-medium"
                  : ""
              } text-white hover:bg-gray-700/40 hover:text-white`}
            />
            ))}
          </nav>
    
          <div className="mt-auto border-t border-gray-800 pt-4">
            <div className="flex items-center justify-center px-4 py-2">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src="/placeholder-avatar.png"
                  alt="User avatar"
                />
              </div>
              <div className={`ml-3 ${!sidebarOpen && 'hidden'}`}>
                <p className="text-sm font-medium text-white">Sarah Johnson</p>
                <p className="text-xs text-gray-400">FashionCo Admin</p>
              </div>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
   
      <div className="flex flex-1 flex-col overflow-y-auto">
        {activeTab !== "home" && (
          <Header
            title={
              activeTab.charAt(0).toUpperCase() +
              activeTab.slice(1).replace("-", " ")
            }
          />
        )}
        <main
          className={`flex-1 ${activeTab === "home" ? "p-0" : "p-4 md:p-6"}`}
        >
          {renderContent()}
        </main>
        
        {/* Expandable Chat - Only show when not on home or settings page */}
        {activeTab !== "home" && activeTab !== "settings" && (
          <ExpandableChat position="bottom-right" size="md">
            <ChatInterface />
          </ExpandableChat>
        )}
      </div>
    </div>
  );
};

export default MainLayout;