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
  Lightbulb,
  TrendingUp,
  AlertCircle,
  PackageCheck,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingDown,
  Tags,
  BarChart3,
  Zap,
  LineChart,
  Star,
  BadgeCheck,
  Flag,
  Share2,
  ArrowUpRight,
  Command,
  Maximize2,
  Clock,
  MessageSquare,
  RotateCw,
  ThumbsUp,
	Plus
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { 
  MoreHorizontal,
  MoreVertical,
  Eye,
  Settings,
  X,
  Send
} from "lucide-react";

// Mock data for AI insights metrics
const insightMetrics = [
  { 
    title: 'Revenue Impact',
    value: '$127,850',
    change: 15.3,
    trend: 'up',
    icon: <DollarSign className="h-4 w-4" />
  },
  { 
    title: 'Optimized Inventory',
    value: '84.2%',
    change: 8.5,
    trend: 'up',
    icon: <PackageCheck className="h-4 w-4" />
  },
  { 
    title: 'Customer Retention',
    value: '72.5%',
    change: 4.2,
    trend: 'up',
    icon: <Users className="h-4 w-4" />
  },
  { 
    title: 'Cross-Sell Rate',
    value: '28.9%',
    change: 9.7,
    trend: 'up',
    icon: <ShoppingBag className="h-4 w-4" />
  },
];

// Mock data for recent AI insights
const recentInsights = [
  {
    id: 'INS-2023-03-28-01',
    title: 'Inventory Restocking Recommendation',
    description: 'Based on current sell-through rates and TikTok engagement metrics, we recommend increasing your next order of "Urban Classic Jeans" by 25% to meet projected demand.',
    impact: 'High',
    category: 'Inventory',
    dateGenerated: 'Mar 28, 2025',
    status: 'New',
    metrics: {
      confidenceScore: 87,
      potentialRevenue: 28500,
      dataPoints: 1842
    }
  },
  {
    id: 'INS-2023-03-27-04',
    title: 'Customer Segment Opportunity',
    description: 'A new high-value customer segment has emerged: 25-34 year old professionals who primarily shop via mobile on weekends and have a 40% higher AOV than average. We recommend targeted email campaigns on Friday afternoons.',
    impact: 'Medium',
    category: 'Marketing',
    dateGenerated: 'Mar 27, 2025',
    status: 'Active',
    metrics: {
      confidenceScore: 82,
      potentialRevenue: 15750,
      dataPoints: 2156
    }
  },
  {
    id: 'INS-2023-03-27-02',
    title: 'Price Optimization Alert',
    description: 'Your "Summer Breeze Dress" is priced 15% lower than market average with one of the highest margins in your catalog. Our analysis suggests you can increase price by 10% with minimal impact on conversion rate.',
    impact: 'High',
    category: 'Pricing',
    dateGenerated: 'Mar 27, 2025',
    status: 'Active',
    metrics: {
      confidenceScore: 91,
      potentialRevenue: 21200,
      dataPoints: 1526
    }
  },
  {
    id: 'INS-2023-03-26-03',
    title: 'Cross-Sell Opportunity',
    description: 'Customers who purchase the "Athleisure Set" show a strong affinity for the "Urban Classic Jeans" but rarely see both together. Adding a recommendation block could increase cart value by an estimated 22%.',
    impact: 'Medium',
    category: 'Sales',
    dateGenerated: 'Mar 26, 2025',
    status: 'Implemented',
    metrics: {
      confidenceScore: 85,
      potentialRevenue: 18400,
      dataPoints: 1738
    }
  },
  {
    id: 'INS-2023-03-25-01',
    title: 'Marketing Channel Shift',
    description: 'TikTok engagement for your Spring collection is outperforming Instagram by 3.2x while costing 25% less per engagement. We recommend shifting 30% of your Instagram budget to TikTok for the next 14 days.',
    impact: 'High',
    category: 'Marketing',
    dateGenerated: 'Mar 25, 2025',
    status: 'Implemented',
    metrics: {
      confidenceScore: 88,
      potentialRevenue: 32600,
      dataPoints: 2435
    }
  },
  {
    id: 'INS-2023-03-24-02',
    title: 'Shipping Time Improvement',
    description: 'Customers in the Northeast region are experiencing 1.2 days longer shipping times than average, primarily due to carrier selection. Switching to FedEx for this region could improve delivery times and customer satisfaction.',
    impact: 'Medium',
    category: 'Operations',
    dateGenerated: 'Mar 24, 2025',
    status: 'In Progress',
    metrics: {
      confidenceScore: 79,
      potentialRevenue: 12800,
      dataPoints: 1568
    }
  },
];

