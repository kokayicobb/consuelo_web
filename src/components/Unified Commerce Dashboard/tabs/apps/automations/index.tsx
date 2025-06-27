"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Flow } from "../../../lib/automations/types";
import AutomationEditor from "./automation-editor";
import InspirationSection from "./home-sections/inspiration-section";
import ApolloSearchComponent from "../app-views/apollo-search-component";


// Template interface for CRM-focused templates
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  apps: string[];
  icon: string;
  popular: boolean;
  aiPowered: boolean;
  estimatedTime: string;
  useCase: string;
  triggerType: string;
  actions: string[];
}

export default function AutomationsPage() {
  const [showApolloSearch, setShowApolloSearch] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Parse URL params to determine current view (keep your existing logic)
  const attemptId = searchParams.get("attempt_id");
  const flowId = searchParams.get("flow_id");
  const status = searchParams.get("status");
  const isEditing = Boolean(attemptId || flowId);

  // State for publish success modal (keep your existing logic)
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedFlow, setPublishedFlow] = useState<Flow | null>(null);

  // CRM-focused templates
  const templates: Template[] = [
    {
      id: "t1",
      name: "New Lead Welcome Sequence",
      description:
        "Automatically nurture new leads with personalized email sequences",
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
  ];

  // Keep your existing useEffect for fetching flows
  useEffect(() => {
    if (!isEditing) {
      fetchFlows();
    }
  }, [isEditing]);

  // Keep your existing fetchFlows function
  const fetchFlows = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/automations/flows");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setFlows(result.data.data || []);
      } else {
        throw new Error(result.error?.message || "Failed to fetch flows");
      }
    } catch (err: any) {
      console.error("Error fetching flows:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Keep all your existing handler functions
  const handleCreateAutomation = () => {
    const newAttemptId = generateAttemptId();
    const url = new URL(window.location.href);
    url.searchParams.set("attempt_id", newAttemptId);
    window.history.pushState({}, "", url.toString());
  };

  const handleEditAutomation = (flow: Flow) => {
    const url = new URL(window.location.href);
    url.searchParams.set("flow_id", flow.id);
    url.searchParams.set(
      "status",
      flow.status === "ENABLED" ? "published" : "draft",
    );
    window.history.pushState({}, "", url.toString());
  };

  const handleBackToList = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("attempt_id");
    url.searchParams.delete("flow_id");
    url.searchParams.delete("status");
    window.history.pushState({}, "", url.toString());
    fetchFlows();
  };

  const handleFlowPublished = (flow: Flow) => {
    setPublishedFlow(flow);
    setShowPublishModal(true);
    const url = new URL(window.location.href);
    url.searchParams.set("flow_id", flow.id);
    url.searchParams.set("status", "published");
    url.searchParams.delete("attempt_id");
    window.history.pushState({}, "", url.toString());
  };

  const handleFlowDraftSaved = (flow: Flow) => {
    const url = new URL(window.location.href);
    url.searchParams.set("flow_id", flow.id);
    url.searchParams.set("status", "draft");
    url.searchParams.delete("attempt_id");
    window.history.pushState({}, "", url.toString());
  };

  const handleDeleteAutomation = async (
    flowId: string,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
    if (!confirm("Are you sure you want to delete this automation?")) return;

    try {
      const response = await fetch(`/api/automations/flows/${flowId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete. Status: ${response.status}`);
      }

      setFlows(flows.filter((f) => f.id !== flowId));
    } catch (err: any) {
      console.error("Error deleting automation:", err);
      setError(err.message);
    }
  };

  const generateAttemptId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Template handling
  const handleUseTemplate = (template: Template) => {
    // Create a new automation with template data
    const newAttemptId = generateAttemptId();
    const url = new URL(window.location.href);
    url.searchParams.set("attempt_id", newAttemptId);
    url.searchParams.set("template", template.id);
    window.history.pushState({}, "", url.toString());
  };

  // Handle database card click - show Apollo search
  const handleDatabaseClick = () => {
    setShowApolloSearch(true);
  };

  // Handle closing Apollo search
  const handleCloseApolloSearch = () => {
    setShowApolloSearch(false);
  };

  const filteredFlows = flows.filter((flow) =>
    flow.version.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

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
    };
    return icons[iconName] || Zap;
  };

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
              setShowPublishModal(false);
              handleBackToList();
            }}
            onViewFlow={() => {
              setShowPublishModal(false);
            }}
          />
        )}
      </>
    );
  }

  // Show Apollo Search if triggered
  if (showApolloSearch) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* Header with back button */}
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={handleCloseApolloSearch}
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800"
              >
                <ChevronRight className="rotate-180" size={20} />
                Back to Automations
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Database Search
              </h1>
              <p className="mt-2 text-neutral-600">
                Search and manage your database connections
              </p>
            </div>
          </div>

          {/* Apollo Search Component */}
          <ApolloSearchComponent />
        </div>
      </div>
    );
  }

  // Enhanced UI with your working backend
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Automations
              </h1>
              <p className="mt-2 text-neutral-600">
                Automate your CRM workflows to retain clients and generate leads
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAIAssistant(true)}
                className="text-slate hover:slate-400 flex items-center gap-2 rounded-lg border-neutral-500 bg-transparent px-4 py-2 text-sm font-medium transition-all"
              >
                <img
                  src="/apple-touch-icon.png"
                  alt="Company Logo"
                  className="h-5 w-5"
                />
                AI Assistant
              </button>
              <button
                onClick={handleCreateAutomation}
                className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                <Plus size={16} />
                Create Automation
              </button>
            </div>
          </div>

          {/* AI Search Bar */}
          <div className="relative mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={20}
              />
              <input
                type="text"
                placeholder="What would you like to automate? (example: 'Send welcome email to new leads')"
                className="border-1 w-full rounded-xl border-neutral-500 bg-white py-4 pl-12 pr-16 text-lg shadow-2 focus:border-slate-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  AI beta
                </span>
                <button className="p-2 text-neutral-400 hover:text-neutral-600">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8">
              {[
                { id: "overview", name: "Overview", icon: BarChart3 },
                { id: "templates", name: "Discover", icon: Layout },
                {
                  id: "my-automations",
                  name: "My Automations",
                  icon: Workflow,
                },
                { id: "analytics", name: "Analytics", icon: TrendingUp },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Start from Scratch */}
            <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-neutral-900">
                Start from scratch
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {[
                  {
                    name: "Automation",
                    desc: "Automated workflows",
                    icon: Zap,
                    color: "slate",
                    onClick: handleCreateAutomation,
                  },
                  {
                    name: "Search",
                    desc: "Search for Leads",
                    icon: Search,
                    color: "red",
                    onClick: handleDatabaseClick, // Updated to use the new handler
                  },
                  {
                    name: "Interface",
                    desc: "Apps, forms, and pages",
                    icon: Layout,
                    color: "slate",
                    onClick: handleCreateAutomation,
                  },
                  {
                    name: "Chatbot",
                    desc: "AI-powered chatbot",
                    icon: Bot,
                    color: "slate",
                    onClick: handleCreateAutomation,
                  },
                  {
                    name: "Canvas",
                    desc: "Process visualization",
                    icon: PenTool,
                    color: "slate",
                    onClick: handleCreateAutomation,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={item.onClick}
                      className="group rounded-lg border-2 border-neutral-200 p-6 text-left transition-colors hover:border-neutral-300"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
                        <Icon className="h-5 w-5 text-slate-600" />
                      </div>
                      <h3 className="mb-1 font-medium text-neutral-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-neutral-600">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <InspirationSection
              handleCreateAutomation={handleCreateAutomation}
              handleUseTemplate={handleUseTemplate}
              setActiveTab={setActiveTab}
            />

            {/* Recent Activity using your real flows */}
            {flows.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Recently updated
                  </h2>
                  <button
                    onClick={() => setActiveTab("my-automations")}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {flows.slice(0, 3).map((flow) => (
                    <div
                      key={flow.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
                      onClick={() => handleEditAutomation(flow)}
                    >
                      <div className="flex items-center gap-4">
                        <Zap className="h-5 w-5 text-slate-500" />
                        <div>
                          <h3 className="font-medium text-neutral-900">
                            {flow.version.displayName}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            Updated{" "}
                            {formatDistanceToNow(new Date(flow.updated), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            flow.status === "ENABLED"
                              ? "bg-green-100 text-green-800"
                              : "bg-neutral-100 text-neutral-800"
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
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">
                  CRM Automation Templates
                </h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Browse all templates
                </button>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {[
                  { id: "all", name: "All Templates", icon: Star },
                  {
                    id: "Lead Generation",
                    name: "Lead Generation",
                    icon: UserPlus,
                  },
                  {
                    id: "Client Retention",
                    name: "Client Retention",
                    icon: Heart,
                  },
                ].map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.id}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedCategory === filter.id
                          ? "border border-blue-200 bg-blue-100 text-blue-700"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                      onClick={() => setSelectedCategory(filter.id)}
                    >
                      <Icon size={14} />
                      {filter.name}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => {
                  const Icon = getIconComponent(template.icon);
                  return (
                    <div
                      key={template.id}
                      className="rounded-lg border border-neutral-200 p-6 transition-shadow hover:shadow-md"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                            <Icon className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        {template.popular && (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            Popular
                          </span>
                        )}
                      </div>

                      <h3 className="mb-2 font-semibold text-neutral-900">
                        {template.name}
                      </h3>
                      <p className="mb-4 text-sm text-neutral-600">
                        {template.description}
                      </p>

                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {template.aiPowered && (
                            <div className="flex items-center gap-1">
                              <img
                                src="/apple-touch-icon.png"
                                alt="Company Logo"
                                className="h-3 w-3"
                              />
                              <span className="text-xs font-medium text-slate-600">
                                AI
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-neutral-500">
                            {template.estimatedTime}
                          </span>
                        </div>
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Use template
                        </button>
                      </div>

                      <div className="border-t border-neutral-100 pt-3">
                        <p className="text-xs text-neutral-600">
                          {template.useCase}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* My Automations Tab - Your existing list with enhanced styling */}
        {activeTab === "my-automations" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Your Automations
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="Search automations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-lg border border-neutral-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                </div>
              ) : error ? (
                <div className="py-20 text-center text-red-500">
                  Error: {error}
                </div>
              ) : flows.length === 0 ? (
                <div className="py-20 text-center">
                  <Zap size={40} className="mx-auto mb-3 text-neutral-300" />
                  <h3 className="mb-1 font-semibold text-neutral-700">
                    No Automations Found
                  </h3>
                  <p className="mb-4 text-sm text-neutral-500">
                    Get started by creating your first workflow.
                  </p>
                  <button
                    onClick={handleCreateAutomation}
                    className="mx-auto flex items-center gap-2 rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
                  >
                    <Plus size={16} />
                    Create Automation
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {filteredFlows.map((flow) => (
                    <div
                      key={flow.id}
                      className="p-6 transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex flex-grow cursor-pointer items-center gap-4"
                          onClick={() => handleEditAutomation(flow)}
                        >
                          <div
                            className={`h-3 w-3 rounded-full ${
                              flow.status === "ENABLED"
                                ? "bg-green-500"
                                : "bg-neutral-400"
                            }`}
                          />
                          <div>
                            <h3 className="font-medium text-neutral-900">
                              {flow.version.displayName}
                            </h3>
                            <p className="mt-1 text-sm text-neutral-600">
                              Updated{" "}
                              {formatDistanceToNow(new Date(flow.updated), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              flow.status === "ENABLED"
                                ? "bg-green-100 text-green-800"
                                : "bg-neutral-100 text-neutral-800"
                            }`}
                          >
                            {flow.status === "ENABLED" ? "Published" : "Draft"}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditAutomation(flow)}
                              className="p-2 text-neutral-400 hover:text-neutral-600"
                            >
                              <Settings size={16} />
                            </button>
                            <button
                              onClick={(e) =>
                                handleDeleteAutomation(flow.id, e)
                              }
                              className="p-2 text-neutral-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => handleEditAutomation(flow)}
                              className="p-2 text-neutral-400 hover:text-neutral-600"
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                  Performance Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Total Automations</span>
                    <span className="font-semibold">{flows.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Active Automations</span>
                    <span className="font-semibold text-green-600">
                      {flows.filter((f) => f.status === "ENABLED").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Draft Automations</span>
                    <span className="font-semibold text-slate-600">
                      {flows.filter((f) => f.status === "DISABLED").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">
                      Available Templates
                    </span>
                    <span className="font-semibold text-blue-600">
                      {templates.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                  Recent Automations
                </h3>
                <div className="space-y-3">
                  {flows.slice(0, 5).map((flow, index) => (
                    <div key={flow.id} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">
                          {flow.version.displayName}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {formatDistanceToNow(new Date(flow.updated), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            flow.status === "ENABLED"
                              ? "text-green-600"
                              : "text-neutral-600"
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
            <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
              <div className="border-b border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                      <img
                        src="/apple-touch-icon.png"
                        alt="Company Logo"
                        className="h-5 w-5"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900">
                        Automation Assistant
                      </h2>
                      <p className="text-sm text-neutral-600">
                        Describe what you want to automate
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIAssistant(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-whitep-4 rounded-lg">
                    <p className="mb-2 text-sm text-neutral-600">Try asking:</p>
                    <div className="space-y-2">
                      <button className="block w-full rounded-lg bg-white p-3 text-left transition-colors hover:bg-neutral-50">
                        <span className="text-sm">
                          "Send a welcome email when someone fills out my
                          contact form"
                        </span>
                      </button>
                      <button className="block w-full rounded-lg bg-white p-3 text-left transition-colors hover:bg-neutral-50">
                        <span className="text-sm">
                          "Remind me to follow up with clients after 30 days"
                        </span>
                      </button>
                      <button className="block w-full rounded-lg bg-white p-3 text-left transition-colors hover:bg-neutral-50">
                        <span className="text-sm">
                          "Create a task when a lead score reaches 80"
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      placeholder="Describe your automation idea in plain English..."
                      className="h-32 w-full resize-none rounded-lg border border-neutral-300 p-4 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                    <button className="absolute bottom-3 right-3 rounded-lg bg-neutral-800 p-2 text-white transition-all hover:from-slate-700 hover:to-blue-700">
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
  );
}

// Keep your existing PublishSuccessModal component
function PublishSuccessModal({
  flow,
  onClose,
  onViewFlow,
}: {
  flow: Flow;
  onClose: () => void;
  onViewFlow: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600"
        >
          <X size={20} />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-neutral-900">
          Automation Published!
        </h3>

        <p className="mb-6 text-neutral-600">
          Your automation "{flow.version.displayName}" is now live and ready to
          run.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-neutral-700 hover:bg-neutral-50"
          >
            Back to Automations
          </button>
          <button
            onClick={onViewFlow}
            className="flex-1 rounded-lg bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-700"
          >
            Continue Editing
          </button>
        </div>

        {flow.version.trigger.type === "WEBHOOK" && (
          <div className="mt-4 rounded-lg bg-neutral-50 p-3">
            <p className="mb-1 text-sm font-medium text-neutral-700">
              Webhook URL:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-neutral-200 px-2 py-1 text-xs text-neutral-800">
                {`${window.location.origin}/webhook/${flow.id}`}
              </code>
              <button className="text-neutral-600 hover:text-neutral-800">
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
