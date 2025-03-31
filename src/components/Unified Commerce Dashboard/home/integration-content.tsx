// File: components/dashboard/integrations-content.tsx
"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Cloud,
  Database,
  Download,
  Filter,
  Globe,
  Link2,
  LogIn,
  LogOut,
  MoreHorizontal,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart, // Example: E-commerce
  Mail,         // Example: Marketing
  BarChart3,    // Example: Analytics
  CreditCard,   // Example: Payments
  MessageSquare,// Example: Support/CRM
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Assuming shadcn/ui Card component
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming shadcn/ui Select
import { Input } from "@/components/ui/input"; // Assuming shadcn/ui Input
import { Badge } from "@/components/ui/badge"; // Assuming shadcn/ui Badge
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming shadcn/ui Table
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming shadcn/ui Tooltip
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Assuming shadcn/ui DropdownMenu
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming shadcn/ui Avatar
import { Progress } from "@/components/ui/progress"; // Assuming shadcn/ui Progress
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming shadcn/ui Tabs

// --- Mock Data ---

type IntegrationStatus = "connected" | "disconnected" | "needs_attention" | "syncing";

interface Integration {
  id: string;
  name: string;
  category: "E-commerce" | "Marketing" | "Analytics" | "Payments" | "CRM/Support" | "Other";
  description: string;
  icon: React.ElementType; // Platform icon/logo component or URL
  status: IntegrationStatus;
  lastSync: string | null; // ISO Date string or relative time string
  dataPoints: string[]; // Example: ['Orders', 'Customers', 'Products']
  error?: string; // Optional error message if status is 'needs_attention'
  setupDate: string; // ISO Date string
}

const mockIntegrations: Integration[] = [
  {
    id: "int-shopify-01",
    name: "Shopify",
    category: "E-commerce",
    description: "Sync orders, products, and customer data from your Shopify store.",
    icon: ShoppingCart,
    status: "connected",
    lastSync: "5 minutes ago",
    dataPoints: ["Orders", "Customers", "Products", "Inventory"],
    setupDate: "2024-01-15T10:30:00Z",
  },
  {
    id: "int-mailchimp-01",
    name: "Mailchimp",
    category: "Marketing",
    description: "Sync customer segments and campaign performance.",
    icon: Mail,
    status: "connected",
    lastSync: "1 hour ago",
    dataPoints: ["Subscribers", "Campaigns", "Segments"],
    setupDate: "2024-01-20T14:00:00Z",
  },
  {
    id: "int-ga4-01",
    name: "Google Analytics 4",
    category: "Analytics",
    description: "Track website traffic and user behavior.",
    icon: BarChart3,
    status: "needs_attention",
    lastSync: "2 days ago",
    dataPoints: ["Sessions", "Users", "Events", "Conversions"],
    error: "API key expired. Please reconnect.",
    setupDate: "2024-02-01T09:15:00Z",
  },
  {
    id: "int-stripe-01",
    name: "Stripe",
    category: "Payments",
    description: "Sync payment transactions and subscription data.",
    icon: CreditCard,
    status: "connected",
    lastSync: "15 minutes ago",
    dataPoints: ["Transactions", "Subscriptions", "Payouts"],
    setupDate: "2024-01-10T11:00:00Z",
  },
   {
    id: "int-zendesk-01",
    name: "Zendesk",
    category: "CRM/Support",
    description: "Sync support tickets and customer interactions.",
    icon: MessageSquare,
    status: "syncing",
    lastSync: "In Progress", // Or null if first sync
    dataPoints: ["Tickets", "Users", "Organizations"],
    setupDate: "2024-03-10T16:45:00Z",
  },
  {
    id: "int-facebookads-01",
    name: "Facebook Ads",
    category: "Marketing",
    description: "Track ad spend, impressions, and conversions.",
    icon: Plug, // Placeholder, ideally use Facebook icon
    status: "connected",
    lastSync: "30 minutes ago",
    dataPoints: ["Campaigns", "Ad Sets", "Ads", "Performance"],
    setupDate: "2024-02-25T18:20:00Z",
  },
  {
    id: "int-woocommerce-01",
    name: "WooCommerce",
    category: "E-commerce",
    description: "Connect your WordPress e-commerce store.",
    icon: ShoppingCart,
    status: "disconnected",
    lastSync: null,
    dataPoints: ["Orders", "Customers", "Products"],
    setupDate: "2024-03-01T12:00:00Z", // Date it was initially set up
  },
  {
    id: "int-quickbooks-01",
    name: "QuickBooks Online",
    category: "Other", // Could be 'Accounting' category
    description: "Sync financial data for accounting.",
    icon: Database, // Placeholder
    status: "connected",
    lastSync: "8 hours ago",
    dataPoints: ["Invoices", "Expenses", "Customers", "Vendors"],
    setupDate: "2024-03-05T09:00:00Z",
  },
];

