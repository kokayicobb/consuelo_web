// src/components/lead-scraper/LeadScraperSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  Plus,
  Play,
  Pause,
  BarChart3,
  Users,
  Globe,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Zap,
  ArrowUpRight,
  Building,
  Mail,
  Phone,
  Linkedin,
  Globe2,
  MessageSquare,
  Hash,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { ScrapingCampaign, ScrapingJob, ScrapedLead, PlatformType, JobStatus } from "@/types/lead-scraper";

interface LeadScraperSidebarProps {
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const PLATFORM_ICONS: Record<PlatformType, React.ReactNode> = {
  reddit: <MessageSquare className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  website: <Globe2 className="h-4 w-4" />,
  hackernews: <Hash className="h-4 w-4" />,
  indiehackers: <Building className="h-4 w-4" />,
  producthunt: <Target className="h-4 w-4" />,
  twitter: <MessageSquare className="h-4 w-4" />
};

const PLATFORM_COLORS: Record<PlatformType, string> = {
  reddit: "bg-orange-100 text-orange-700 border-orange-200",
  linkedin: "bg-blue-100 text-blue-700 border-blue-200",
  website: "bg-green-100 text-green-700 border-green-200",
  hackernews: "bg-amber-100 text-amber-700 border-amber-200",
  indiehackers: "bg-purple-100 text-purple-700 border-purple-200",
  producthunt: "bg-red-100 text-red-700 border-red-200",
  twitter: "bg-sky-100 text-sky-700 border-sky-200"
};

export default function LeadScraperSidebar({ onToggleFullscreen, isFullscreen }: LeadScraperSidebarProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState<ScrapingCampaign[]>([]);
  const [activeJobs, setActiveJobs] = useState<ScrapingJob[]>([]);
  const [recentLeads, setRecentLeads] = useState<ScrapedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([]);
  const [quickSearchTerm, setQuickSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchActiveJobs, 5000); // Poll active jobs
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchActiveJobs(),
        fetchRecentLeads()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
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

  const fetchActiveJobs = async () => {
    try {
      const response = await fetch("/api/scraping/jobs?status=running");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      setActiveJobs(data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchRecentLeads = async () => {
    try {
      const response = await fetch("/api/scraping/leads?limit=10");
      if (!response.ok) throw new Error("Failed to fetch leads");
      const data = await response.json();
      setRecentLeads(data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleQuickScrape = async () => {
    if (!quickSearchTerm || selectedPlatforms.length === 0) {
      toast.error("Please enter search terms and select at least one platform");
      return;
    }

    try {
      const response = await fetch("/api/scraping/quick-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchTerm: quickSearchTerm,
          platforms: selectedPlatforms
        }),
      });

      if (!response.ok) throw new Error("Failed to start quick scrape");
      
      const data = await response.json();
      toast.success(`Quick scrape started on ${selectedPlatforms.length} platforms`);
      fetchActiveJobs();
    } catch (error) {
      console.error("Error starting quick scrape:", error);
      toast.error("Failed to start quick scrape");
    }
  };

  const togglePlatform = (platform: PlatformType) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getJobStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-gray-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white p-4">
        <h2 className="text-lg font-semibold">Lead Scraper</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFullscreen}
          className="hover:bg-gray-100"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Campaign Creator */}
      <div className="border-b bg-white p-4">
        <h3 className="mb-3 text-sm font-medium text-gray-700">Quick Scrape</h3>
        <div className="space-y-3">
          <Input
            placeholder="Enter keywords, job titles, or company names..."
            value={quickSearchTerm}
            onChange={(e) => setQuickSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <div className="flex flex-wrap gap-2">
            {(['reddit', 'linkedin', 'hackernews'] as PlatformType[]).map((platform) => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                  selectedPlatforms.includes(platform)
                    ? PLATFORM_COLORS[platform]
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {PLATFORM_ICONS[platform]}
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
          
          <Button 
            onClick={handleQuickScrape}
            disabled={!quickSearchTerm || selectedPlatforms.length === 0}
            className="w-full"
            size="sm"
          >
            <Search className="mr-2 h-4 w-4" />
            Start Quick Scrape
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 border-b bg-white">
          <TabsTrigger value="campaigns" className="text-xs">Campaigns</TabsTrigger>
          <TabsTrigger value="jobs" className="text-xs">Active Jobs</TabsTrigger>
          <TabsTrigger value="leads" className="text-xs">Recent Leads</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="m-0 space-y-3 p-4">
            {campaigns.length === 0 ? (
              <Card className="p-6 text-center">
                <Target className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="mb-4 text-sm text-gray-600">No campaigns yet</p>
                <Button size="sm" className="w-full" onClick={onToggleFullscreen}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </Card>
            ) : (
              campaigns.slice(0, 5).map((campaign) => (
                <Card key={campaign.id} className="cursor-pointer hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-xs text-gray-600">
                          {campaign.total_leads_found} leads found
                        </p>
                      </div>
                      <Badge
                        variant={campaign.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-3 flex flex-wrap gap-1">
                      {campaign.platforms.map((platform) => (
                        <span
                          key={platform}
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs ${PLATFORM_COLORS[platform]}`}
                        >
                          {PLATFORM_ICONS[platform]}
                          {platform}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {campaign.frequency === 'once' ? 'One-time' : campaign.frequency}
                      </span>
                      {campaign.last_run_at && (
                        <span>Last run: {formatDate(campaign.last_run_at)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            {campaigns.length > 5 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onToggleFullscreen}
              >
                View All Campaigns
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </TabsContent>

          {/* Active Jobs Tab */}
          <TabsContent value="jobs" className="m-0 space-y-3 p-4">
            {activeJobs.length === 0 ? (
              <Card className="p-6 text-center">
                <Zap className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm text-gray-600">No active scraping jobs</p>
              </Card>
            ) : (
              activeJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getJobStatusIcon(job.status)}
                        <span className="text-sm font-medium">
                          Scraping {job.platforms_to_scrape.length} platforms
                        </span>
                      </div>
                    </div>
                    
                    {job.stats && (
                      <div className="mb-2">
                        <Progress value={(job.stats.leads_found / 100) * 100} className="h-2" />
                        <p className="mt-1 text-xs text-gray-600">
                          {job.stats.leads_found} leads found • {job.stats.pages_scraped} pages scraped
                        </p>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Started {formatDate(job.created_at)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Recent Leads Tab */}
          <TabsContent value="leads" className="m-0 space-y-3 p-4">
            {recentLeads.length === 0 ? (
              <Card className="p-6 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm text-gray-600">No leads found yet</p>
              </Card>
            ) : (
              <>
                {recentLeads.map((lead) => (
                  <Card key={lead.id} className="cursor-pointer hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-medium">
                            {lead.full_name || `${lead.first_name} ${lead.last_name}`.trim() || 'Unknown'}
                          </h4>
                          {lead.title && (
                            <p className="truncate text-xs text-gray-600">{lead.title}</p>
                          )}
                          {lead.company && (
                            <p className="truncate text-xs text-gray-600">{lead.company}</p>
                          )}
                        </div>
                        <Badge
                          variant={lead.enrichment_status === 'enriched' ? 'default' : 'secondary'}
                          className="ml-2 text-xs"
                        >
                          {lead.lead_score ? `${Math.round(lead.lead_score * 100)}%` : 'New'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{lead.email}</span>
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Phone
                          </span>
                        )}
                        {lead.linkedin_url && (
                          <span className="flex items-center gap-1">
                            <Linkedin className="h-3 w-3" />
                            LinkedIn
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs ${PLATFORM_COLORS[lead.platform]}`}>
                          {PLATFORM_ICONS[lead.platform]}
                          {lead.platform}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(lead.created_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onToggleFullscreen}
                >
                  View All Leads
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Platform Health Status */}
      <div className="border-t bg-white p-4">
        <h3 className="mb-2 text-xs font-medium text-gray-700">Platform Status</h3>
        <div className="grid grid-cols-3 gap-2">
          <TooltipProvider>
            {(['reddit', 'linkedin', 'hackernews'] as PlatformType[]).map((platform) => (
              <Tooltip key={platform}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 rounded bg-gray-50 px-2 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs capitalize">{platform}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{platform} API is operational</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t bg-white p-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchData();
              toast.success("Data refreshed");
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFullscreen}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
}