// Mock data for AI insight categories
const insightCategories = [
  { name: 'Inventory', count: 12, icon: <PackageCheck className="h-5 w-5" /> },
  { name: 'Marketing', count: 18, icon: <BarChart3 className="h-5 w-5" /> },
  { name: 'Pricing', count: 8, icon: <Tags className="h-5 w-5" /> },
  { name: 'Sales', count: 14, icon: <TrendingUp className="h-5 w-5" /> },
  { name: 'Customer', count: 9, icon: <Users className="h-5 w-5" /> },
  { name: 'Operations', count: 7, icon: <Command className="h-5 w-5" /> },
];

// Mock data for AI model settings
const aiModelSettings = {
  model: 'Advanced',
  dataFrequency: 'Daily',
  insightGeneration: 'Proactive',
  confidenceThreshold: 75,
  notificationEnabled: true,
  priorityCategories: ['Inventory', 'Marketing', 'Pricing'],
  excludedCategories: [],
  customParameters: {
    revenueEmphasis: 'High',
    seasonalityTracking: true,
    competitorMonitoring: true,
    trendSensitivity: 'Medium'
  }
};

// Mock data for custom insights
const customInsights = [
  {
    name: 'Summer Collection Pre-Launch Analysis',
    status: 'Running',
    progress: 72,
    parameters: ['Collection Launch', 'Summer 2025', 'Pre-Order Analysis'],
    created: 'Mar 27, 2025',
    estimatedCompletion: 'Mar 30, 2025'
  },
  {
    name: 'Influencer Impact Assessment',
    status: 'Scheduled',
    progress: 0,
    parameters: ['TikTok', 'Instagram', 'Spring Campaign'],
    created: 'Mar 28, 2025',
    estimatedCompletion: 'Apr 2, 2025'
  },
  {
    name: 'Markdown Strategy Optimization',
    status: 'Completed',
    progress: 100,
    parameters: ['End of Season', 'Clearance Planning', 'Winter Items'],
    created: 'Mar 20, 2025',
    estimatedCompletion: 'Mar 25, 2025'
  }
];

// Mock data for AI impact statistics
const aiImpactStats = {
  revenue: {
    total: 485920,
    fromInventory: 187250,
    fromMarketing: 142850,
    fromPricing: 108420,
    fromOther: 47400
  },
  efficiency: {
    inventoryTurnover: 18.5,
    marketingROI: 24.7,
    operationalCostReduction: 12.6,
    timeToInsight: 8.2
  }
};

