"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Plus,
  Search,
  Zap,
  Loader2,
  ChevronRight,
  Trash2,
  X,
  Check,
  ExternalLink,
  Sparkles,
  Calendar,
  BarChart3,
  Target,
  Star,
  Clock,
  Play,
  Settings,
  TrendingUp,
  UserPlus,
  Heart,
  Send,
  Database,
  Bot,
  Workflow,
  Table,
  Layout,
  PenTool,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Flow } from "../../lib/activepieces/types"
import AutomationEditor from "./automation-editor"

// Template interface for CRM-focused templates
interface Template {
  id: string
  name: string
  description: string
  category: string
  apps: string[]
  icon: string
  popular: boolean
  aiPowered: boolean
  estimatedTime: string
  useCase: string
  triggerType: string
  actions: string[]
}

export default function AutomationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [flows, setFlows] = useState<Flow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  // Parse URL params to determine current view (keep your existing logic)
  const attemptId = searchParams.get("attempt_id")
  const flowId = searchParams.get("flow_id")
  const status = searchParams.get("status")
  const isEditing = Boolean(attemptId || flowId)

  // State for publish success modal (keep your existing logic)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishedFlow, setPublishedFlow] = useState<Flow | null>(null)

  // CRM-focused templates
  const templates: Template[] = [
    {
      id: "t1",
      name: "New Lead Welcome Sequence",
      description: "Automatically nurture new leads with personalized email sequences",
      category: "Lead Generation",
      apps: ["CRM", "Email", "SMS"],
      icon: "UserPlus",
      popular: true,
      aiPowered: true,
      estimatedTime: "5 min",
      useCase: "Convert 40% more leads with automated follow-up",
      triggerType: "webhook",
      actions: ["email", "crm_update"],
    },
    {
      id: "t2",
      name: "Client Health Score Monitor",
      description: "Track client engagement and trigger retention campaigns",
      category: "Client Retention",
      apps: ["CRM", "Analytics", "Email"],
      icon: "Heart",
      popular: true,
      aiPowered: true,
      estimatedTime: "8 min",
      useCase: "Reduce churn by 25% with proactive outreach",
      triggerType: "schedule",
      actions: ["analytics_check", "email", "crm_task"],
    },
    {
      id: "t3",
      name: "Meeting Follow-up Automation",
      description: "Send personalized follow-ups after client meetings",
      category: "Client Retention",
      apps: ["Calendar", "Email", "CRM"],
      icon: "Calendar",
      popular: false,
      aiPowered: false,
      estimatedTime: "3 min",
      useCase: "Never miss a follow-up opportunity",
      triggerType: "webhook",
      actions: ["email", "crm_update"],
    },
    {
      id: "t4",
      name: "Social Media Lead Qualifier",
      description: "Qualify and score leads from social media interactions",
      category: "Lead Generation",
      apps: ["Facebook", "LinkedIn", "CRM"],
      icon: "Target",
      popular: true,
      aiPowered: true,
      estimatedTime: "6 min",
      useCase: "Focus on high-quality leads automatically",
      triggerType: "webhook",
      actions: ["lead_scoring", "crm_update", "slack_notify"],
    },
    {
      id: "t5",
      name: "Contract Renewal Reminder",
      description: "Automated reminders for upcoming contract renewals",
      category: "Client Retention",
      apps: ["CRM", "Email", "Calendar"],
      icon: "Clock",
      popular: false,
      aiPowered: false,
      estimatedTime: "4 min",
      useCase: "Increase renewal rates by 30%",
      triggerType: "schedule",
      actions: ["email", "calendar_event"],
    },
    {
      id: "t6",
      name: "Lead Scoring & Routing",
      description: "AI-powered lead scoring and automatic assignment",
      category: "Lead Generation",
      apps: ["CRM", "AI", "Slack"],
      icon: "TrendingUp",
      popular: true,
      aiPowered: true,
      estimatedTime: "10 min",
      useCase: "Route hot leads to your best sales reps",
      triggerType: "webhook",
      actions: ["ai_scoring", "crm_assign", "slack_notify"],
    },
  ]

  // Keep your existing useEffect for fetching flows
  useEffect(() => {
    if (!isEditing) {
      fetchFlows()
    }
  }, [isEditing])

  // Keep your existing fetchFlows function
  const fetchFlows = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/automations/flows")
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setFlows(result.data.data || [])
      } else {
        throw new Error(result.error?.message || "Failed to fetch flows")
      }
    } catch (err: any) {
      console.error("Error fetching flows:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Keep all your existing handler functions
  const handleCreateAutomation = () => {
    const newAttemptId = generateAttemptId()
    const url = new URL(window.location.href)
    url.searchParams.set("attempt_id", newAttemptId)
    window.history.pushState({}, "", url.toString())
  }

  const handleEditAutomation = (flow: Flow) => {
    const url = new URL(window.location.href)
    url.searchParams.set("flow_id", flow.id)
    url.searchParams.set("status", flow.status === "ENABLED" ? "published" : "draft")
    window.history.pushState({}, "", url.toString())
  }

  const handleBackToList = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete("attempt_id")
    url.searchParams.delete("flow_id")
    url.searchParams.delete("status")
    window.history.pushState({}, "", url.toString())
    fetchFlows()
  }

  const handleFlowPublished = (flow: Flow) => {
    setPublishedFlow(flow)
    setShowPublishModal(true)
    const url = new URL(window.location.href)
    url.searchParams.set("flow_id", flow.id)
    url.searchParams.set("status", "published")
    url.searchParams.delete("attempt_id")
    window.history.pushState({}, "", url.toString())
  }

  const handleFlowDraftSaved = (flow: Flow) => {
    const url = new URL(window.location.href)
    url.searchParams.set("flow_id", flow.id)
    url.searchParams.set("status", "draft")
    url.searchParams.delete("attempt_id")
    window.history.pushState({}, "", url.toString())
  }

  const handleDeleteAutomation = async (flowId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm("Are you sure you want to delete this automation?")) return

    try {
      const response = await fetch(`/api/automations/flows/${flowId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete. Status: ${response.status}`)
      }

      setFlows(flows.filter((f) => f.id !== flowId))
    } catch (err: any) {
      console.error("Error deleting automation:", err)
      setError(err.message)
    }
  }

  const generateAttemptId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Template handling
  const handleUseTemplate = (template: Template) => {
    // Create a new automation with template data
    const newAttemptId = generateAttemptId()
    const url = new URL(window.location.href)
    url.searchParams.set("attempt_id", newAttemptId)
    url.searchParams.set("template", template.id)
    window.history.pushState({}, "", url.toString())
  }

  const filteredFlows = flows.filter((flow) =>
    flow.version.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredTemplates =
    selectedCategory === "all" ? templates : templates.filter((t) => t.category === selectedCategory)

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      UserPlus,
      Heart,
      Calendar,
      Target,
      Clock,
      TrendingUp,
      Zap,
      Bot,
      Workflow,
      Table,
      Layout,
      PenTool,
    }
    return icons[iconName] || Zap
  }

  // Keep your existing editor rendering logic
  if (isEditing) {
    return (
      <>
        <AutomationEditor
          attemptId={attemptId}
          flowId={flowId}
          onBack={handleBackToList}
          onPublish={handleFlowPublished}
          onSaveDraft={handleFlowDraftSaved}
        />

        {showPublishModal && publishedFlow && (
          <PublishSuccessModal
            flow={publishedFlow}
            onClose={() => {
              setShowPublishModal(false)
              handleBackToList()
            }}
            onViewFlow={() => {
              setShowPublishModal(false)
            }}
          />
        )}
      </>
    )
  }

  // Enhanced UI with your working backend
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
              <p className="mt-2 text-gray-600">Automate your CRM workflows to retain clients and generate leads</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAIAssistant(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Sparkles size={16} />
                AI Assistant
              </button>
              <button
                onClick={handleCreateAutomation}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Create Automation
              </button>
            </div>
          </div>

          {/* AI Search Bar */}
          <div className="relative mb-6">
            <div className="relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={20} />
              <input
                type="text"
                placeholder="What would you like to automate? (e.g., 'Send welcome email to new leads')"
                className="w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                  AI beta
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: "overview", name: "Overview", icon: BarChart3 },
                { id: "templates", name: "Discover", icon: Layout },
                { id: "my-automations", name: "My Automations", icon: Workflow },
                { id: "analytics", name: "Analytics", icon: TrendingUp },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Stats using your real data
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Automations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {flows.filter((f) => f.status === "ENABLED").length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Play className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Automations</p>
                    <p className="text-2xl font-bold text-gray-900">{flows.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Draft Automations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {flows.filter((f) => f.status === "DISABLED").length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Templates Available</p>
                    <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Layout className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div> */}

            {/* Start from Scratch */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Start from scratch</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { name: "Automation", desc: "Automated workflows", icon: Zap, color: "orange" },
                  { name: "Database", desc: "Automated data", icon: Database, color: "red" },
                  { name: "Interface", desc: "Apps, forms, and pages", icon: Layout, color: "orange" },
                  { name: "Chatbot", desc: "AI-powered chatbot", icon: Bot, color: "orange" },
                  { name: "Canvas", desc: "Process visualization", icon: PenTool, color: "orange" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.name}
                      onClick={handleCreateAutomation}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                        <Icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Recent Activity using your real flows */}
            {flows.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recently updated</h2>
                  <button
                    onClick={() => setActiveTab("my-automations")}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {flows.slice(0, 3).map((flow) => (
                    <div
                      key={flow.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleEditAutomation(flow)}
                    >
                      <div className="flex items-center gap-4">
                        <Zap className="w-5 h-5 text-orange-500" />
                        <div>
                          <h3 className="font-medium text-gray-900">{flow.version.displayName}</h3>
                          <p className="text-sm text-gray-600">
                            Updated {formatDistanceToNow(new Date(flow.updated), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            flow.status === "ENABLED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {flow.status === "ENABLED" ? "On" : "Off"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">CRM Automation Templates</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Browse all templates</button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: "all", name: "All Templates", icon: Star },
                  { id: "Lead Generation", name: "Lead Generation", icon: UserPlus },
                  { id: "Client Retention", name: "Client Retention", icon: Heart },
                ].map((filter) => {
                  const Icon = filter.icon
                  return (
                    <button
                      key={filter.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === filter.id
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setSelectedCategory(filter.id)}
                    >
                      <Icon size={14} />
                      {filter.name}
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => {
                  const Icon = getIconComponent(template.icon)
                  return (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        {template.popular && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                            Popular
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {template.aiPowered && (
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-500" />
                              <span className="text-xs text-purple-600 font-medium">AI</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">{template.estimatedTime}</span>
                        </div>
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Use template
                        </button>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600">{template.useCase}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* My Automations Tab - Your existing list with enhanced styling */}
        {activeTab === "my-automations" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Your Automations</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search automations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="py-20 text-center text-red-500">Error: {error}</div>
              ) : flows.length === 0 ? (
                <div className="py-20 text-center">
                  <Zap size={40} className="mx-auto mb-3 text-gray-300" />
                  <h3 className="mb-1 font-semibold text-gray-700">No Automations Found</h3>
                  <p className="mb-4 text-sm text-gray-500">Get started by creating your first workflow.</p>
                  <button
                    onClick={handleCreateAutomation}
                    className="mx-auto flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                  >
                    <Plus size={16} />
                    Create Automation
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredFlows.map((flow) => (
                    <div key={flow.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-4 flex-grow cursor-pointer"
                          onClick={() => handleEditAutomation(flow)}
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${
                              flow.status === "ENABLED" ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{flow.version.displayName}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Updated {formatDistanceToNow(new Date(flow.updated), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              flow.status === "ENABLED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {flow.status === "ENABLED" ? "Published" : "Draft"}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditAutomation(flow)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              <Settings size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteAutomation(flow.id, e)}
                              className="p-2 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => handleEditAutomation(flow)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Automations</span>
                    <span className="font-semibold">{flows.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Automations</span>
                    <span className="font-semibold text-green-600">
                      {flows.filter((f) => f.status === "ENABLED").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Draft Automations</span>
                    <span className="font-semibold text-orange-600">
                      {flows.filter((f) => f.status === "DISABLED").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Available Templates</span>
                    <span className="font-semibold text-blue-600">{templates.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Automations</h3>
                <div className="space-y-3">
                  {flows.slice(0, 5).map((flow, index) => (
                    <div key={flow.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-800">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{flow.version.displayName}</p>
                        <p className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(flow.updated), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            flow.status === "ENABLED" ? "text-green-600" : "text-gray-600"
                          }`}
                        >
                          {flow.status === "ENABLED" ? "Active" : "Draft"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Assistant Modal */}
        {showAIAssistant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">AI Automation Assistant</h2>
                      <p className="text-sm text-gray-600">Describe what you want to automate</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAIAssistant(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Try asking:</p>
                    <div className="space-y-2">
                      <button className="block w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-sm">"Send a welcome email when someone fills out my contact form"</span>
                      </button>
                      <button className="block w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-sm">"Remind me to follow up with clients after 30 days"</span>
                      </button>
                      <button className="block w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-sm">"Create a task when a lead score reaches 80"</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      placeholder="Describe your automation idea in plain English..."
                      className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                    <button className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Keep your existing PublishSuccessModal component
function PublishSuccessModal({
  flow,
  onClose,
  onViewFlow,
}: {
  flow: Flow
  onClose: () => void
  onViewFlow: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-gray-900">Automation Published!</h3>

        <p className="mb-6 text-gray-600">Your automation "{flow.version.displayName}" is now live and ready to run.</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Back to Automations
          </button>
          <button onClick={onViewFlow} className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700">
            Continue Editing
          </button>
        </div>

        {flow.version.trigger.type === "WEBHOOK" && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="mb-1 text-sm font-medium text-gray-700">Webhook URL:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-gray-200 px-2 py-1 text-xs text-gray-800">
                {`${window.location.origin}/webhook/${flow.id}`}
              </code>
              <button className="text-gray-600 hover:text-gray-800">
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