// --- Helper Functions ---

const getStatusBadgeVariant = (
  status: IntegrationStatus
): "default" | "secondary" | "destructive" | "outline" | "warning" => {
  switch (status) {
    case "connected":
      return "default"; // Use primary/success color
    case "disconnected":
      return "outline";
    case "needs_attention":
      return "destructive"; // Use error color
    case "syncing":
      return "secondary"; // Use an 'in progress' or neutral color
    default:
      return "secondary";
  }
};

const getStatusIcon = (status: IntegrationStatus): React.ElementType => {
  switch (status) {
    case "connected":
      return CheckCircle;
    case "disconnected":
      return XCircle;
    case "needs_attention":
      return AlertCircle;
    case "syncing":
      return RefreshCw; // Add 'animate-spin' class for visual cue
    default:
      return AlertCircle;
  }
};

const IntegrationsContent: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter Integrations
  const filteredIntegrations = mockIntegrations.filter((integration) => {
    const matchesStatus = statusFilter === "all" || integration.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || integration.category === categoryFilter;
    const matchesSearch =
      searchQuery === "" ||
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Calculate Overview Metrics
  const totalConnected = mockIntegrations.filter(
    (i) => i.status === "connected" || i.status === "syncing"
  ).length;
  const needsAttention = mockIntegrations.filter(
    (i) => i.status === "needs_attention"
  ).length;
  const totalIntegrations = mockIntegrations.length;

  const overviewMetrics = [
    {
      title: "Connected Platforms",
      value: totalConnected,
      total: totalIntegrations,
      icon: <Plug className="h-4 w-4" />,
      description: `of ${totalIntegrations} available`,
    },
    {
      title: "Active Syncs",
      value: mockIntegrations.filter((i) => i.status === "syncing").length,
      icon: <RefreshCw className="h-4 w-4" />,
      description: "Currently syncing data",
    },
    {
      title: "Needs Attention",
      value: needsAttention,
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      description: "Require action",
      isWarning: true,
    },
    {
      title: "Total Data Points Synced",
      value: mockIntegrations.reduce((acc, i) => acc + (i.status !== 'disconnected' ? i.dataPoints.length : 0), 0),
      icon: <Database className="h-4 w-4" />,
      description: "Across connected platforms",
    },
  ];

  // Get unique categories for filtering
  const categories = [
    ...new Set(mockIntegrations.map((i) => i.category)),
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Globe className="h-6 w-6" /> Connected Platforms
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor your data integrations
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
             <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Connect New Platform
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <div className={`rounded-full p-1 ${metric.isWarning ? 'bg-destructive/10' : 'bg-muted'}`}>
                    {metric.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                 {metric.total && (
                    <Progress value={(metric.value / metric.total) * 100} className="h-1 mt-2" />
                 )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter and Search Controls */}
        <Card>
          <CardHeader>
             <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search integrations by name or description..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                </div>
                <div className="flex gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                    <SelectItem value="needs_attention">Needs Attention</SelectItem>
                    <SelectItem value="syncing">Syncing</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
          </CardHeader>
        </Card>


        {/* Integrations List/Table */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Integrations</CardTitle>
            <CardDescription>
              View, configure, and troubleshoot your connected platforms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Platform</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Data Synced</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIntegrations.length > 0 ? (
                  filteredIntegrations.map((integration) => {
                    const StatusIcon = getStatusIcon(integration.status);
                    return (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border">
                              {/* Use AvatarImage if you have image URLs */}
                              {/* <AvatarImage src="/path/to/logo.png" alt={integration.name} /> */}
                              <AvatarFallback className="bg-muted">
                                <integration.icon className="h-4 w-4 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                                {integration.name}
                                <p className="text-xs text-muted-foreground truncate w-48" title={integration.description}>
                                    {integration.description}
                                </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{integration.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className="cursor-help">
                                <StatusIcon
                                  className={`h-3 w-3 mr-1 ${
                                    integration.status === "syncing" ? "animate-spin" : ""
                                  }`}
                                />
                                {integration.status
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {integration.status === 'needs_attention' && integration.error ? (
                                  <p className="text-destructive">{integration.error}</p>
                              ) : (
                                <p>{integration.status
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())} since {new Date(integration.setupDate).toLocaleDateString()}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {integration.lastSync ? (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {integration.lastSync}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {integration.dataPoints.slice(0, 3).map(dp => (
                                    <Badge key={dp} variant="outline" className="text-xs">{dp}</Badge>
                                ))}
                                {integration.dataPoints.length > 3 && (
                                    <Badge variant="outline" className="text-xs">+{integration.dataPoints.length - 3} more</Badge>
                                )}
                               </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <ul className="list-disc list-inside text-xs">
                                   {integration.dataPoints.map(dp => <li key={dp}>{dp}</li>)}
                                </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Manage</DropdownMenuLabel>
                              {integration.status === "disconnected" ? (
                                <DropdownMenuItem>
                                  <LogIn className="mr-2 h-4 w-4" />
                                  Connect
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Configure Settings
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Trigger Manual Sync
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Activity className="mr-2 h-4 w-4" />
                                    View Sync Logs
                                  </DropdownMenuItem>
                                </>
                              )}
                               {integration.status === "needs_attention" && (
                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                        <AlertCircle className="mr-2 h-4 w-4" />
                                        Resolve Issue
                                    </DropdownMenuItem>
                               )}
                              <DropdownMenuSeparator />
                              {integration.status !== "disconnected" && (
                                <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                  <LogOut className="mr-2 h-4 w-4" />
                                  Disconnect
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No integrations found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
           <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    Showing {filteredIntegrations.length} of {mockIntegrations.length} integrations
                </div>
                <Button variant="ghost">
                    View Integration Marketplace
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>

        {/* Potential: Section for Recommended Integrations or Marketplace */}
        <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-indigo-600"/>
                    Discover New Integrations
                </CardTitle>
                <CardDescription>
                    Expand your platform's capabilities by connecting more tools.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Placeholder for recommended integrations */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Example Recommended Integration Card */}
                    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-center mb-2">
                             <Avatar className="h-10 w-10 border">
                              <AvatarFallback className="bg-muted">
                                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                        </div>
                        <h4 className="font-medium text-sm text-center mb-1">BigCommerce</h4>
                        <p className="text-xs text-muted-foreground text-center mb-3">Popular e-commerce platform.</p>
                        <Button size="sm" variant="outline" className="w-full">Learn More</Button>
                    </div>
                     <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                         <div className="flex justify-center mb-2">
                             <Avatar className="h-10 w-10 border">
                              <AvatarFallback className="bg-muted">
                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                        </div>
                        <h4 className="font-medium text-sm text-center mb-1">Intercom</h4>
                        <p className="text-xs text-muted-foreground text-center mb-3">Customer messaging platform.</p>
                        <Button size="sm" variant="outline" className="w-full">Learn More</Button>
                    </div>
                    {/* Add more placeholders */}
                 </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full">
                    Explore Integration Marketplace
                 </Button>
            </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default IntegrationsContent;