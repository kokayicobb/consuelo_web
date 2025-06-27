"use client"

import { useState } from "react"
import {
  Cloud,
  Star,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Plus,
  Share,
  Zap,
  Users,
  Megaphone,
  TrendingUp,
  Settings,
  Bot,
  Mail,
  MessageSquare,
  Camera,
  Video,
  Mic,
  Calendar,
  Map,
  Linkedin,
  Instagram,
  Target,
  Repeat,
  Eye,
  Download,
  RefreshCw,
  Search,
  Building,
  MapPin,
  Briefcase,
  GraduationCap,
  AlertCircle,
  Info,
  ChevronsRight,
  Maximize2,
  Minimize2,
  MessageCircle,
 } from "lucide-react"
import { Drawer } from "vaul"
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
} from '@heroicons/react/24/solid'
import ApolloSearchComponent from "./app-views/apollo-search-component"
import dynamic from "next/dynamic"
import ModelGenerationContent from "@/components/Dashboard/model-generation-content"

// Dynamically import to avoid SSR issues with Google Maps
const LeadGenerationSearch = dynamic(
  () => import("./app-views/google-maps"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Lead Generation...</p>
        </div>
      </div>
    )
  }
)
// Temporary component definitions for demo
const Button = ({ children, variant = "default", size = "md", className = "", ...props }) => (
  <button 
    className={`rounded-md font-medium transition-colors ${
      variant === "ghost" 
        ? "hover:bg-gray-100 text-gray-700" 
        : variant === "default"
        ? "hover:bg-gray-100 text-gray-700"
        : "bg-gray-900 text-white hover:bg-gray-800"
    } ${
      size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2"
    } ${className}`}
    {...props}
  >
    {children}
  </button>
)

