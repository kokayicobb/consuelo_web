// src/components/lead-scraper/LeadScraperDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  Calendar,
  Clock,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Zap,
  Globe,
  Mail,
  Phone,
  Linkedin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Copy,
  FileText,
  Database,
  Webhook
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from "recharts";
import type { 
  ScrapingCampaign, 
  ScrapingJob, 
  ScrapedLead, 
  PlatformType,
  CreateCampaignRequest,
  CampaignFrequency
} from "@/types/lead-scraper";
import { Checkbox } from "@/components/Playground/components/ui/checkbox";

interface LeadScraperDashboardProps {
  onClose: () => void;
}

const PLATFORM_OPTIONS: { value: PlatformType; label: string; description: string }[] = [
  { value: 'reddit', label: 'Reddit', description: 'Scrape posts and comments from subreddits' },
  { value: 'linkedin', label: 'LinkedIn', description: 'Extract company pages and executive profiles' },
  { value: 'website', label: 'Company Websites', description: 'Crawl websites for contact information' },
  { value: 'hackernews', label: 'Hacker News', description: 'Find tech discussions and startups' },
  { value: 'indiehackers', label: 'IndieHackers', description: 'Discover bootstrapped founders' },
  { value: 'producthunt', label: 'Product Hunt', description: 'Find new product launches' },
  { value: 'twitter', label: 'Twitter/X', description: 'Monitor company mentions and threads' }
];