const AIInsightsContent: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [insightFilter, setInsightFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImplemented, setShowImplemented] = useState(true);
  
  // Filter insights based on filters and search
  const filteredInsights = recentInsights.filter(insight => {
    const matchesCategory = categoryFilter === 'all' || 
      insight.category.toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesImpact = impactFilter === 'all' || 
      insight.impact.toLowerCase() === impactFilter.toLowerCase();
    
    const matchesStatus = insightFilter === 'all' ||
      insight.status.toLowerCase() === insightFilter.toLowerCase();
    
    const matchesImplemented = showImplemented || insight.status !== 'Implemented';
    
    const matchesSearch = searchQuery === '' || 
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      insight.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesImpact && matchesStatus && matchesImplemented && matchesSearch;
  });
  
  return (
    <div className="space-y-6">
      {/* Page header with action buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Recommendations</h1>
          <p className="text-muted-foreground">
            Smart insights to optimize your business performance
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
            <Lightbulb className="h-4 w-4 mr-2" />
            Request Insight
          </Button>
        </div>
      </div>

      {/* AI Insight Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insightMetrics.map((metric, index) => (
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
                <span className="flex items-center text-green-600">
                  {metric.trend === 'up' ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-muted-foreground ml-2">
                  from AI recommendations
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different AI insight views */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="custom">Custom Insights</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-4">
          {/* Search and Filter Controls for Insights */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search insights..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {insightCategories.map((category, index) => (
                    <SelectItem key={index} value={category.name.toLowerCase()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={impactFilter} 
                onValueChange={setImpactFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Impact Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Impact Levels</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="low">Low Impact</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={insightFilter} 
                onValueChange={setInsightFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-implemented" 
                  checked={showImplemented}
                  onCheckedChange={setShowImplemented}
                />
                <label 
                  htmlFor="show-implemented" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show Implemented
                </label>
              </div>
            </div>
          </div>
          
          {/* Recent Insights */}
          <div className="grid grid-cols-1 gap-4">
            {filteredInsights.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No insights found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your filters or search query
                  </p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setImpactFilter('all');
                    setInsightFilter('all');
                    setShowImplemented(true);
                  }} variant="outline" className="mt-4">
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredInsights.map((insight) => (
                <Card key={insight.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={
                              insight.impact === 'High' 
                                ? 'default' 
                                : insight.impact === 'Medium'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {insight.impact} Impact
                          </Badge>
                          <Badge 
                            variant={
                              insight.status === 'New' 
                                ? 'destructive' 
                                : insight.status === 'Implemented'
                                  ? 'outline'
                                  : 'secondary'
                            }
                          >
                            {insight.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {insight.dateGenerated}
                          </span>
                        </div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Implemented</DropdownMenuItem>
                          <DropdownMenuItem>Share Insight</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Dismiss</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="flex-grow">
                        <p className="text-sm text-muted-foreground mb-4">
                          {insight.description}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Confidence Score</span>
                            <div className="flex items-center">
                              <span className="text-lg font-medium">{insight.metrics.confidenceScore}%</span>
                              <Progress 
                                value={insight.metrics.confidenceScore} 
                                className="h-1.5 ml-2 flex-grow"
                                // indicator={insight.metrics.confidenceScore >= 85 ? 'green' : 'amber'}
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Potential Revenue</span>
                            <p className="text-lg font-medium">${insight.metrics.potentialRevenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Data Points</span>
                            <p className="text-lg font-medium">{insight.metrics.dataPoints.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center">
                        {insight.category === 'Inventory' && <PackageCheck className="h-8 w-8 text-primary" />}
                        {insight.category === 'Marketing' && <BarChart3 className="h-8 w-8 text-primary" />}
                        {insight.category === 'Pricing' && <Tags className="h-8 w-8 text-primary" />}
                        {insight.category === 'Sales' && <TrendingUp className="h-8 w-8 text-primary" />}
                        {insight.category === 'Operations' && <Command className="h-8 w-8 text-primary" />}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-3">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center">
                        <Badge variant="outline">{insight.category}</Badge>
                        <span className="text-xs text-muted-foreground ml-2">{insight.id}</span>
                      </div>
                      <div className="flex gap-2">
                        {insight.status !== 'Implemented' && (
                          <Button size="sm" variant="outline">
                            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                            Implement
                          </Button>
                        )}
                        <Button size="sm">
                          <Maximize2 className="h-3.5 w-3.5 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          
          {/* Insight Categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {insightCategories.map((category, index) => (
              <Card key={index} className="hover:border-primary/50 cursor-pointer transition-colors">
                <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                  <div className="p-2 bg-primary/10 rounded-md">
                    {category.icon}
                  </div>
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                    <span className="text-sm font-medium">{category.count}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {category.count} active insights
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-4">
          {/* AI Impact Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue Impact */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Impact by Category</CardTitle>
                <CardDescription>
                  Estimated revenue generated from AI recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center">
                  <BarChart size={48} className="text-muted-foreground opacity-50" />
                  <p className="ml-2 text-muted-foreground">Revenue impact visualization</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="text-sm">
                  <span className="font-medium">Total Revenue Impact: </span>
                  <span className="text-primary">${aiImpactStats.revenue.total.toLocaleString()}</span>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardFooter>
            </Card>
            
            {/* Insight Performance */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Insight Performance</CardTitle>
                <CardDescription>
                  Effectiveness metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Implementation Rate</span>
                      <span className="font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-1.5" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Confidence Score</span>
                      <span className="font-medium">85.3%</span>
                    </div>
                    <Progress value={85.3} className="h-1.5" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Satisfaction</span>
                      <span className="font-medium">92.7%</span>
                    </div>
                    <Progress value={92.7} className="h-1.5" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Operational Efficiency</span>
                      <span className="font-medium">76.2%</span>
                    </div>
                    <Progress value={76.2} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <span className="text-xs text-muted-foreground">Last updated: Mar 28, 2025</span>
                <Button variant="link" size="sm" className="h-auto p-0">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Efficiency Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inventory Turnover</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  {aiImpactStats.efficiency.inventoryTurnover}x
                  <span className="text-green-600 text-xs ml-2 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    18.5%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Improvement from AI insights
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Marketing ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  {aiImpactStats.efficiency.marketingROI}x
                  <span className="text-green-600 text-xs ml-2 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    24.7%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Improvement from AI insights
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cost Reduction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  {aiImpactStats.efficiency.operationalCostReduction}%
                  <span className="text-green-600 text-xs ml-2 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    12.6%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Improvement from AI insights
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time to Insight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  {aiImpactStats.efficiency.timeToInsight} hrs
                  <span className="text-green-600 text-xs ml-2 flex items-center">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    42.3%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Faster than manual analysis
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Impact Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation Impact Timeline</CardTitle>
              <CardDescription>
                Revenue impact over time from implemented recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full w-full flex items-center justify-center">
                <LineChart size={48} className="text-muted-foreground opacity-50" />
                <p className="ml-2 text-muted-foreground">Impact timeline visualization</p>
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full pt-4">
                <div>
                  <span className="text-sm text-muted-foreground">Total Revenue Impact</span>
                  <p className="text-lg font-medium">${aiImpactStats.revenue.total.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">From Inventory</span>
                  <p className="text-lg font-medium">${aiImpactStats.revenue.fromInventory.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">From Marketing</span>
                  <p className="text-lg font-medium">${aiImpactStats.revenue.fromMarketing.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">From Pricing</span>
                  <p className="text-lg font-medium">${aiImpactStats.revenue.fromPricing.toLocaleString()}</p>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Top Performing Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Insights</CardTitle>
              <CardDescription>
                Recommendations with highest revenue impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Insight</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Implementation Date</TableHead>
                    <TableHead className="text-right">Revenue Impact</TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      TikTok Marketing Budget Reallocation
                    </TableCell>
                    <TableCell>Marketing</TableCell>
                    <TableCell>Mar 25, 2025</TableCell>
                    <TableCell className="text-right">$32,600</TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 flex items-center justify-end">
                        415%
                        <ArrowUp className="ml-1 h-3 w-3" />
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Implemented</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Summer Breeze Dress Price Optimization
                    </TableCell>
                    <TableCell>Pricing</TableCell>
                    <TableCell>Mar 27, 2025</TableCell>
                    <TableCell className="text-right">$21,200</TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 flex items-center justify-end">
                        380%
                        <ArrowUp className="ml-1 h-3 w-3" />
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Active</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Athleisure Set Cross-Sell Implementation
                    </TableCell>
                    <TableCell>Sales</TableCell>
                    <TableCell>Mar 26, 2025</TableCell>
                    <TableCell className="text-right">$18,400</TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 flex items-center justify-end">
                        325%
                        <ArrowUp className="ml-1 h-3 w-3" />
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Implemented</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Weekend Email Campaign Targeting
                    </TableCell>
                    <TableCell>Marketing</TableCell>
                    <TableCell>Mar 27, 2025</TableCell>
                    <TableCell className="text-right">$15,750</TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 flex items-center justify-end">
                        290%
                        <ArrowUp className="ml-1 h-3 w-3" />
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Active</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Northeast Shipping Carrier Change
                    </TableCell>
                    <TableCell>Operations</TableCell>
                    <TableCell>Mar 24, 2025</TableCell>
                    <TableCell className="text-right">$12,800</TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600 flex items-center justify-end">
                        245%
                        <ArrowUp className="ml-1 h-3 w-3" />
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge>In Progress</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">
                Showing 5 of 24 implemented insights
              </span>
              <Button variant="outline" size="sm">
                View All Insights
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          {/* Custom Insight Creation */}
          <Card>
            <CardHeader>
              <CardTitle>Request Custom AI Analysis</CardTitle>
              <CardDescription>
                Create targeted analysis for specific business questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="analysis-name">Analysis Name</Label>
                  <Input 
                    id="analysis-name" 
                    placeholder="E.g., Spring Collection Performance Forecast" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="analysis-description">Description</Label>
                  <Textarea 
                    id="analysis-description" 
                    placeholder="Describe what you want to analyze and any specific questions you'd like answered..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Data Sources</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Select data sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Connected Sources</SelectItem>
                        <SelectItem value="sales">Sales Data Only</SelectItem>
                        <SelectItem value="marketing">Marketing Data Only</SelectItem>
                        <SelectItem value="inventory">Inventory Data Only</SelectItem>
                        <SelectItem value="customer">Customer Data Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Time Period</Label>
                    <Select defaultValue="lastMonth">
                      <SelectTrigger>
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lastWeek">Last 7 Days</SelectItem>
                        <SelectItem value="lastMonth">Last 30 Days</SelectItem>
                        <SelectItem value="lastQuarter">Last 90 Days</SelectItem>
                        <SelectItem value="lastYear">Last 12 Months</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Analysis Parameters</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="cursor-pointer hover:bg-primary/90">+ Revenue</Badge>
                    <Badge className="cursor-pointer hover:bg-primary/90">+ Customer Behavior</Badge>
                    <Badge className="cursor-pointer hover:bg-primary/90">+ Product Performance</Badge>
                    <Badge className="cursor-pointer hover:bg-primary/90">+ Marketing ROI</Badge>
                    <Badge className="cursor-pointer hover:bg-primary/90">+ Seasonality</Badge>
                    <Badge className="cursor-pointer hover:bg-primary/90">+ Geographic Trends</Badge>
                    <Badge variant="outline" className="cursor-pointer">+ Add Parameter</Badge>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Priority Level</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High - Process Within 24 Hours</SelectItem>
                      <SelectItem value="medium">Medium - Process Within 48 Hours</SelectItem>
                      <SelectItem value="low">Low - Process When Resources Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between border-t pt-4">
              <Button variant="outline">Save as Draft</Button>
              <Button>
                <Lightbulb className="mr-2 h-4 w-4" />
                Request Analysis
              </Button>
            </CardFooter>
          </Card>
          
          {/* Custom Insights Status */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Analysis Status</CardTitle>
              <CardDescription>
                Track your requested AI analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customInsights.map((analysis, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{analysis.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={
                              analysis.status === 'Running' 
                                ? 'secondary' 
                                : analysis.status === 'Completed'
                                  ? 'default'
                                  : 'outline'
                            }
                          >
                            {analysis.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Created: {analysis.created}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Cancel Analysis</DropdownMenuItem>
                          <DropdownMenuItem>Clone Analysis</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {analysis.parameters.map((param, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {param}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Progress</span>
                        <span>{analysis.progress}%</span>
                      </div>
                      <Progress value={analysis.progress} className="h-1.5" />
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        {analysis.status === 'Completed' ? (
                          <span>Completed on: {analysis.estimatedCompletion}</span>
                        ) : (
                          <span>Estimated completion: {analysis.estimatedCompletion}</span>
                        )}
                      </div>
                      {analysis.status === 'Completed' ? (
                        <Button size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View Results
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {analysis.status === 'Running' ? 'Check Progress' : 'View Details'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                View All Custom Analyses
              </Button>
            </CardFooter>
          </Card>
          
          {/* Analysis Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Templates</CardTitle>
              <CardDescription>
                Quick-start analyses for common business scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-colors">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Product Performance Forecast</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Predict future sales for your top products based on historical data and market trends.
                  </p>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Quick Analysis</Badge>
                    <span className="text-xs text-muted-foreground">~24 hrs</span>
                  </div>
                </div>
                <div className="border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-colors">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Customer Segment Discovery</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Identify new high-value customer segments and behavior patterns to target effectively.
                  </p>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Deep Analysis</Badge>
                    <span className="text-xs text-muted-foreground">~48 hrs</span>
                  </div>
                </div>
                <div className="border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-colors">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Marketing Channel Optimization</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Analyze performance across channels to optimize budget allocation and maximize ROI.
                  </p>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Standard Analysis</Badge>
                    <span className="text-xs text-muted-foreground">~36 hrs</span>
                  </div>
                </div>
                <div className="border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-colors">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                    <Tags className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Pricing Strategy Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Optimize pricing across your catalog based on elasticity, competitor data, and margins.
                  </p>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Deep Analysis</Badge>
                    <span className="text-xs text-muted-foreground">~48 hrs</span>
                  </div>
                </div>
                <div className="border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-colors">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                    <PackageCheck className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Inventory Optimization</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Predict optimal stock levels across your product catalog to minimize overstock and stockouts.
                  </p>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Standard Analysis</Badge>
                    <span className="text-xs text-muted-foreground">~36 hrs</span>
                  </div>
                </div>
                <div className="border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-colors">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Product Recommendation Engine</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate personalized product recommendations based on purchase history and browsing behavior.
                  </p>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Custom Configuration</Badge>
                    <span className="text-xs text-muted-foreground">~72 hrs</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Analysis
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          {/* AI Model Settings */}
          <Card>
            <CardHeader>
              <CardTitle>AI Model Configuration</CardTitle>
              <CardDescription>
                Customize how the AI generates insights for your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label>AI Model Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                          <Zap className="h-4 w-4" />
                        </div>
                        <RadioGroup defaultValue="standard">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="standard" id="r1" />
                          </div>
                        </RadioGroup>
                      </div>
                      <h4 className="font-medium mt-3">Standard</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Basic analysis covering essential business KPIs
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 cursor-pointer border-primary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Lightbulb className="h-4 w-4 text-primary" />
                        </div>
                        <RadioGroup defaultValue="advanced">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="advanced" id="r2" checked />
                          </div>
                        </RadioGroup>
                      </div>
                      <h4 className="font-medium mt-3">Advanced</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Deep analysis with cross-channel data correlation
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                          <BadgeCheck className="h-4 w-4" />
                        </div>
                        <RadioGroup defaultValue="enterprise">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="enterprise" id="r3" />
                          </div>
                        </RadioGroup>
                      </div>
                      <h4 className="font-medium mt-3">Enterprise</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Custom ML models with industry benchmarking
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  <Label>Data Processing Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Select data frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How often should the AI analyze your data and generate new insights
                  </p>
                </div>
                
                <div className="grid gap-3">
                  <Label>Insight Generation</Label>
                  <Select defaultValue="proactive">
                    <SelectTrigger>
                      <SelectValue placeholder="Select insight generation mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proactive">Proactive (AI-initiated)</SelectItem>
                      <SelectItem value="reactive">Reactive (User-requested only)</SelectItem>
                      <SelectItem value="mixed">Mixed Approach</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Whether the AI should proactively generate insights or wait for specific requests
                  </p>
                </div>
                
                <div className="grid gap-3">
                  <div className="flex justify-between items-center">
                    <Label>Confidence Threshold</Label>
                    <span className="text-sm font-medium">{aiModelSettings.confidenceThreshold}%</span>
                  </div>
                  <Slider 
                    defaultValue={[aiModelSettings.confidenceThreshold]} 
                    min={50} 
                    max={95} 
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum confidence level required before surfacing insights (higher = fewer but more certain insights)
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="block mb-1">Insight Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts for new high-impact insights
                    </p>
                  </div>
                  <Switch id="notifications" defaultChecked={aiModelSettings.notificationEnabled} />
                </div>
                
                <div className="grid gap-3">
                  <Label>Priority Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {insightCategories.map((category, index) => (
                      <Badge 
                        key={index}
                        variant={aiModelSettings.priorityCategories.includes(category.name) ? 'default' : 'outline'}
                        className="cursor-pointer"
                      >
                        {category.name}
                        {aiModelSettings.priorityCategories.includes(category.name) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Categories to prioritize when generating insights
                  </p>
                </div>
                
                <div className="grid gap-3">
                  <Label>Advanced Settings</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <span className="text-sm font-medium">Revenue Emphasis</span>
                        <p className="text-xs text-muted-foreground">Prioritize revenue-generating insights</p>
                      </div>
                      <Select defaultValue="high">
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <span className="text-sm font-medium">Seasonality Tracking</span>
                        <p className="text-xs text-muted-foreground">Consider seasonal patterns in insights</p>
                      </div>
                      <Switch defaultChecked={aiModelSettings.customParameters.seasonalityTracking} />
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <span className="text-sm font-medium">Competitor Monitoring</span>
                        <p className="text-xs text-muted-foreground">Include market benchmarking in insights</p>
                      </div>
                      <Switch defaultChecked={aiModelSettings.customParameters.competitorMonitoring} />
                    </div>
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <span className="text-sm font-medium">Trend Sensitivity</span>
                        <p className="text-xs text-muted-foreground">Response to market trend changes</p>
                      </div>
                      <Select defaultValue="medium">
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">
                Reset to Defaults
              </Button>
              <Button>
                Save Configuration
              </Button>
            </CardFooter>
          </Card>
          
          {/* Data Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle>Data Integration Status</CardTitle>
              <CardDescription>
                Sources connected to the AI recommendations engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Data Points</TableHead>
                    <TableHead>Refresh Frequency</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img src="/shopify-icon.svg" alt="Shopify" className="h-4 w-4" />
                        Shopify
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">Connected</Badge>
                    </TableCell>
                    <TableCell>30 minutes ago</TableCell>
                    <TableCell>42,816</TableCell>
                    <TableCell>Hourly</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img src="/tiktok-icon.svg" alt="TikTok Shop" className="h-4 w-4" />
                        TikTok Shop
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">Connected</Badge>
                    </TableCell>
                    <TableCell>2 hours ago</TableCell>
                    <TableCell>18,542</TableCell>
                    <TableCell>Every 4 Hours</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img src="/klaviyo-icon.svg" alt="Klaviyo" className="h-4 w-4" />
                        Klaviyo
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">Connected</Badge>
                    </TableCell>
                    <TableCell>1 hour ago</TableCell>
                    <TableCell>24,218</TableCell>
                    <TableCell>Daily</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img src="/facebook-icon.svg" alt="Facebook Ads" className="h-4 w-4" />
                        Facebook Ads
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-600">Connected</Badge>
                    </TableCell>
                    <TableCell>3 hours ago</TableCell>
                    <TableCell>15,764</TableCell>
                    <TableCell>Daily</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img src="/inventory-icon.svg" alt="Inventory System" className="h-4 w-4" />
                        Inventory System
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Syncing</Badge>
                    </TableCell>
                    <TableCell>In progress</TableCell>
                    <TableCell>8,425</TableCell>
                    <TableCell>Every 6 Hours</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <img src="/google-analytics-icon.svg" alt="Google Analytics" className="h-4 w-4" />
                        Google Analytics
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-amber-600 border-amber-600">Auth Error</Badge>
                    </TableCell>
                    <TableCell>1 day ago</TableCell>
                    <TableCell>32,156</TableCell>
                    <TableCell>Daily</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        Fix Connection
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">
                <RotateCw className="h-4 w-4 mr-2" />
                Sync All Sources
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Connect New Source
              </Button>
            </CardFooter>
          </Card>
          
          {/* Feedback & Support */}
          <Card>
            <CardHeader>
              <CardTitle>AI Model Feedback</CardTitle>
              <CardDescription>
                Help improve the AI recommendations engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="feedback">Share Your Feedback</Label>
                  <Textarea 
                    id="feedback" 
                    placeholder="Tell us about your experience with AI recommendations..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Insight Accuracy Ratings</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Revenue Predictions</span>
                        <span className="font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-1.5" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Customer Behavior</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-1.5" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Inventory Recommendations</span>
                        <span className="font-medium">84%</span>
                      </div>
                      <Progress value={84} className="h-1.5" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Marketing Optimizations</span>
                        <span className="font-medium">79%</span>
                      </div>
                      <Progress value={79} className="h-1.5" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Based on your feedback for implemented insights over the last 30 days
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between border-t pt-4">
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsightsContent;