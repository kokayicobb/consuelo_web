"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useState, useEffect, useRef } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarCollapseButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Search,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Plus,
  LogOut,
  Monitor,
  Check,
  Workflow,
  Route
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"



import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"

import AIInsightsContent from "../tabs/ai-insights"
import ChannelsContent from "../tabs/channels-content"
import ChatContent from "../tabs/chat"
import CustomersContent from "../tabs/customer-content"
import IntegrationsContent from "../tabs/integration-content"
import InventoryContent from "../tabs/inventory-content"
import MarketingContent from "../tabs/marketing-content"
import SettingsContent from "../tabs/settings-content"
import HomeContent from "../tabs/dashboard"
import ActionSearchBar from "@/components/ui/action-search-bar";
import AutomationBuilder from "../tabs/automations";
import ChatBot from "../components/chatbot";


// Chat Interface Component for use with ExpandableChat
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { text: "Hi there! How can I help you today?", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim() === "") return;

    // Add user message
    setMessages([...messages, { text: inputValue, sender: "user" }]);
    setInputValue("");

    // Simulate bot response (would be replaced with actual API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "Thanks for your message! I'll help you with that.",
          sender: "bot",
        },
      ]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend()
    }
  }

  return (
    <>
      <ExpandableChatHeader className="border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
              alt="Consuelo Logo"
              className="h-6 w-6"
            />
          </div>
          <span className="font-medium text-gray-900">Consuelo</span>
          <span className="font-medium text-gray-900">Consuelo</span>
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody className="w-full space-y-4 bg-white p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "border border-gray-200 bg-gray-100 text-gray-800"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </ExpandableChatBody>

      <ExpandableChatFooter className="border-t border-gray-200 bg-white">
        <div className="flex w-full items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border-gray-200 "
          
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send size={16} />
          </Button>
        </div>
      </ExpandableChatFooter>
    </>
  )
}