export default function LeadScraperDashboard({ onClose }: LeadScraperDashboardProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [campaigns, setCampaigns] = useState<ScrapingCampaign[]>([]);
  const [leads, setLeads] = useState<ScrapedLead[]>([]);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<ScrapingCampaign | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  // Filters
  const [leadFilters, setLeadFilters] = useState({
    platform: 'all',
    status: 'all',
    enrichment: 'all',
    dateRange: '7d'
  });

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    leadsOverTime: [] as any[],
    platformDistribution: [] as any[],
    conversionRate: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    enrichedLeads: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchLeads(),
        fetchJobs(),
        fetchAnalytics()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/scraping/campaigns");
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (leadFilters.platform !== 'all') params.append('platform', leadFilters.platform);
      if (leadFilters.status !== 'all') params.append('status', leadFilters.status);
      if (leadFilters.enrichment !== 'all') params.append('enrichment_status', leadFilters.enrichment);
      params.append('date_range', leadFilters.dateRange);
      
      const response = await fetch(`/api/scraping/leads?${params}`);
      if (!response.ok) throw new Error("Failed to fetch leads");
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/scraping/jobs");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/scraping/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  // In your lead-scraper-dashboard.tsx file

const handleCreateCampaign = async (campaignData: CreateCampaignRequest) => {
  console.log("🚀 Starting campaign creation...");
  console.log("📍 Current URL:", window.location.href);
  console.log("📍 Origin:", window.location.origin);
  
  const apiPath = "/api/scraping/campaigns";
  const fullUrl = `${window.location.origin}${apiPath}`;
  
  console.log("🎯 Calling API:", fullUrl);
  console.log("📋 Sending data:", JSON.stringify(campaignData, null, 2));

  try {
    // First test if the endpoint exists with a simple GET
    console.log("🔍 Testing GET endpoint first...");
    const testResponse = await fetch(apiPath, { 
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log("🔍 GET test status:", testResponse.status);
    console.log("🔍 GET test headers:", Object.fromEntries(testResponse.headers.entries()));
    
    if (testResponse.status === 404) {
      console.error("❌ API endpoint not found! Route doesn't exist.");
      toast.error("API endpoint not found. Check your route files.");
      return;
    }

    // Now try the actual POST
    console.log("📡 Making POST request...");
    const response = await fetch(apiPath, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(campaignData)
    });

    console.log("📡 POST Response status:", response.status);
    console.log("📡 POST Response headers:", Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get("content-type");
    console.log("📡 Content-Type:", contentType);
    
    // Get the raw response text first
    const responseText = await response.text();
    console.log("📡 Raw response (first 1000 chars):", responseText.substring(0, 1000));
    
    // Check if it's HTML (404 page)
    if (responseText.startsWith('<!DOCTYPE')) {
      console.error("❌ Received HTML instead of JSON - this is a 404 page!");
      console.error("❌ Full HTML response:", responseText);
      toast.error("API route not found. This shouldn't happen since GET worked.");
      return;
    }
    
    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse response as JSON:", parseError);
      console.error("❌ Response text:", responseText);
      toast.error("Invalid response from server");
      return;
    }

    if (!response.ok) {
      console.error("❌ API returned an error:", result);
      const errorMessage = result.details || result.error || "Failed to create campaign";
      throw new Error(errorMessage);
    }
    
    console.log("✅ Campaign created successfully:", result);
    toast.success("Campaign created successfully");
    setShowCreateCampaign(false);
    fetchCampaigns();
    
    if (campaignData.frequency === 'once' && result.campaign) {
      runCampaign(result.campaign.id);
    }

  } catch (error: any) {
    console.error("💥 Final error caught:", error);
    console.error("💥 Error stack:", error.stack);
    toast.error(`Error: ${error.message}`);
  }
};

  const runCampaign = async (campaignId: string) => {
  console.log("🎯 Running campaign:", campaignId);
  
  try {
    const response = await fetch(`/api/scraping/campaigns/${campaignId}/run`, {
      method: "POST"
    });

    console.log("🎯 Run campaign response status:", response.status);
    console.log("🎯 Run campaign response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Run campaign failed:", errorText);
      throw new Error("Failed to run campaign");
    }
    
    const result = await response.json();
    console.log("✅ Campaign run result:", result);
    
    toast.success("Campaign started successfully");
    fetchJobs(); // Make sure this function exists and works
    
    // Let's also check the job status after a few seconds
    setTimeout(async () => {
      console.log("🔍 Checking job status after 5 seconds...");
      try {
        const jobsResponse = await fetch("/api/scraping/jobs");
        const jobsData = await jobsResponse.json();
        console.log("📋 Current jobs:", jobsData);
      } catch (error) {
        console.error("❌ Error checking jobs:", error);
      }
    }, 5000);
    
  } catch (error) {
    console.error("❌ Error running campaign:", error);
    toast.error("Failed to run campaign");
  }
};

  const pauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/scraping/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'paused' })
      });

      if (!response.ok) throw new Error("Failed to pause campaign");
      
      toast.success("Campaign paused");
      fetchCampaigns();
    } catch (error) {
      console.error("Error pausing campaign:", error);
      toast.error("Failed to pause campaign");
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/scraping/campaigns/${campaignId}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete campaign");
      
      toast.success("Campaign deleted");
      fetchCampaigns();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Failed to delete campaign");
    }
  };

  const enrichLeads = async (leadIds: string[]) => {
    try {
      const response = await fetch("/api/scraping/leads/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: leadIds })
      });

      if (!response.ok) throw new Error("Failed to enrich leads");
      
      toast.success(`Enriching ${leadIds.length} leads with Apollo`);
      fetchLeads();
    } catch (error) {
      console.error("Error enriching leads:", error);
      toast.error("Failed to enrich leads");
    }
  };

  const exportLeads = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (selectedLeads.length > 0) {
        params.append('ids', selectedLeads.join(','));
      }

      const response = await fetch(`/api/scraping/leads/export?${params}`);
      if (!response.ok) throw new Error("Failed to export leads");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Exported ${selectedLeads.length || 'all'} leads`);
    } catch (error) {
      console.error("Error exporting leads:", error);
      toast.error("Failed to export leads");
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard");
  };

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
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Lead Generation Platform</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateCampaign(true)}
          >
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
                      {Math.round((analyticsData.qualifiedLeads / analyticsData.totalLeads) * 100)}% qualification rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Enriched Contacts</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsData.enrichedLeads}</div>
                    <p className="text-xs text-muted-foreground">
                      With complete contact info
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaigns.filter(c => c.status === 'active').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Running automated scrapes
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Scraping Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {jobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {job.status === 'running' ? (
                              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                            ) : job.status === 'completed' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {job.platforms_to_scrape.join(', ')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {job.stats?.leads_found || 0} leads found
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(job.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Campaigns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {campaigns
                        .sort((a, b) => b.total_leads_found - a.total_leads_found)
                        .slice(0, 5)
                        .map((campaign) => (
                          <div key={campaign.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{campaign.name}</p>
                              <p className="text-xs text-gray-500">
                                {campaign.platforms.join(', ')}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {campaign.total_leads_found} leads
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">All Campaigns</h2>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search campaigns..."
                    className="w-64"
                  />
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Platforms</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Leads Found</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {campaign.platforms.map((platform) => (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={campaign.status === 'active' ? 'default' : 'secondary'}
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{campaign.frequency}</TableCell>
                        <TableCell>{campaign.total_leads_found}</TableCell>
                        <TableCell>
                          {campaign.last_run_at
                            ? new Date(campaign.last_run_at).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
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
                              <DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {campaign.status === 'active' ? (
                                <DropdownMenuItem onClick={() => pauseCampaign(campaign.id)}>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => runCampaign(campaign.id)}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Resume
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteCampaign(campaign.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Leads Tab */}
            <TabsContent value="leads" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">All Leads</h2>
                <div className="flex items-center gap-2">
                  <Select
                    value={leadFilters.platform}
                    onValueChange={(value) => setLeadFilters({ ...leadFilters, platform: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {PLATFORM_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={leadFilters.status}
                    onValueChange={(value) => setLeadFilters({ ...leadFilters, status: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="nurturing">Nurturing</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => enrichLeads(selectedLeads)}
                    disabled={selectedLeads.length === 0}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Enrich ({selectedLeads.length})
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => exportLeads('csv')}>
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportLeads('json')}>
                        Export as JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLeads.length === leads.length && leads.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLeads(leads.map(l => l.id));
                            } else {
                              setSelectedLeads([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
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
                                setSelectedLeads([...selectedLeads, lead.id]);
                              } else {
                                setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.full_name || `${lead.first_name} ${lead.last_name}`.trim() || 'Unknown'}
                        </TableCell>
                        <TableCell>{lead.title || '-'}</TableCell>
                        <TableCell>{lead.company || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {lead.email && (
                              <button
                                onClick={() => copyEmail(lead.email!)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Mail className="h-4 w-4" />
                              </button>
                            )}
                            {lead.phone && <Phone className="h-4 w-4 text-gray-400" />}
                            {lead.linkedin_url && (
                              <a
                                href={lead.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {lead.platform}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.lead_score ? (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500"
                                  style={{ width: `${lead.lead_score * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">
                                {Math.round(lead.lead_score * 100)}%
                              </span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={lead.enrichment_status === 'enriched' ? 'default' : 'secondary'}
                          >
                            {lead.status}
                          </Badge>
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
                                <Database className="mr-2 h-4 w-4" />
                                Enrich Contact
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Source
                              </DropdownMenuItem>
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
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Leads Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.leadsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="leads" stroke="#3b82f6" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.platformDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="platform" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>API Configurations</CardTitle>
                    <CardDescription>
                      Configure your platform API keys and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Firecrawl API Key</Label>
                      <Input type="password" placeholder="fc-••••••••••••••••" />
                    </div>
                    <div>
                      <Label>Apollo API Key</Label>
                      <Input type="password" placeholder="••••••••••••••••" />
                    </div>
                    <Button>Save API Keys</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Webhook Configuration</CardTitle>
                    <CardDescription>
                      Set up webhooks to receive real-time updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Webhook URL</Label>
                      <Input placeholder="https://your-domain.com/webhook" />
                    </div>
                    <div className="space-y-2">
                      <Label>Events</Label>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Checkbox /> Lead Created
                        </Label>
                        <Label className="flex items-center gap-2">
                          <Checkbox /> Campaign Completed
                        </Label>
                        <Label className="flex items-center gap-2">
                          <Checkbox /> Enrichment Completed
                        </Label>
                      </div>
                    </div>
                    <Button>Save Webhook</Button>
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
  );
}