const Badge = ({ children, variant = "default", className = "" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
    variant === "secondary" ? "bg-gray-100 text-gray-800" : 
    variant === "outline" ? "border border-gray-300 text-gray-700" :
    variant === "destructive" ? "bg-red-100 text-red-800" :
    "bg-blue-100 text-blue-800"
  } ${className}`}>
    {children}
  </span>
)

const Input = ({ className = "", ...props }) => (
  <input 
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
)

const Label = ({ children, className = "", ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
)

const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {value || "Select..."}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          {children}
        </div>
      )}
    </div>
  )
}

const SelectTrigger = ({ children }) => children
const SelectValue = ({ placeholder }) => <span>{placeholder}</span>
const SelectContent = ({ children }) => children
const SelectItem = ({ value, children, onValueChange }) => (
  <button
    className="w-full px-3 py-2 text-left hover:bg-gray-100"
    onClick={() => onValueChange?.(value)}
  >
    {children}
  </button>
)

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
)

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

const Alert = ({ children, variant = "default", className = "" }) => (
  <div className={`p-4 rounded-lg flex items-start gap-3 ${
    variant === "destructive" ? "bg-red-50 text-red-900" : "bg-blue-50 text-blue-900"
  } ${className}`}>
    {children}
  </div>
)

const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
)



// App card interface
interface AppCard {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

interface BusinessFunction {
  id: string
  name: string
  icon: React.ReactNode
  expanded: boolean
  apps: AppCard[]
}

const businessFunctions: BusinessFunction[] = [
  {
    id: "lead-generation",
    name: "Lead Generation",
    icon: <Target className="w-4 h-4" />,
    expanded: true,
    apps: [
      {
        id: "social-monitor",
        name: "Social Media Monitor",
        description: "Reddit/LinkedIn/Facebook prospect finder",
        icon: <Eye className="w-5 h-5" />,
        color: "bg-slate-300",
      },
      {
        id: "maps-scraper",
        name: "Google Maps Scraper",
        description: "Local business data extraction",
        icon: <Map className="w-5 h-5" />,
        color: "bg-slate-300",
      },
      {
        id: "apollo-scraper",
        name: "Database Search",
        description: "Scrape platforms like Apollo, ZoomInfo, and LinkedIn",
        icon: <Users className="w-5 h-5" />,
        color: "bg-slate-300",
      },
      {
        id: "linkedin-bot",
        name: "LinkedIn Outreach Bot",
        description: "Valley-style messaging automation",
        icon: <Linkedin className="w-5 h-5" />,
        color: "bg-slate-600",
      },
    ],
  },
  {
    id: "customer-retention",
    name: "Customer Retention",
    icon: <Repeat className="w-4 h-4" />,
    expanded: false,
    apps: [
      {
        id: "ai-chatbot",
        name: "AI Chatbot",
        description: "Customer service and guidance",
        icon: <Bot className="w-5 h-5" />,
        color: "bg-slate-300",
      },
      {
        id: "warm-email",
        name: "Warm Email System",
        description: "Salesforce integration for nurturing",
        icon: <Mail className="w-5 h-5" />,
        color: "bg-slate-300",
      },
      {
        id: "reengagement-bot",
        name: "Re-engagement Bot",
        description: "Paid-off loan customer outreach",
        icon: <MessageSquare className="w-5 h-5" />,
        color: "bg-slate-300",
      },
    ],
  },
  {
    id: "marketing-content",
    name: "Marketing & Content",
    icon: <Megaphone className="w-4 h-4" />,
    expanded: false,
    apps: [
      {
        id: "social-poster",
        name: "Social Media Poster",
        description: "Multi-platform publishing automation",
        icon: <Instagram className="w-5 h-5" />,
        color: "bg-slate-300",
      },
      {
        id: "content-creator",
        name: "Content Creator",
        description: "Ads/images/infographics generator",
        icon: <Camera className="w-5 h-5" />,
        color: "bg-slate-300",
      },
      {
        id: "video-generator",
        name: "Video Generator",
        description: "Automated video creation",
        icon: <Video className="w-5 h-5" />,
        color: "bg-slate-300",
      },
      {
        id: "podcast-creator",
        name: "Podcast Creator",
        description: "AI voice synthesis for podcasts",
        icon: <Mic className="w-5 h-5" />,
        color: "bg-slate-300",
      },
    ],
  },
]

export default function AppsPage() {
  const [functions, setFunctions] = useState<BusinessFunction[]>(businessFunctions)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<AppCard | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const toggleSection = (id: string) => {
    setFunctions((prev) => prev.map((func) => (func.id === id ? { ...func, expanded: !func.expanded } : func)))
  }

  const handleAppClick = (app: AppCard) => {
    setSelectedApp(app)
    setIsDrawerOpen(true)
  }

 // In your apps.tsx file, update the renderDrawerContent function:

const renderDrawerContent = () => {
  if (!selectedApp) return null

  // Special handling for Apollo/ZoomInfo Scraper
  if (selectedApp.id === "apollo-scraper") {
    return <ApolloSearchComponent />
  }

  // Add handling for Google Maps Scraper
  if (selectedApp.id === "maps-scraper") {
    // Import at the top of the file:
    // import LeadGenerationSearch from "./app-views/LeadGenerationSearch"
    return <LeadGenerationSearch />
  }
   // Add handling for Google Maps Scraper
   if (selectedApp.id === "content-creator") {
    // Import at the top of the file:
    // import LeadGenerationSearch from "./app-views/LeadGenerationSearch"
    return <ModelGenerationContent />
  }
//
  // Default content for other apps
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          This is the {selectedApp.name} interface. The functionality is coming soon.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Description</h4>
        <p className="text-sm text-gray-600">{selectedApp.description}</p>
      </div>
    </div>
  )
}

  return (
    <div className="space-y-6 bg-white min-h-screen p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Apps</h1>
          <p className="text-gray-500 mt-1">
            Manage your business automation applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Add App
          </Button>
        </div>
      </div>

      {/* Business Functions */}
      <div className="space-y-6">
        {functions.map((func) => (
          <div key={func.id} className="space-y-3">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(func.id)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-colors duration-150"
            >
              {func.expanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              <div className="flex items-center gap-2">
                {func.icon}
                <span className="text-sm font-medium">{func.name}</span>
                <span className="text-xs text-purple-600 font-medium">
                  {func.apps.length}
                </span>
              </div>
            </button>

            {/* Section Content */}
            {func.expanded && (
              <div className="pl-0">
                {func.apps.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                    {func.apps.map((app) => (
                      <div
                        key={app.id}
                        className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm hover:border-gray-300 transition-all duration-150 cursor-pointer"
                        style={{ aspectRatio: "1" }}
                        onClick={() => handleAppClick(app)}
                      >
                        {/* Main blank square area */}
                        <div className="bg-gray-50 h-3/4 w-full"></div>

                        {/* Bottom section with title */}
                        <div className="bg-white h-1/4 w-full flex items-center px-3 border-t border-gray-100">
                          <div className="text-gray-700 flex-shrink-0 mr-2">{app.icon}</div>
                          <h3 className="font-medium text-gray-900 group-hover:text-slate-700 transition-colors text-sm truncate">
                            {app.name}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <div className="text-center">
                      <Plus className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">No apps yet</p>
                      <Button
                        variant="ghost"
                        className="mt-3 text-gray-500 hover:text-gray-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        New app
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add New Category */}
        <button
          className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors duration-150 border-2 border-dashed border-gray-200 hover:border-gray-300"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">New category</span>
        </button>
      </div>

      {/* Vaul Drawer */}
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
                  <Button variant="default" size="sm" onClick={() => setIsDrawerOpen(false)} className="h-8 w-8 p-0">
                    <ChevronDoubleRightIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="default" size="sm" onClick={() => setIsFullScreen(!isFullScreen)} className="h-8 w-8 p-0">
                    {isFullScreen ? <ArrowsPointingInIcon className="h-5 w-5" /> : <ArrowsPointingOutIcon className="h-5 w-5" />}
                  </Button>
                  <h2 className="text-lg font-semibold">{selectedApp?.name || "App Details"}</h2>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-slate-600 hover:text-slate-900">
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900">
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900">
                    <StarIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900">
                    <EllipsisHorizontalIcon className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {/* App Header */}
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

                  {/* Dynamic Content */}
                  {renderDrawerContent()}
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}