const MainLayout = ({ children, title, hideSidebar = false }) => {
  // Create a state to track the active tab
  const [activeTab, setActiveTab] = useState("home")
  const [sidebarOpen, setSidebarOpen] = useState(!hideSidebar)

  // Effect to sync URL hash with state
  useEffect(() => {
    // Function to handle hash change
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "home"
      setActiveTab(hash)
    }

    // Set initial state based on current hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange)

    // Clean up event listener
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  // Function to render the correct content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <ChatContent />
      case "dashboard":
        return <HomeContent />
      case "channels":
        return <ChannelsContent />
      case "inventory":
        return <InventoryContent />
      case "accounts":
        return <CustomersContent />
      case "marketing":
        return <MarketingContent />
      case "ai-insights":
        return <AIInsightsContent />
      case "integrations":
        return <IntegrationsContent />
      case "settings":
        return <SettingsContent />
        case "automations":
        return <AutomationBuilder />
      default:
        return <HomeContent />
    }
    
  }
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef(null);
  // ADD THIS ENTIRE useEffect BLOCK:
  useEffect(() => {
    // Function to handle clicks outside the chat
    const handleClickOutside = (event) => {
      // If the ref is attached and the click is outside the ref's element
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsChatOpen(false); // Close the chat
      }
    };

    // Add the event listener only if the chat is open
    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove the listener when the component unmounts
    // or when the chat is closed.
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  // Define the main navigation items (Home and Dashboard)
  const mainNavItems = [
 
    {
      label: "Home",
      href: "#home",
      icon: <MessageCircle size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("home"),
    },
    {
      label: "Dashboard",
      href: "#dashboard",
      icon: <LayoutDashboard size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("dashboard"),
    },
    {
      label: "Automations",
      href: "#automations",
      icon: <Workflow size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("automations"),
    },
  ];

  // Define the retention section items
  const retentionItems = [
    {
      label: "Accounts",
      href: "#accounts",
      icon: <Users size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("accounts"),
    },
    {
      label: "Cohorts",
      href: "#channels",
      icon: <BarChart3 size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("channels"),
    },
    {
      label: "Product Insights",
     
      href: "#inventory",
      icon: <Package size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("inventory"),
    },
  ];

  // Define the prospecting section items
  const prospectingItems = [
    {
      label: "Pipeline Builder",
      href: "#pipeline-builder",
      icon: <BarChart3 size={20} className="text-gray-600" />,
      onClick: () => {}, // No functionality for now
    },
   
    {
      label: "Lead Cohorts",
      href: "#leads",
      icon: <Users size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("ai-insights"), // No functionality for now
    
    },
    {
      label: "Channel Insights",
     
      href: "#marketing",
      icon: <PieChart size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("marketing"),
    },
  ];
  const dialerItems = [
    {
      label: "Create Scripts",
      href: "#pipeline-builder",
      icon: <Plus size={20} className="text-gray-600" />,
      onClick: () => {}, // No functionality for now
    },
  ];

  // Define the standalone items (AI Recommendations only now)
  const standaloneItems = [
    // {
    //   label: "AI Recommendations",
    //   href: "#ai-insights",
    //   icon: <Lightbulb size={20} className="text-gray-600" />,
    //   onClick: () => setActiveTab("ai-insights"),
    // },
  ];
   const unitedCapitalSourceConfig = {
        name: "United Capital Source",
        logoUrl: "/chatbot/unitedcap.webp", // Replace with your actual logo path
        agentAvatars: [
            "/path/to/agent1.jpg", // Replace with actual avatar images
            "/path/to/agent2.jpg",
        ],
    };
    
    const ucsWelcomeMessage = {
        title: "Hi there",
        subtitle: "How can we help your business grow?",
    };

    const ucsHelpTopics = [
        { title: "What types of loans do you offer?", question: "What types of business loans do you offer?" },
        { title: "How long does the process take?", question: "How long does it take to get a loan?" },
        { title: "What documents do I need to apply?", question: "What documents do I need to prepare for a loan application?" },
        { title: "Am I eligible with my credit score?", question: "I'm worried about my credit score. Can I still get a loan?" },
    ];

  return (
    
    <div className="flex h-screen flex-col overflow-hidden bg-white md:flex-row">
      {!hideSidebar && (
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
          <SidebarBody className="bg-white">
            {/* Consuelo Logo with Dropdown */}
            <div className="relative mb-4 flex items-center justify-center gap-2 px-3 pt-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 rounded-md bg-white p-2 text-sm shadow-none hover:bg-gray-50"
                  >
                    <div className="h-6 w-6 flex-shrink-0">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
                        alt="Consuelo Logo"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className=" text-gray-900">Consuelo</span>
                    <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0" align="start">
                  {/* Header Section */}
                  <div className="border-b border-gray-100 p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
                          alt="Consuelo Logo"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Consuelo
                        </h3>
                        <p className="text-sm text-gray-500">
                          Free Plan · 1 member
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-800 bg-gray-50 text-gray-700 shadow-none hover:bg-gray-100"
                        onClick={() => setActiveTab("settings")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gray-800 bg-gray-50 text-gray-700 shadow-none hover:bg-gray-100"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite team
                      </Button>
                    </div>
                  </div>

                  {/* User Account Section */}
                  <div className="p-2">
                    <div className="hover:none mb-1 px-2 py-1 text-xs  font-medium text-gray-500">
                      kokayi@consuelohq.com
                    </div>

                    <DropdownMenuItem className="flex items-center  justify-between rounded-lg p-3  hover:bg-gray-100">
                      <div className="flex items-center  gap-3">
                        <div className="h-6 w-6  flex-shrink-0">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
                            alt="Consuelo Logo"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <span className="font-medium ">Consuelo</span>
                      </div>
                      <Check className="h-4 w-4 text-green-600" />
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 rounded-lg p-3">
                      <Plus className="h-4 w-4 text-gray-500" />
                      <span>New Sales Team</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Navigation Items */}
                  <div className="p-2">
                    <DropdownMenuItem
                      className="flex items-center gap-3 rounded-lg p-3"
                      onClick={() => setActiveTab("integrations")}
                    >
                      <Route className="h-4 w-4 text-gray-500" />
                      <span>Integrations</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 rounded-lg p-3">
                      <span>Add another account</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 rounded-lg p-3">
                      <LogOut className="h-4 w-4 text-gray-500" />
                      <span>Log out</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 rounded-lg p-3">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <span>Get Mac app</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Collapse Arrow - Only visible on hover */}
              <SidebarCollapseButton className="absolute -right-2 top-1/2 -translate-y-1/2" />
            </div>
<ActionSearchBar/>
            {/* Search */}
            {/* <div className="mb-4 px-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="h-8 border-0 bg-gray-50 pl-9 text-sm text-gray-700 placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-gray-300"
                />
              </div>
            </div> */}

            
            <nav className="flex-1 space-y-1 px-3">
              {/* Main Navigation (Home & Dashboard) */}
              {mainNavItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  link={item}
                  className={`${
                    activeTab === item.href.replace("#", "")
                      ? "bg-gray-100 font-medium text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  } transition-colors duration-150`}
                />
              ))}

              {/* Retention Section */}
              <div className="pt-4">
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-800">
                    Retention
                    <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1 pl-4">
                    {retentionItems.map((item) => (
                      <SidebarLink
                        key={item.href}
                        link={item}
                        className={`${
                          activeTab === item.href.replace("#", "")
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        } transition-colors duration-150`}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Prospecting Section */}
              <div className="pt-4">
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-800">
                    Prospecting
                    <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1 pl-4">
                    {prospectingItems.map((item) => (
                      <SidebarLink
                        key={item.href}
                        link={item}
                        className={`${
                          activeTab === item.href.replace("#", "")
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        } transition-colors duration-150`}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
              {/* dialer Section */}
              <div className="pt-4">
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-800">
                    Dialer
                    <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1 pl-4">
                    {dialerItems.map((item) => (
                      <SidebarLink
                        key={item.href}
                        link={item}
                        className={`${
                          activeTab === item.href.replace("#", "")
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        } transition-colors duration-150`}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Standalone Items */}
              {standaloneItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  link={item}
                  className={`${
                    activeTab === item.href.replace("#", "")
                      ? "bg-gray-100 font-medium text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  } transition-colors duration-150`}
                />
              ))}
            </nav>
          </SidebarBody>
        </Sidebar>
      )}

      <div
        className={`flex flex-1 flex-col overflow-y-auto bg-gray-50 ${hideSidebar ? "w-full" : ""}`}
      >
        {/* {activeTab !== "home" && !hideSidebar && (
          <Header title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("-", " ")} />
        )} */}
        <main className={`flex-1 ${activeTab === "home" && !hideSidebar ? "p-0" : "p-4 md:p-6"} bg-gray-50`}>
          {hideSidebar ? children : renderContent()}
        </main>


        {/* Expandable Chat - Only show when not on home or settings page and sidebar is visible */}
        {activeTab !== "home" && activeTab !== "settings" && !hideSidebar && (
          <div ref={chatRef}> 
          <ExpandableChat position="bottom-right" size="md">
           <ChatBot
              // New props for the home screen
              brandConfig={unitedCapitalSourceConfig}
              welcomeMessage={ucsWelcomeMessage}
              helpTopics={ucsHelpTopics}

             model="llama3-70b-8192"
              maxTokens={1024}
              botName="United Capital Source Advisor"
              botAvatarUrl="/chatbot/uniteccap_icon.webp"
              applicationUrl="https://www.unitedcapitalsource.com/small-business-loans/" // ... more customization options
              userMessageClassName={""} botMessageClassName={""} inputPlaceholder={""} sendButtonClassName={""}/> 
          </ExpandableChat>
          </div>
        )}
      </div>
    </div>
  )
}

export default MainLayout