// Create Campaign Dialog Component
function CreateCampaignDialog({
  open,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCampaignRequest) => void;
}) {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState<Partial<CreateCampaignRequest>>({
    name: '',
    description: '',
    platforms: [],
    platformConfigs: {},
    keywords: [],
    targetCriteria: {
      job_titles: [],
      industries: [],
      company_sizes: [],
      locations: []
    },
    frequency: 'once'
  });

  const handleSubmit = () => {
    if (!campaignData.name || !campaignData.platforms?.length) {
      toast.error("Please provide a campaign name and select at least one platform");
      return;
    }
    onSubmit(campaignData as CreateCampaignRequest);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up automated lead scraping across multiple platforms
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Campaign Name</Label>
              <Input
                value={campaignData.name}
                onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                placeholder="e.g., FinTech Startups Q1 2024"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={campaignData.description}
                onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                placeholder="Describe the goals and targets for this campaign..."
                rows={3}
              />
            </div>

            <div>
              <Label>Select Platforms</Label>
              <div className="mt-2 space-y-2">
                {PLATFORM_OPTIONS.map((platform) => (
                  <Label
                    key={platform.value}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={campaignData.platforms?.includes(platform.value) || false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCampaignData({
                            ...campaignData,
                            platforms: [...(campaignData.platforms || []), platform.value]
                          });
                        } else {
                          setCampaignData({
                            ...campaignData,
                            platforms: campaignData.platforms?.filter(p => p !== platform.value) || []
                          });
                        }
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{platform.label}</div>
                      <div className="text-sm text-gray-600">{platform.description}</div>
                    </div>
                  </Label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-medium">Platform Configuration</h3>
            
            {campaignData.platforms?.includes('reddit') && (
              <div>
                <Label>Reddit Settings</Label>
                <Input
                  placeholder="Subreddits (comma-separated): startups, entrepreneur, smallbusiness"
                  onChange={(e) => {
                    setCampaignData({
                      ...campaignData,
                      platformConfigs: {
                        ...campaignData.platformConfigs,
                        reddit: { subreddits: e.target.value.split(',').map(s => s.trim()) }
                      }
                    });
                  }}
                />
              </div>
            )}

            {campaignData.platforms?.includes('website') && (
              <div>
                <Label>Company Websites</Label>
                <Textarea
                  placeholder="Enter website URLs, one per line:&#10;https://company1.com&#10;https://company2.com&#10;https://company3.com"
                  rows={4}
                  onChange={(e) => {
                    setCampaignData({
                      ...campaignData,
                      platformConfigs: {
                        ...campaignData.platformConfigs,
                        website: { 
                          website_urls: e.target.value
                            .split('\n')
                            .map(url => url.trim())
                            .filter(url => url.length > 0)
                        }
                      }
                    });
                  }}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Add company websites to scrape for contact information from team/about pages
                </p>
              </div>
            )}

            {campaignData.platforms?.includes('linkedin') && (
              <div>
                <Label>LinkedIn Search URL</Label>
                <Input
                  placeholder="Paste LinkedIn Sales Navigator search URL"
                  onChange={(e) => {
                    setCampaignData({
                      ...campaignData,
                      platformConfigs: {
                        ...campaignData.platformConfigs,
                        linkedin: { linkedin_search_url: e.target.value }
                      }
                    });
                  }}
                />
              </div>
            )}

            <div>
              <Label>Keywords</Label>
              <Textarea
                placeholder="Enter keywords, one per line"
                rows={3}
                onChange={(e) => {
                  setCampaignData({
                    ...campaignData,
                    keywords: e.target.value.split('\n').filter(k => k.trim())
                  });
                }}
              />
            </div>

            <div>
              <Label>Target Job Titles</Label>
              <Input
                placeholder="CEO, CTO, Founder, VP Sales (comma-separated)"
                onChange={(e) => {
                  setCampaignData({
                    ...campaignData,
                    targetCriteria: {
                      ...campaignData.targetCriteria,
                      job_titles: e.target.value.split(',').map(t => t.trim())
                    }
                  });
                }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-medium">Schedule & Automation</h3>
            
            <div>
              <Label>Frequency</Label>
              <Select
                value={campaignData.frequency}
                onValueChange={(value: CampaignFrequency) => 
                  setCampaignData({ ...campaignData, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {campaignData.frequency !== 'once' && (
              <div>
                <Label>Run Time</Label>
                <Input type="time" defaultValue="09:00" />
              </div>
            )}

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium mb-2">Campaign Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Name: {campaignData.name}</p>
                <p>Platforms: {campaignData.platforms?.join(', ')}</p>
                <p>Keywords: {campaignData.keywords?.length || 0}</p>
                <p>Frequency: {campaignData.frequency}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Create Campaign
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}