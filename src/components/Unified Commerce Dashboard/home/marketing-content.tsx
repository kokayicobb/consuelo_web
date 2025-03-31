"use client";

import React, { useState } from 'react';
import { 
  AreaChart,
  ArrowRight, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  PieChart,
  BarChart,
  Megaphone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  
  Youtube,
  Share2,
  DollarSign,
  Users,
  ShoppingBag,
  TrendingUp,
  Globe,
  Plus,
  FileSpreadsheet,
  Link2,
  TrendingDown,
  Percent,
  Clock,
  CalendarRange,
  AlertCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for marketing metrics
const marketingMetrics = [
  { 
    title: 'Marketing ROI',
    value: '387%',
    change: 14.5,
    trend: 'up',
    icon: <DollarSign className="h-4 w-4" />
  },
  { 
    title: 'Customer Acquisition Cost',
    value: '$28.75',
    change: -3.2,
    trend: 'down',
    icon: <Users className="h-4 w-4" />
  },
  { 
    title: 'Conversion Rate',
    value: '3.8%',
    change: 0.5,
    trend: 'up',
    icon: <ShoppingBag className="h-4 w-4" />
  },
  { 
    title: 'Website Traffic',
    value: '85.2K',
    change: 7.3,
    trend: 'up',
    icon: <Globe className="h-4 w-4" />
  },
];

// Mock data for campaigns
const campaigns = [
  {
    id: 'CAMP-2023-Q1',
    name: 'Spring Collection Launch',
    status: 'active',
    type: 'Multi-channel',
    budget: 12500,
    spent: 8750,
    roi: 425,
    conversions: 748,
    reach: 152000,
    startDate: 'Mar 1, 2025',
    endDate: 'Mar 31, 2025'
  },
  {
    id: 'CAMP-2023-EMAIL-03',
    name: 'VIP Customer Exclusive',
    status: 'active',
    type: 'Email',
    budget: 3500,
    spent: 2800,
    roi: 315,
    conversions: 215,
    reach: 18500,
    startDate: 'Mar 15, 2025',
    endDate: 'Mar 30, 2025'
  },
  {
    id: 'CAMP-2023-SOCIAL-04',
    name: 'Instagram Product Showcase',
    status: 'active',
    type: 'Social Media',
    budget: 6000,
    spent: 4250,
    roi: 287,
    conversions: 325,
    reach: 89700,
    startDate: 'Mar 10, 2025',
    endDate: 'Mar 31, 2025'
  },
  {
    id: 'CAMP-2023-CONTENT-02',
    name: 'Style Guide Blog Series',
    status: 'active',
    type: 'Content',
    budget: 4500,
    spent: 3200,
    roi: 192,
    conversions: 156,
    reach: 45200,
    startDate: 'Mar 5, 2025',
    endDate: 'Apr 5, 2025'
  },
  {
    id: 'CAMP-2023-Q4',
    name: 'Holiday Season Promotion',
    status: 'scheduled',
    type: 'Multi-channel',
    budget: 25000,
    spent: 0,
    roi: 0,
    conversions: 0,
    reach: 0,
    startDate: 'Nov 15, 2025',
    endDate: 'Dec 31, 2025'
  },
  {
    id: 'CAMP-2023-PODCAST-01',
    name: 'Fashion Podcast Sponsorship',
    status: 'completed',
    type: 'Sponsorship',
    budget: 8000,
    spent: 8000,
    roi: 256,
    conversions: 187,
    reach: 63800,
    startDate: 'Feb 1, 2025',
    endDate: 'Feb 28, 2025'
  },
  {
    id: 'CAMP-2023-SOCIAL-02',
    name: 'TikTok Influencer Campaign',
    status: 'completed',
    type: 'Influencer',
    budget: 15000,
    spent: 15000,
    roi: 378,
    conversions: 542,
    reach: 235000,
    startDate: 'Jan 15, 2025',
    endDate: 'Feb 15, 2025'
  },
];

// Mock data for channel performance
const channelPerformance = [
  { 
    channel: 'Email Marketing', 
    icon: <Mail className="h-4 w-4" />,
    metrics: {
      roi: 420,
      ctr: 3.8,
      conversionRate: 4.2,
      reach: 45000,
      cost: 4200
    },
    change: 15.3,
    trend: 'up'
  },
  { 
    channel: 'Instagram', 
    icon: <Instagram className="h-4 w-4" />,
    metrics: {
      roi: 350,
      ctr: 2.5,
      conversionRate: 2.8,
      reach: 125000,
      cost: 8500
    },
    change: 7.2,
    trend: 'up'
  },
  { 
    channel: 'Facebook', 
    icon: <Facebook className="h-4 w-4" />,
    metrics: {
      roi: 275,
      ctr: 1.8,
      conversionRate: 2.1,
      reach: 95000,
      cost: 7200
    },
    change: -2.1,
    trend: 'down'
  },
  { 
    channel: 'Twitter', 
    icon: <Twitter className="h-4 w-4" />,
    metrics: {
      roi: 210,
      ctr: 1.5,
      conversionRate: 1.8,
      reach: 75000,
      cost: 5500
    },
    change: 3.6,
    trend: 'up'
  },
  // { 
  //   channel: 'TikTok', 
  //   icon: <TikTok className="h-4 w-4" />,
  //   metrics: {
  //     roi: 385,
  //     ctr: 3.2,
  //     conversionRate: 3.5,
  //     reach: 185000,
  //     cost: 12000
  //   },
  //   change: 24.8,
  //   trend: 'up'
  // },
  { 
    channel: 'YouTube', 
    icon: <Youtube className="h-4 w-4" />,
    metrics: {
      roi: 295,
      ctr: 2.1,
      conversionRate: 2.4,
      reach: 65000,
      cost: 6800
    },
    change: 5.9,
    trend: 'up'
  },
];

// Mock data for content performance
const contentPerformance = [
  {
    id: 'CONT-2023-BLOG-12',
    title: '10 Spring Fashion Trends You Need to Know',
    type: 'Blog Post',
    format: 'Article',
    views: 24500,
    engagement: 8.4,
    conversions: 325,
    shareRate: 12.3,
    leadGeneration: 178,
    publishDate: 'Mar 10, 2025'
  },
  {
    id: 'CONT-2023-VIDEO-08',
    title: 'How to Style the New Spring Collection',
    type: 'Video',
    format: 'Tutorial',
    views: 18700,
    engagement: 15.2,
    conversions: 245,
    shareRate: 18.7,
    leadGeneration: 132,
    publishDate: 'Mar 15, 2025'
  },
  {
    id: 'CONT-2023-SOCIAL-25',
    title: 'Behind the Scenes: Spring Photoshoot',
    type: 'Social Media',
    format: 'Photo Gallery',
    views: 38200,
    engagement: 22.6,
    conversions: 187,
    shareRate: 24.5,
    leadGeneration: 95,
    publishDate: 'Mar 7, 2025'
  },
  {
    id: 'CONT-2023-EMAIL-15',
    title: 'Exclusive Preview: Limited Edition Collection',
    type: 'Email',
    format: 'Newsletter',
    views: 15400,
    engagement: 18.9,
    conversions: 342,
    shareRate: 5.2,
    leadGeneration: 205,
    publishDate: 'Mar 20, 2025'
  },
  {
    id: 'CONT-2023-BLOG-11',
    title: 'Sustainable Fashion: Our Commitment to the Environment',
    type: 'Blog Post',
    format: 'Long-form',
    views: 12800,
    engagement: 11.5,
    conversions: 145,
    shareRate: 15.8,
    leadGeneration: 98,
    publishDate: 'Mar 5, 2025'
  },
];

// Mock data for audience segments
const audienceSegments = [
  { 
    name: 'Fashionistas', 
    size: 28,
    engagement: 32,
    conversion: 24,
    avgOrderValue: '$142.85',
    cac: '$22.40',
    preferredChannels: ['Instagram', 'TikTok']
  },
  { 
    name: 'Value Shoppers', 
    size: 35,
    engagement: 24,
    conversion: 28,
    avgOrderValue: '$78.50',
    cac: '$18.75',
    preferredChannels: ['Email', 'Facebook']
  },
  { 
    name: 'Luxury Buyers', 
    size: 12,
    engagement: 18,
    conversion: 22,
    avgOrderValue: '$285.30',
    cac: '$42.65',
    preferredChannels: ['Email', 'YouTube']
  },
  { 
    name: 'Occasional Buyers', 
    size: 25,
    engagement: 14,
    conversion: 16,
    avgOrderValue: '$95.25',
    cac: '$32.80',
    preferredChannels: ['Facebook', 'Email']
  },
];

// Mock data for budget allocation
const budgetAllocation = [
  { channel: 'Social Media', percentage: 35, budget: 35000 },
  { channel: 'Email Marketing', percentage: 20, budget: 20000 },
  { channel: 'Content Marketing', percentage: 15, budget: 15000 },
  { channel: 'Influencer Marketing', percentage: 15, budget: 15000 },
  { channel: 'Paid Advertising', percentage: 10, budget: 10000 },
  { channel: 'Events & Sponsorships', percentage: 5, budget: 5000 },
];

// Mock data for upcoming campaigns
const upcomingCampaigns = [
  {
    name: 'Summer Collection Launch',
    status: 'In Planning',
    startDate: 'May 1, 2025',
    budget: '$20,000',
    channels: ['Social Media', 'Email', 'Influencers']
  },
  {
    name: 'Mid-Year Sale',
    status: 'Ready to Launch',
    startDate: 'Jun 15, 2025',
    budget: '$15,000',
    channels: ['Email', 'Social Media', 'Paid Ads']
  },
  {
    name: 'Back to School Campaign',
    status: 'Early Planning',
    startDate: 'Jul 20, 2025',
    budget: '$18,000',
    channels: ['Social Media', 'Content', 'Influencers']
  }
];

const MarketingContent: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [contentFilter, setContentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter campaigns based on status and search
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = campaignFilter === 'all' || 
      campaign.status === campaignFilter;
    
    const matchesSearch = searchQuery === '' || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      campaign.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  // Filter content based on type and search
  const filteredContent = contentPerformance.filter(content => {
    const matchesType = contentFilter === 'all' || 
      content.type.toLowerCase() === contentFilter.toLowerCase();
    
    const matchesSearch = searchQuery === '' || 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      content.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });
  
  // Filter channels based on selection
  const filteredChannels = channelPerformance.filter(channel => {
    if (channelFilter === 'all') return true;
    return channel.channel.toLowerCase() === channelFilter.toLowerCase();
  });
  
  return (
    <div className="space-y-6">
      {/* Page header with action buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing Analytics</h1>
          <p className="text-muted-foreground">
            Analyze and optimize your marketing performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md px-3 py-2">
            <Calendar className="mr-2 h-4 w-4 opacity-50" />
            <Select
              defaultValue={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="border-0 p-0 h-auto w-[120px] shadow-none focus:ring-0">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Marketing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketingMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className="rounded-full bg-muted p-1">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center pt-1 text-xs">
                <span className={`flex items-center ${
                  (metric.trend === 'up' && metric.title !== 'Customer Acquisition Cost') || 
                  (metric.trend === 'down' && metric.title === 'Customer Acquisition Cost')
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-muted-foreground ml-2">
                  compared to last {timeRange}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different marketing views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Marketing Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Marketing Performance</CardTitle>
                <CardDescription>
                  ROI and conversion rate trends over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center">
                  <AreaChart size={48} className="text-muted-foreground opacity-50" />
                  <p className="ml-2 text-muted-foreground">Marketing performance chart visualization</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Budget Allocation */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
                <CardDescription>
                  Current marketing budget distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 flex items-center justify-center mb-4">
                  <PieChart size={48} className="text-muted-foreground opacity-50" />
                  <p className="ml-2 text-muted-foreground">Budget distribution visualization</p>
                </div>
                <div className="space-y-4">
                  {budgetAllocation.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>{item.channel}</span>
                        <span>${item.budget.toLocaleString()}</span>
                      </div>
                      <Progress value={item.percentage} className="h-1.5" />
                      <div className="text-xs text-muted-foreground text-right">
                        {item.percentage}% of total
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Active Campaigns & Channel Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Campaigns */}
            <Card>
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle>Active Campaigns</CardTitle>
                  <CardDescription>
                    Currently running marketing activities
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns
                      .filter(campaign => campaign.status === 'active')
                      .slice(0, 5)
                      .map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>{campaign.type}</TableCell>
                          <TableCell className="text-right">${campaign.spent.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-green-600 flex items-center justify-end">
                              {campaign.roi}%
                              <ArrowUp className="ml-1 h-3 w-3" />
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Channel Performance */}
            <Card>
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription>
                    ROI by marketing channel
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channelPerformance.slice(0, 5).map((channel, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {channel.icon}
                            <span>{channel.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{channel.metrics.roi}%</TableCell>
                        <TableCell className="text-right">{channel.metrics.conversionRate}%</TableCell>
                        <TableCell>
                          <span className={`flex items-center ${
                            channel.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {channel.trend === 'up' ? (
                              <ArrowUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDown className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(channel.change)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Campaigns</CardTitle>
              <CardDescription>
                Marketing activities scheduled to run soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingCampaigns.map((campaign, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{campaign.status}</Badge>
                      <div className="flex items-center">
                        <CalendarRange className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="font-medium mb-2">{campaign.name}</h3>
                    <div className="text-sm text-muted-foreground mb-2">
                      Starts: {campaign.startDate}
                    </div>
                    <div className="text-sm mb-3">
                      Budget: {campaign.budget}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {campaign.channels.map((channel, i) => (
                        <Badge variant="secondary" key={i} className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                      View Campaign Plan
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Campaign
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-4">
          {/* Search and Filter Controls for Campaigns */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search campaigns by name or ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select 
                value={campaignFilter} 
                onValueChange={setCampaignFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="primary">
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>
          </div>
          
          {/* Campaigns Table */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>
                Track and analyze your marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Reach</TableHead>
                    <TableHead>Timeline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">
                        <div>{campaign.name}</div>
                        <div className="text-xs text-muted-foreground">{campaign.id}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            campaign.status === 'active' 
                              ? 'default' 
                              : campaign.status === 'scheduled'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.type}</TableCell>
                      <TableCell className="text-right">${campaign.budget.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${campaign.spent.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {campaign.roi > 0 ? (
                          <span className="text-green-600 flex items-center justify-end">
                            {campaign.roi}%
                            <ArrowUp className="ml-1 h-3 w-3" />
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{campaign.conversions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{campaign.reach.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <div>Start: {campaign.startDate}</div>
                          <div>End: {campaign.endDate}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredCampaigns.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No campaigns found matching your criteria
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </CardFooter>
          </Card>
          
          {/* Campaign Budget Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Budget Utilization</CardTitle>
              <CardDescription>
                Track spending and ROI across campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center mb-6">
                <BarChart size={48} className="text-muted-foreground opacity-50" />
                <p className="ml-2 text-muted-foreground">Campaign budget and ROI visualization</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
                  <div className="text-2xl font-bold">$78,500</div>
                  <div className="flex items-center pt-1 text-xs text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>12.5% vs last {timeRange}</span>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Spent</div>
                  <div className="text-2xl font-bold">$42,000</div>
                  <div className="flex items-center pt-1 text-xs">
                    <span className="text-muted-foreground">53.5% of total budget</span>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Avg. ROI</div>
                  <div className="text-2xl font-bold">342%</div>
                  <div className="flex items-center pt-1 text-xs text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    <span>8.3% vs last {timeRange}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="channels" className="space-y-4">
          {/* Channel Performance */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex gap-2 ml-auto">
              <Select 
                value={channelFilter} 
                onValueChange={setChannelFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  {channelPerformance.map((channel, index) => (
                    <SelectItem key={index} value={channel.channel.toLowerCase()}>
                      {channel.channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
          
          {/* Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Channel Performance Chart */}
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle>Channel Performance Comparison</CardTitle>
                <CardDescription>
                  ROI and conversion rates across marketing channels
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center">
                  <BarChart size={48} className="text-muted-foreground opacity-50" />
                  <p className="ml-2 text-muted-foreground">Channel performance chart visualization</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Channel Metrics Summary */}
            <Card className="md:col-span-1 lg:col-span-1">
              <CardHeader>
                <CardTitle>Channel Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators by channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredChannels.map((channel, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {channel.icon}
                          <span className="font-medium">{channel.channel}</span>
                        </div>
                        <Badge 
                          variant={channel.trend === 'up' ? 'default' : 'destructive'}
                          className="ml-2"
                        >
                          {channel.trend === 'up' ? (
                            <span className="flex items-center">
                              <ArrowUp className="h-3 w-3 mr-1" />
                              {channel.change}%
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <ArrowDown className="h-3 w-3 mr-1" />
                              {Math.abs(channel.change)}%
                            </span>
                          )}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">ROI</div>
                          <div className="text-xl font-bold">{channel.metrics.roi}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">CTR</div>
                          <div className="text-xl font-bold">{channel.metrics.ctr}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Conversion</div>
                          <div className="text-xl font-bold">{channel.metrics.conversionRate}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Reach</div>
                          <div className="text-xl font-bold">{(channel.metrics.reach / 1000).toFixed(1)}K</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Channel Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance Details</CardTitle>
              <CardDescription>
                Detailed metrics for each marketing channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Conv. Rate</TableHead>
                    <TableHead className="text-right">Reach</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChannels.map((channel, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {channel.icon}
                          <span>{channel.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{channel.metrics.roi}%</TableCell>
                      <TableCell className="text-right">{channel.metrics.ctr}%</TableCell>
                      <TableCell className="text-right">{channel.metrics.conversionRate}%</TableCell>
                      <TableCell className="text-right">{channel.metrics.reach.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${channel.metrics.cost.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`flex items-center ${
                          channel.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {channel.trend === 'up' ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(channel.change)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <Link2 className="mr-2 h-4 w-4" />
                Connect New Channel
              </Button>
            </CardFooter>
          </Card>
          
          {/* Channel Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Optimization Recommendations</CardTitle>
              <CardDescription>
                AI-powered suggestions to improve channel performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">TikTok Performance</h3>
                  </div>
                  <p className="text-sm mb-2">
                    TikTok shows the highest growth rate at 24.8%. Consider increasing budget allocation from other channels.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-xs">
                    View Optimization Plan
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium">Facebook Performance</h3>
                  </div>
                  <p className="text-sm mb-2">
                    Facebook ROI decreased by 2.1%. Recommend reviewing ad creative and targeting parameters.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-xs">
                    View Detailed Analysis
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Megaphone className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Email Campaign Frequency</h3>
                  </div>
                  <p className="text-sm mb-2">
                    Email shows strong ROI (420%). Test increased sending frequency to leverage this effective channel.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-xs">
                    View Email Strategy
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium">Budget Reallocation</h3>
                  </div>
                  <p className="text-sm mb-2">
                    Shift 5% of budget from Facebook to TikTok to optimize overall marketing ROI.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-xs">
                    View Budget Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          {/* Search and Filter Controls for Content */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search content by title or ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select 
                value={contentFilter} 
                onValueChange={setContentFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Content Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="blog post">Blog Post</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="social media">Social Media</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Content
              </Button>
            </div>
          </div>
          
          {/* Content Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>
                Analytics for your marketing content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Engagement</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Share Rate</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead>Published</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContent.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">
                        <div>{content.title}</div>
                        <div className="text-xs text-muted-foreground">{content.id}</div>
                      </TableCell>
                      <TableCell>{content.type}</TableCell>
                      <TableCell>{content.format}</TableCell>
                      <TableCell className="text-right">{content.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{content.engagement}%</TableCell>
                      <TableCell className="text-right">{content.conversions}</TableCell>
                      <TableCell className="text-right">{content.shareRate}%</TableCell>
                      <TableCell className="text-right">{content.leadGeneration}</TableCell>
                      <TableCell>{content.publishDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredContent.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No content found matching your criteria
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredContent.length} of {contentPerformance.length} content items
              </div>
              <Button>
                Content Performance Report
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Content Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performing Content */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>
                  Content with highest engagement and conversion
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center">
                  <BarChart size={48} className="text-muted-foreground opacity-50" />
                  <p className="ml-2 text-muted-foreground">Content performance visualization</p>
                </div>
              </CardContent>
              <CardFooter>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="border rounded-lg p-3 flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">Avg. Engagement</div>
                    <div className="text-xl font-bold">15.3%</div>
                  </div>
                  <div className="border rounded-lg p-3 flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">Avg. Conversion</div>
                    <div className="text-xl font-bold">2.8%</div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            {/* Content Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>
                  Upcoming and scheduled content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="bg-muted py-2 px-4 font-medium text-sm">
                      Upcoming (Next 7 Days)
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 rounded-md bg-primary/10 items-center justify-center">
                          <CalendarRange className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Summer Style Guide: Beach Edition</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Mar 31, 2025
                            <Badge variant="outline" className="ml-1 text-xs">Blog</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 rounded-md bg-primary/10 items-center justify-center">
                          <CalendarRange className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">New Arrivals: Video Showcase</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Apr 2, 2025
                            <Badge variant="outline" className="ml-1 text-xs">Video</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <div className="bg-muted py-2 px-4 font-medium text-sm">
                      In Progress
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 rounded-md bg-amber-100 items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Sustainable Fashion: Our Journey</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Due: Apr 5, 2025
                            <Badge variant="outline" className="ml-1 text-xs">Blog</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 rounded-md bg-amber-100 items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Style Tips: Office to Evening</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Due: Apr 10, 2025
                            <Badge variant="outline" className="ml-1 text-xs">Social</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  View Full Content Calendar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="audience" className="space-y-4">
          {/* Audience Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Audience Segments */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Audience Segmentation</CardTitle>
                <CardDescription>
                  Breakdown of your customer audience
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center">
                  <PieChart size={48} className="text-muted-foreground opacity-50" />
                  <p className="ml-2 text-muted-foreground">Audience segments visualization</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Demographics */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>
                  Customer demographic breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Age Groups</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div>18-24</div>
                        <div>18%</div>
                      </div>
                      <Progress value={18} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div>25-34</div>
                        <div>42%</div>
                      </div>
                      <Progress value={42} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div>35-44</div>
                        <div>25%</div>
                      </div>
                      <Progress value={25} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div>45+</div>
                        <div>15%</div>
                      </div>
                      <Progress value={15} className="h-1.5" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Gender</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div>Female</div>
                        <div>68%</div>
                      </div>
                      <Progress value={68} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div>Male</div>
                        <div>30%</div>
                      </div>
                      <Progress value={30} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div>Other</div>
                        <div>2%</div>
                      </div>
                      <Progress value={2} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Audience Segments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Segments</CardTitle>
              <CardDescription>
                Detailed metrics for each audience segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead className="text-right">Engagement</TableHead>
                    <TableHead className="text-right">Conversion</TableHead>
                    <TableHead className="text-right">Avg Order Value</TableHead>
                    <TableHead className="text-right">CAC</TableHead>
                    <TableHead>Preferred Channels</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audienceSegments.map((segment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{segment.name}</TableCell>
                      <TableCell className="text-right">{segment.size}%</TableCell>
                      <TableCell className="text-right">{segment.engagement}%</TableCell>
                      <TableCell className="text-right">{segment.conversion}%</TableCell>
                      <TableCell className="text-right">{segment.avgOrderValue}</TableCell>
                      <TableCell className="text-right">{segment.cac}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {segment.preferredChannels.map((channel, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                Export Segment Data
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Segment
              </Button>
            </CardFooter>
          </Card>
          
          {/* Audience Targeting Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Targeting Recommendations</CardTitle>
              <CardDescription>
                AI-powered suggestions to improve audience targeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">"Fashionistas" Segment</h3>
                  <p className="text-sm mb-3">
                    High engagement (32%) but lower conversion (24%). Focus on reducing friction in the purchase journey with personalized product recommendations.
                  </p>
                  <Button variant="outline" size="sm">
                    View Detailed Strategy
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">"Value Shoppers" Segment</h3>
                  <p className="text-sm mb-3">
                    Strong conversion rate (28%) with lower engagement (24%). Create more value-focused content highlighting cost-per-wear and durability.
                  </p>
                  <Button variant="outline" size="sm">
                    View Detailed Strategy
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">"Luxury Buyers" Segment</h3>
                  <p className="text-sm mb-3">
                    Highest average order value ($285.30) but smaller segment size (12%). Target with exclusive collections and early access offers.
                  </p>
                  <Button variant="outline" size="sm">
                    View Detailed Strategy
                  </Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">New Segment Opportunity</h3>
                  <p className="text-sm mb-3">
                    Data suggests an emerging "Eco-conscious" segment with growing interest in sustainable fashion. Create targeted campaigns.
                  </p>
                  <Button variant="outline" size="sm">
                    Explore Opportunity
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Generate Comprehensive Audience Strategy
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingContent;