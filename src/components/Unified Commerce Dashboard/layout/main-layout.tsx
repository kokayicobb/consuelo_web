"use client";
import React from "react"; 
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
  Inbox,
  PieChart,
  Lightbulb,
  FilePenLine,
  Settings,
  Globe,
  MessageCircle,
  Send,
  Eye,
  Search,
  ChevronRight,
  Mic,
  ChevronDown,
  UserPlus,
  Plus,
  LogOut,
  Monitor,
  Check,
  Workflow,
  Route,
  Bot,
  Camera,
  Instagram,
  Mail,
} from "lucide-react";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  SignalIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  TagIcon,
  PaperClipIcon,
  InformationCircleIcon,
  LightBulbIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon,
  TrashIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  ChartBarIcon,
  CalendarIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";

import AIInsightsContent from "../tabs/ai-insights";
import ChannelsContent from "../tabs/channels-content";
import ChatContent from "../tabs/chat";
import CustomersContent from "../tabs/accounts";

import InventoryContent from "../tabs/inventory-content";
import MarketingContent from "../tabs/marketing-content";
import SettingsContent from "../tabs/settings-content";
import HomeContent from "../tabs/dashboard";
import ActionSearchBar from "@/components/ui/action-search-bar";
import ChatBot from "../components/chatbot";
import AutomationsPage from "../tabs/apps/automations";
import AppsPage from "../tabs/apps";
import LeadGenerationSearch from "../tabs/apps/app-views/google-maps";
import PhoneCallComponent from "../tabs/on-call-coaching";
import FormSelector from "../tabs/apps/app-views/social-search/form-selector";
import ApolloSearchComponent from "../tabs/apps/app-views/apollo-search-component";
import { Drawer } from "vaul";

// Chat Interface Component for use with ExpandableChat
// NOTE: This component is currently not used in MainLayout but is kept for reference.
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { text: "Hi there! How can I help you today?", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim() === "") return;
    setMessages([...messages, { text: inputValue, sender: "user" }]);
    setInputValue("");
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
      handleSend();
    }
  };

  return (
    <>
      <ExpandableChatHeader className="border-b border-gray-200 bg-neutral-50">
        <div className="flex items-center">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/apple-touch-icon-OnEhJzRCthwLXcIuoeeWSqvvYynB9c.png"
              alt="Consuelo Logo"
              className="h-6 w-6"
            />
          </div>
          {/* FIX: Removed duplicated "Consuelo" span */}
          <span className="font-medium text-gray-900">Consuelo</span>
        </div>
      </ExpandableChatHeader>
      <ExpandableChatBody className="w-full space-y-4 bg-white p-4">
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
  );
};

