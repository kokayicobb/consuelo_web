"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { useState, useEffect } from "react"
import { Sidebar, SidebarBody, SidebarLink, SidebarCollapseButton } from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import Header from "./header"
import ChannelsContent from "../home/content/channels-content"
import HomeContent from "../home/content/home-content"
import InventoryContent from "../home/content/inventory-content"
import CustomersContent from "../home/content/customer-content"
import MarketingContent from "../home/content/marketing-content"
import AIInsightsContent from "../home/content/ai-insights"
import IntegrationsContent from "../home/content/integration-content"
import SettingsContent from "../home/content/settings-content"

import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import ChatContent from "../chat"

// Chat Interface Component for use with ExpandableChat
const ChatInterface = () => {
  const [messages, setMessages] = useState([{ text: "Hi there! How can I help you today?", sender: "bot" }])
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    if (inputValue.trim() === "") return

    // Add user message
    setMessages([...messages, { text: inputValue, sender: "user" }])
    setInputValue("")

    // Simulate bot response (would be replaced with actual API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "Thanks for your message! I'll help you with that.",
          sender: "bot",
        },
      ])
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend()
    }
  }

  return (
    <>
      <ExpandableChatHeader className="bg-white border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
              alt="Consuelo Logo"
              className="h-6 w-6"
            />
          </div>
          <span className="font-medium text-gray-900">Consuelo</span>
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody className="bg-white p-4 space-y-4 w-full">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
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
            className="flex-1 border-gray-200"
          />
          <Button onClick={handleSend} size="icon" className="bg-blue-500 hover:bg-blue-600">
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
      default:
        return <HomeContent />
    }
  }

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
      href: "#ai-insights",
      icon: <Workflow size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("ai-insights"),
    },
  ]

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
  ]

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
      onClick: () => {}, // No functionality for now
    },
    {
      label: "Channel Insights",
      href: "#marketing",
      icon: <PieChart size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("marketing"),
    },
  ]
  const dialerItems = [
    {
      label: "Create Scripts",
      href: "#pipeline-builder",
      icon: <Plus size={20} className="text-gray-600" />,
      onClick: () => {}, // No functionality for now
    },
    
  ]

  // Define the standalone items (AI Recommendations only now)
  const standaloneItems = [
    // {
    //   label: "AI Recommendations",
    //   href: "#ai-insights",
    //   icon: <Lightbulb size={20} className="text-gray-600" />,
    //   onClick: () => setActiveTab("ai-insights"),
    // },
  ]

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white md:flex-row">
      {!hideSidebar && (
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
          <SidebarBody className="bg-white">
            {/* Consuelo Logo with Dropdown */}
            <div className="mb-4 flex items-center justify-center gap-2 px-3 pt-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-2 bg-white hover:bg-gray-50 rounded-md w-full justify-start shadow-none text-sm"
                  >
                    <div className="h-6 w-6 flex-shrink-0">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
                        alt="Consuelo Logo"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className=" text-gray-900">Consuelo</span>
                    <ChevronDown className="h-4 w-4 text-gray-500 ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0" align="start">
                  {/* Header Section */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
                          alt="Consuelo Logo"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Consuelo</h3>
                        <p className="text-sm text-gray-500">Free Plan · 1 member</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-gray-50 shadow-none border-gray-800 text-gray-700 hover:bg-gray-100"
                        onClick={() => setActiveTab("settings")}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 shadow-none bg-gray-50 border-gray-800 text-gray-700 hover:bg-gray-100">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite team
                      </Button>
                    </div>
                  </div>

                  {/* User Account Section */}
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500  hover:none mb-1">kokayi@consuelohq.com</div>

                    <DropdownMenuItem className="flex items-center  justify-between p-3 rounded-lg  hover:bg-gray-100">
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

                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg">
                      <Plus className="h-4 w-4 text-gray-500" />
                      <span>New Sales Team</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Navigation Items */}
                  <div className="p-2">
                    <DropdownMenuItem
                      className="flex items-center gap-3 p-3 rounded-lg"
                      onClick={() => setActiveTab("integrations")}
                    >
                      <Route className="h-4 w-4 text-gray-500" />
                      <span>Integrations</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg">
                      <span>Add another account</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg">
                      <LogOut className="h-4 w-4 text-gray-500" />
                      <span>Log out</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <span>Get Mac app</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Collapse Arrow - Only visible on hover */}
              <SidebarCollapseButton className="absolute -right-2 top-1/2 -translate-y-1/2" />
            </div>

            {/* Search */}
            <div className="mb-4 px-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-8 bg-gray-50 border-0 text-sm text-gray-700 placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-gray-300"
                />
              </div>
            </div>

            <nav className="flex-1 space-y-1 px-3">
              {/* Main Navigation (Home & Dashboard) */}
              {mainNavItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  link={item}
                  className={`${
                    activeTab === item.href.replace("#", "")
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  } transition-colors duration-150`}
                />
              ))}

              {/* Retention Section */}
              <div className="pt-4">
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-150">
                    Retention
                    <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-4 mt-1">
                    {retentionItems.map((item) => (
                      <SidebarLink
                        key={item.href}
                        link={item}
                        className={`${
                          activeTab === item.href.replace("#", "")
                            ? "bg-gray-100 text-gray-900 font-medium"
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
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-150">
                    Prospecting
                    <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-4 mt-1">
                    {prospectingItems.map((item) => (
                      <SidebarLink
                        key={item.href}
                        link={item}
                        className={`${
                          activeTab === item.href.replace("#", "")
                            ? "bg-gray-100 text-gray-900 font-medium"
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
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-150">
                    Dialer
                    <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-4 mt-1">
                    {dialerItems.map((item) => (
                      <SidebarLink
                        key={item.href}
                        link={item}
                        className={`${
                          activeTab === item.href.replace("#", "")
                            ? "bg-gray-100 text-gray-900 font-medium"
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
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  } transition-colors duration-150`}
                />
              ))}
            </nav>
          </SidebarBody>
        </Sidebar>
      )}

      <div className={`flex flex-1 flex-col overflow-y-auto bg-gray-50 ${hideSidebar ? "w-full" : ""}`}>
        {activeTab !== "home" && !hideSidebar && (
          <Header title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("-", " ")} />
        )}
        <main className={`flex-1 ${activeTab === "home" && !hideSidebar ? "p-0" : "p-4 md:p-6"} bg-gray-50`}>
          {hideSidebar ? children : renderContent()}
        </main>

        {/* Expandable Chat - Only show when not on home or settings page and sidebar is visible */}
        {activeTab !== "home" && activeTab !== "settings" && !hideSidebar && (
          <ExpandableChat position="bottom-right" size="md">
            <ChatInterface />
          </ExpandableChat>
        )}
      </div>
    </div>
  )
}

export default MainLayout
