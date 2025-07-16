"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import {
  ArrowLeft,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Zap,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/Playground/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import type {
  ScrapingCampaign,
  ScrapingJob,
  ScrapedLead,
  PlatformType,
  CreateCampaignRequest,
} from "@/types/lead-scraper"
import { CreateCampaignDialog } from "./CreateCampaignDialog"

interface LeadScraperDashboardProps {
  onClose: () => void
}

const PLATFORM_OPTIONS: { value: PlatformType; label: string; description: string }[] = [
  { value: "reddit", label: "Reddit", description: "Scrape posts and comments from subreddits" },
  { value: "linkedin", label: "LinkedIn", description: "Extract company pages and executive profiles" },
  { value: "website", label: "Company Websites", description: "Crawl websites for contact information" },
  { value: "hackernews", label: "Hacker News", description: "Find tech discussions and startups" },
  { value: "indiehackers", label: "IndieHackers", description: "Discover bootstrapped founders" },
  { value: "producthunt", label: "Product Hunt", description: "Find new product launches" },
  { value: "twitter", label: "Twitter/X", description: "Monitor company mentions and threads" },
]

export default function LeadScraperDashboard({ onClose }: LeadScraperDashboardProps) {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState("overview")
  const [campaigns, setCampaigns] = useState<ScrapingCampaign[]>([])
  const [leads, setLeads] = useState<ScrapedLead[]>([])
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<ScrapingCampaign | null>(null)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  // Filters
  const [leadFilters, setLeadFilters] = useState({
    platform: "all",
    status: "all",
    enrichment: "all",
    dateRange: "7d",
  })

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    leadsOverTime: [] as any[],
    platformDistribution: [] as any[],
    conversionRate: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    enrichedLeads: 0,
    creditsUsed: 0,
    creditsRemaining: 0,
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchCampaigns(), fetchLeads(), fetchJobs(), fetchAnalytics()])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/scraping/campaigns")
      if (!response.ok) throw new Error("Failed to fetch campaigns")
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    }
  }

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams()
      if (leadFilters.platform !== "all") params.append("platform", leadFilters.platform)
      if (leadFilters.status !== "all") params.append("status", leadFilters.status)
      if (leadFilters.enrichment !== "all") params.append("enrichment_status", leadFilters.enrichment)
      params.append("date_range", leadFilters.dateRange)

      const response = await fetch(`/api/scraping/leads?${params}`)
      if (!response.ok) throw new Error("Failed to fetch leads")
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error("Error fetching leads:", error)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/scraping/jobs")
      if (!response.ok) throw new Error("Failed to fetch jobs")
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/scraping/analytics")
      if (!response.ok) throw new Error("Failed to fetch analytics")
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  const handleCreateCampaign = async (campaignData: CreateCampaignRequest) => {
    try {
      const response = await fetch("/api/scraping/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) throw new Error("Failed to create campaign")
      const data = await response.json()

      toast.success("Campaign created successfully")
      setShowCreateCampaign(false)
      fetchCampaigns()

      // Optionally run the campaign immediately
      if (campaignData.frequency === "once") {
        runCampaign(data.campaign.id)
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast.error("Failed to create campaign")
    }
  }

  const runCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/scraping/campaigns/${campaignId}/run`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to run campaign")
      toast.success("Campaign started successfully")
      fetchJobs()
    } catch (error) {
      console.error("Error running campaign:", error)
      toast.error("Failed to run campaign")
    }
  }

  const pauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/scraping/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      })
      if (!response.ok) throw new Error("Failed to pause campaign")
      toast.success("Campaign paused")
      fetchCampaigns()
    } catch (error) {
      console.error("Error pausing campaign:", error)
      toast.error("Failed to pause campaign")
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/scraping/campaigns/${campaignId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete campaign")
      toast.success("Campaign deleted")
      fetchCampaigns()
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast.error("Failed to delete campaign")
    }
  }

  const enrichLeads = async (leadIds: string[]) => {
    try {
      const response = await fetch("/api/scraping/leads/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: leadIds }),
      })
      if (!response.ok) throw new Error("Failed to enrich leads")
      toast.success(`Enriching ${leadIds.length} leads with Apollo`)
      fetchLeads()
    } catch (error) {
      console.error("Error enriching leads:", error)
      toast.error("Failed to enrich leads")
    }
  }

  const exportLeads = async (format: "csv" | "json") => {
    try {
      const params = new URLSearchParams()
      params.append("format", format)
      if (selectedLeads.length > 0) {
        params.append("ids", selectedLeads.join(","))
      }

      const response = await fetch(`/api/scraping/leads/export?${params}`)
      if (!response.ok) throw new Error("Failed to export leads")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `leads-${new Date().toISOString().split("T")[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Exported ${selectedLeads.length || "all"} leads`)
    } catch (error) {
      console.error("Error exporting leads:", error)
      toast.error("Failed to export leads")
    }
  }

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    toast.success("Email copied to clipboard")
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-gray-50">
        <div className="flex items-center justify-between border-b bg-white p-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="flex-1 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Lead Generation Platform</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchAllData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreateCampaign(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b bg-white px-6">
            <TabsList className="h-12 bg-transparent p-0">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2">
                Overview
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="data-[state=active]:border-b-2">
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="leads" className="data-[state=active]:border-b-2">
                Leads
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:border-b-2">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:border-b-2">
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.totalLeads}</div>
                    <p className="text-xs text-muted-foreground">
                      <TrendingUp className="mr-1 inline h-3 w-3 text-green-600" />
                      +12% from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.qualifiedLeads}</div>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData.totalLeads > 0
                        ? `${Math.round((analyticsData.qualifiedLeads / analyticsData.totalLeads) * 100)}% qualification rate`
                        : "No leads yet"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Enriched Leads</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.enrichedLeads}</div>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData.totalLeads > 0
                        ? `${Math.round((analyticsData.enrichedLeads / analyticsData.totalLeads) * 100)}% enriched`
                        : "No enrichment yet"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{campaigns.filter((c) => c.status === "active").length}</div>
                    <p className="text-xs text-muted-foreground">{campaigns.length} total campaigns</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.creditsRemaining}</div>
                    <p className="text-xs text-muted-foreground">{analyticsData.creditsUsed} used</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Jobs</CardTitle>
                    <CardDescription>Latest scraping activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {jobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                job.status === "completed"
                                  ? "bg-green-500"
                                  : job.status === "running"
                                    ? "bg-blue-500"
                                    : job.status === "failed"
                                      ? "bg-red-500"
                                      : "bg-gray-500"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium">{job.campaign_name}</p>
                              <p className="text-xs text-muted-foreground">{job.leads_found} leads found</p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              job.status === "completed"
                                ? "default"
                                : job.status === "running"
                                  ? "secondary"
                                  : job.status === "failed"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Distribution</CardTitle>
                    <CardDescription>Leads by platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.platformDistribution.map((platform) => (
                        <div key={platform.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded bg-blue-500" />
                            <span className="text-sm font-medium">{platform.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{platform.count}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(platform.count / analyticsData.totalLeads) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="mt-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Scraping Campaigns</h2>
                <Button onClick={() => setShowCreateCampaign(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </div>

              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {campaign.name}
                            <Badge
                              variant={
                                campaign.status === "active"
                                  ? "default"
                                  : campaign.status === "paused"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{campaign.description}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => runCampaign(campaign.id)}>
                              <Play className="mr-2 h-4 w-4" />
                              Run Now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => pauseCampaign(campaign.id)}>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteCampaign(campaign.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-sm font-medium">Platform</p>
                          <p className="text-sm text-muted-foreground capitalize">{campaign.platforms}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Frequency</p>
                          <p className="text-sm text-muted-foreground capitalize">{campaign.frequency}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Leads</p>
                          <p className="text-sm text-muted-foreground">{campaign.total_leads}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Last Run</p>
                          <p className="text-sm text-muted-foreground">
                            {campaign.last_run ? new Date(campaign.last_run).toLocaleDateString() : "Never"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Leads Tab */}
            <TabsContent value="leads" className="mt-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Generated Leads</h2>
                <div className="flex items-center gap-2">
                  {selectedLeads.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => enrichLeads(selectedLeads)}>
                        <Zap className="mr-2 h-4 w-4" />
                        Enrich Selected ({selectedLeads.length})
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => exportLeads("csv")}>Export as CSV</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportLeads("json")}>Export as JSON</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4 mb-6">
                <Select
                  value={leadFilters.platform}
                  onValueChange={(value) => setLeadFilters((prev) => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {PLATFORM_OPTIONS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={leadFilters.status}
                  onValueChange={(value) => setLeadFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={leadFilters.enrichment}
                  onValueChange={(value) => setLeadFilters((prev) => ({ ...prev, enrichment: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Enrichment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="enriched">Enriched</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={fetchLeads}>
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </div>

              {/* Leads Table */}
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLeads.length === leads.length && leads.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLeads(leads.map((lead) => lead.id))
                            } else {
                              setSelectedLeads([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Enrichment</TableHead>
                      <TableHead>Found</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLeads((prev) => [...prev, lead.id])
                              } else {
                                setSelectedLeads((prev) => prev.filter((id) => id !== lead.id))
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.full_name || "Unknown"}</p>
                            {(lead.email || lead.work_email) && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span
                                  className="cursor-pointer hover:text-blue-600"
                                  onClick={() => copyEmail(lead.email || lead.work_email)}
                                >
                                  {lead.email || lead.work_email}
                                </span>
                              </div>
                            )}
                            {(lead.phone || lead.mobile_phone) && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <span>{lead.phone || lead.mobile_phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.company || "Unknown"}</p>
                            {lead.title && <p className="text-sm text-muted-foreground">{lead.title}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {lead.platform}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              lead.status === "qualified"
                                ? "default"
                                : lead.status === "contacted"
                                  ? "secondary"
                                  : lead.status === "converted"
                                    ? "default"
                                    : "outline"
                            }
                          >
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {lead.enrichment_status === "enriched" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : lead.enrichment_status === "failed" ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            )}
                            <span className="text-sm capitalize">{lead.enrichment_status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => enrichLeads([lead.id])}>
                                <Zap className="mr-2 h-4 w-4" />
                                Enrich
                              </DropdownMenuItem>
                              {lead.source_url && (
                                <DropdownMenuItem asChild>
                                  <a href={lead.source_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Source
                                  </a>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-0">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Leads Over Time</CardTitle>
                    <CardDescription>Daily lead generation performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.leadsOverTime}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Performance</CardTitle>
                      <CardDescription>Leads by platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.platformDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Conversion Funnel</CardTitle>
                      <CardDescription>Lead qualification pipeline</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Total Leads</span>
                          <span className="font-medium">{analyticsData.totalLeads}</span>
                        </div>
                        <Progress value={100} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span>Qualified</span>
                          <span className="font-medium">{analyticsData.qualifiedLeads}</span>
                        </div>
                        <Progress
                          value={
                            analyticsData.totalLeads > 0
                              ? (analyticsData.qualifiedLeads / analyticsData.totalLeads) * 100
                              : 0
                          }
                          className="h-2"
                        />

                        <div className="flex items-center justify-between">
                          <span>Enriched</span>
                          <span className="font-medium">{analyticsData.enrichedLeads}</span>
                        </div>
                        <Progress
                          value={
                            analyticsData.totalLeads > 0
                              ? (analyticsData.enrichedLeads / analyticsData.totalLeads) * 100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-0">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Configuration</CardTitle>
                    <CardDescription>Configure external API integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="apollo-key">Apollo API Key</Label>
                      <Input id="apollo-key" type="password" placeholder="Enter your Apollo API key" className="mt-1" />
                      <p className="text-sm text-muted-foreground mt-1">
                        Used for lead enrichment and contact discovery
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input id="webhook-url" placeholder="https://your-app.com/webhook" className="mt-1" />
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive notifications when campaigns complete
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scraping Limits</CardTitle>
                    <CardDescription>Configure rate limits and quotas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="daily-limit">Daily Scraping Limit</Label>
                      <Input id="daily-limit" type="number" defaultValue="1000" className="mt-1" />
                    </div>

                    <div>
                      <Label htmlFor="rate-limit">Requests per Minute</Label>
                      <Input id="rate-limit" type="number" defaultValue="60" className="mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Create Campaign Dialog */}
      <CreateCampaignDialog
        open={showCreateCampaign}
        onOpenChange={setShowCreateCampaign}
        onSubmit={handleCreateCampaign}
      />
    </div>
  )
}