const MainLayout = ({ children, title, hideSidebar = false }) => {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(!hideSidebar);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "home";
      setActiveTab(hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
      case "accounts":
        return <CustomersContent />;
      case "marketing":
        return <MarketingContent />;
      case "ai-insights":
        return <AIInsightsContent />;
      // case "integrations":
      //   return <IntegrationsContent />;
      case "settings":
        return <SettingsContent />;
      case "automations":
        return <AppsPage />;
      case "blank":
        return <div className="h-full w-full bg-white"></div>;
      default:
        return <HomeContent />;
    }
  };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppCard | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const businessFunctions = [
    {
      id: "lead-generation",
      apps: [
        {
          id: "social-monitor",
          name: "Social Media Monitor",
          description: "Reddit/LinkedIn/Facebook prospect finder",
          icon: <Eye className="h-5 w-5" />,
          color: "bg-slate-300",
        },

        {
          id: "Database-search",
          name: "Leads Search",
          description: "Scrape platforms like Apollo, ZoomInfo, and LinkedIn",
          icon: <Users className="h-5 w-5" />,
          color: "bg-slate-300",
        },
      ],
    },
    {
      id: "customer-retention",
      apps: [
        {
          id: "coaching",
          name: "On-Call Coaching",
          description: "Customer service and guidance",
          icon: <Bot className="h-5 w-5" />,
          color: "bg-slate-300",
        },
        {
          id: "warm-email",
          name: "Warm Email System",
          description: "Salesforce integration for nurturing",
          icon: <Mail className="h-5 w-5" />,
          color: "bg-slate-300",
        },
      ],
    },
    {
      id: "marketing-content",
      apps: [
        {
          id: "social-poster",
          name: "Social Media Poster",
          description: "Multi-platform publishing automation",
          icon: <Instagram className="h-5 w-5" />,
          color: "bg-slate-300",
        },
        {
          id: "content-creator",
          name: "Content Creator",
          description: "Ads/images/infographics generator",
          icon: <Camera className="h-5 w-5" />,
          color: "bg-slate-300",
        },
      ],
    },
  ];

  // 🚀 ADD: Helper function to find an app by its ID
  const findAppById = (id: string): AppCard | undefined => {
    for (const func of businessFunctions) {
      const app = func.apps.find((app) => app.id === id);
      if (app) return app;
    }
    return undefined;
  };

  // 🚀 ADD: Drawer content rendering logic (copied from AppsPage)
  const renderDrawerContent = () => {
    if (!selectedApp) return null;
    switch (selectedApp.id) {
      case "coaching":
        return <PhoneCallComponent />;
      case "social-monitor":
        return (
          <FormSelector
            onClose={() => setIsDrawerOpen(false)}
            isFullScreen={isFullScreen}
            setIsFullScreen={setIsFullScreen}
          />
        );
      case "Database-search":
        return <ApolloSearchComponent />;

      default:
        return <div className="p-4 text-center">Component coming soon.</div>;
    }
  };

  // 🚀 ADD: Handler to open the drawer from a sidebar click
  const handleAppClick = (appId: string) => {
    const app = findAppById(appId);
    if (app) {
      setSelectedApp(app);
      setIsDrawerOpen(true);
      // Optional: you can remove this if you don't want the URL to change
      // window.location.hash = app.id;
    }
  };

  interface AppCard {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }
  // FIX: Removed duplicated state, ref, and useEffect hook. This is the correct, single version.
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    };
    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  const mainNavItems = [
    {
      label: "Home",
      href: "#home",
      icon: <MessageCircle size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("home"),
    },
    {
      label: "Accounts",
      href: "#accounts",
      icon: <Users size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("accounts"),
    },
    {
      label: "Inbox",
      href: "#pipeline-builder",
      icon: <Inbox size={20} className="text-gray-600" />,
      onClick: () => {}, // No functionality for now
    },
    {
      label: "Analytics",
      href: "#dashboard",
      icon: <LayoutDashboard size={20} className="text-gray-600" />,
      onClick: () => setActiveTab("dashboard"),
    },
  ];

  const retentionItems = [
    // {
    //   label: "Cohorts",
    //   href: "#channels",
    //   icon: <BarChart3 size={20} className="text-gray-600" />,
    //   onClick: () => setActiveTab("channels"),
    // },
    // {
    //   label: "Product Insights",
    //   href: "#inventory",
    //   icon: <Package size={20} className="text-gray-600" />,
    //   onClick: () => setActiveTab("inventory"),
    // },
  ];

  const appItems = [
    {
      label: "All Apps",
      href: "#automations",
      icon: <Workflow size={20} className="text-gray-600" />,
      // FIX: Removed duplicated onClick property
      onClick: () => setActiveTab("automations"),
    },

    {
      label: "On-Call Coaching",
      href: "#coaching",
      icon: <Mic size={20} className="text-gray-600" />,
      onClick: () => handleAppClick("coaching"),
    },
    {
      label: "Social Media Monitor",
      href: "#social-monitor",
      icon: <Eye size={20} className="text-gray-600" />,
      onClick: () => handleAppClick("social-monitor"),
    },
    {
      label: "Leads Search",
      href: "#Database-search",
      icon: <Users size={20} className="text-gray-600" />,
      onClick: () => handleAppClick("Database-search"),
    },

    // {
    //   label: "Pipeline Builder",
    //   href: "#pipeline-builder",
    //   icon: <BarChart3 size={20} className="text-gray-600" />,
    //   onClick: () => {}, // No functionality for now
    // },
    // {
    //   label: "Lead Cohorts",
    //   href: "#leads",
    //   icon: <Users size={20} className="text-gray-600" />,
    //   // FIX: Removed duplicated onClick property
    //   onClick: () => setActiveTab("ai-insights"),
    // },
    // {
    //   label: "Channel Insights",
    //   href: "#marketing",
    //   icon: <PieChart size={20} className="text-gray-600" />,
    //   onClick: () => setActiveTab("marketing"),
    // },
  ];

  const dialerItems = [
    {
      label: "Create Script",
      href: "#pipeline-builder",
      icon: <Plus size={20} className="text-gray-600" />,
      onClick: () => {}, // No functionality for now
    },
  ];

  const standaloneItems = [
    // {
    //   label: "AI Recommendations",
    //   href: "#ai-insights",
    //   icon: <Lightbulb size={20} className="text-gray-600" />,
    //   onClick: () => setActiveTab("ai-insights"),
    // },
  ];

  const allAppsItem = appItems[0];
  // Get all the other items
  const otherAppItems = appItems.slice(1);
  // FIX: Removed duplicated config objects and a stray closing bracket.
  const unitedCapitalSourceConfig = {
    name: "United Capital Source",
    logoUrl: "/chatbot/unitedcap.webp",
    agentAvatars: ["/path/to/agent1.jpg", "/path/to/agent2.jpg"],
  };

  const ucsWelcomeMessage = {
    title: "Hi there",
    subtitle: "How can we help your business grow?",
  };

  const ucsHelpTopics = [
    {
      title: "What types of loans do you offer?",
      question: "What types of business loans do you offer?",
    },
    {
      title: "How long does the process take?",
      question: "How long does it take to get a loan?",
    },
    {
      title: "What documents do I need to apply?",
      question: "What documents do I need to prepare for a loan application?",
    },
    {
      title: "Am I eligible with my credit score?",
      question: "I'm worried about my credit score. Can I still get a loan?",
    },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50 md:flex-row">
      {!hideSidebar && (
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
          <SidebarBody className="bg-neutral-50">
            <div className="relative mb-4 flex items-center justify-center gap-2 px-3 pt-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-start gap-2 rounded-md bg-neutral-50 p-2 text-sm shadow-none hover:bg-gray-50"
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
                <DropdownMenuContent
                  className="w-80 bg-neutral-50 p-0"
                  align="start"
                >
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
              <SidebarCollapseButton className="absolute -right-2 top-1/2 -translate-y-1/2" />
            </div>

            <nav className="flex-1 space-y-1 px-3">
              <ActionSearchBar />
              {mainNavItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  link={item}
                  isActive={activeTab === item.href.replace("#", "")}
                  onTabReset={() => {
                    // Force a complete refresh of the tab state
                    const currentTab = item.href.replace("#", "");

                    // Temporarily set to a different tab, then back to trigger a full re-render
                    setActiveTab("blank");
                    setTimeout(() => {
                      setActiveTab(currentTab);
                      window.scrollTo(0, 0);
                    }, 0);
                  }}
                  className={`${
                    activeTab === item.href.replace("#", "")
                      ? "bg-gray-100 font-medium text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  } transition-colors duration-150`}
                />
              ))}
              <div className="pt-4">
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-800">
                    Apps
                    <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1 pl-4">
                    {/* --- START: MODIFIED SECTION --- */}

                    {/* 1. Render the "All Apps" link by itself */}
                    {allAppsItem && (
                      <SidebarLink
                        key={allAppsItem.href}
                        link={allAppsItem}
                        isActive={
                          activeTab === allAppsItem.href.replace("#", "")
                        }
                        onTabReset={() => {
                          /* Your existing onTabReset logic */
                        }}
                        className={`${
                          activeTab === allAppsItem.href.replace("#", "")
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        } transition-colors duration-150`}
                      />
                    )}

                    {/* 2. Render the custom divider with the "Add" button */}
                    <div className="my-2 flex items-center pr-2">
                      <div className="flex-grow border-t border-dashed border-gray-300"></div>
                      <button
                        type="button"
                        className="ml-3 flex flex-shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                      >
                        <Plus className="h-3 w-3" />
                        my apps
                      </button>
                    </div>

                    {/* 3. Render the rest of the apps */}
                    {otherAppItems.map((item) => (
                      <SidebarLink
                        key={item.href}
                        link={item}
                        isActive={activeTab === item.href.replace("#", "")}
                        onTabReset={() => {
                          /* Your existing onTabReset logic */
                        }}
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
              {/* <div className="pt-4">
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
                        isActive={activeTab === item.href.replace("#", "")}
                        onTabReset={() => {
                          const currentTab = item.href.replace("#", "");
                          setActiveTab("blank");
                          setTimeout(() => {
                            setActiveTab(currentTab);
                            window.scrollTo(0, 0);
                          }, 0);
                        }}
                        className={`${
                          activeTab === item.href.replace("#", "")
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        } transition-colors duration-150`}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div> */}

              {/* <div className="pt-4">
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-800">
                    Contacting
                    <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1 pl-4">
                    {dialerItems.map((item) => (
                      <SidebarLink
                        key={item.href}
                        link={item}
                        isActive={activeTab === item.href.replace("#", "")}
                        onTabReset={() => {
                          const currentTab = item.href.replace("#", "");
                          setActiveTab("blank");
                          setTimeout(() => {
                            setActiveTab(currentTab);
                            window.scrollTo(0, 0);
                          }, 0);
                        }}
                        className={`${
                          activeTab === item.href.replace("#", "")
                            ? "bg-gray-100 font-medium text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                        } transition-colors duration-150`}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div> */}
              {standaloneItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  link={item}
                  isActive={activeTab === item.href.replace("#", "")}
                  onTabReset={() => {
                    const currentTab = item.href.replace("#", "");
                    setActiveTab("blank");
                    setTimeout(() => {
                      setActiveTab(currentTab);
                      window.scrollTo(0, 0);
                    }, 0);
                  }}
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
        className={`flex flex-1 flex-col overflow-y-auto bg-white ${
          hideSidebar ? "w-full" : ""
        }`}
      >
        <main
          className={`flex-1 ${
            activeTab === "home" && !hideSidebar ? "p-0" : "p-4 md:p-6"
          } bg-white`}
        >
          {hideSidebar ? children : renderContent()}
        </main>

        {activeTab !== "home" && activeTab !== "settings" && !hideSidebar && (
          // FIX: Removed the extra nested div with the same ref
          <div ref={chatRef}>
            <ExpandableChat position="bottom-right" size="md">
              {/* FIX: Removed the duplicated ChatBot component */}
              <ChatBot
                brandConfig={unitedCapitalSourceConfig}
                welcomeMessage={ucsWelcomeMessage}
                helpTopics={ucsHelpTopics}
                model="llama3-70b-8192"
                maxTokens={1024}
                botName="United Capital Source Advisor"
                botAvatarUrl="/chatbot/uniteccap_icon.webp"
                applicationUrl="https://www.unitedcapitalsource.com/small-business-loans/"
                userMessageClassName={""}
                botMessageClassName={""}
                inputPlaceholder={""}
                sendButtonClassName={""}
              />
            </ExpandableChat>
          </div>
        )}
        <Drawer.Root 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        direction="right"
        modal={false}
      >
        <Drawer.Portal>
          <Drawer.Content
            className={`bg-neutral-50 h-full fixed top-0 right-0 z-50 outline-none overflow-hidden ${
              isFullScreen ? "w-full" : "w-full max-w-2xl"
            }`}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-neutral-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded hover:bg-gray-200"><ChevronDoubleRightIcon className="h-5 w-5" /></button>
                  <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 rounded hover:bg-gray-200">
                    {isFullScreen ? <ArrowsPointingInIcon className="h-5 w-5" /> : <ArrowsPointingOutIcon className="h-5 w-5" />}
                  </button>
                  <h2 className="text-lg font-semibold">{selectedApp?.name || "App Details"}</h2>
                </div>
                
                <div className="flex items-center gap-1">
                  {/* These buttons are decorative for now */}
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-slate-600 hover:text-slate-900">Share</Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"><ChatBubbleLeftIcon className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"><StarIcon className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"><EllipsisHorizontalIcon className="h-6 w-6" /></Button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {selectedApp && (
                    <div className="flex items-center space-x-4 pb-4 border-b border-slate-200 mb-6">
                      <div className={`flex items-center justify-center h-16 w-16 rounded-lg ${selectedApp.color}`}>
                        <div className="text-white">{selectedApp.icon}</div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">{selectedApp.name}</h3>
                        <p className="text-md text-slate-600">{selectedApp.description}</p>
                      </div>
                    </div>
                  )}
                  {renderDrawerContent()}
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
      </div>
    </div>
  );
};

export default MainLayout;
