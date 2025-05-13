// src/components/dashboard/integrations-content.tsx
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
  ShoppingCart,
  Mail,
  BarChart3,
  CreditCard,
  MessageSquare,
  XCircle,
  Loader2,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useRouter } from "next/navigation";
import {
  IntegrationStatus,
  Integration,
  useIntegrations,
} from "../../integrations/klayvio-integration";
import { useToast } from "@/hooks/use-toast";

// Platform icon map
const platformIcons: Record<string, React.ElementType> = {
  Klaviyo: Mail,
  Shopify: ShoppingCart,
  "Google Analytics": BarChart3,
  Stripe: CreditCard,
  Zendesk: MessageSquare,
  "Facebook Ads": BarChart3,
  WooCommerce: ShoppingCart,
  QuickBooks: Database,
  Default: Plug,
};

// Helper Functions
const getStatusBadgeVariant = (
  status: IntegrationStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "connected":
      return "default";
    case "disconnected":
      return "outline";
    case "needs_attention":
      return "destructive";
    case "syncing":
      return "secondary";
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
      return RefreshCw;
    default:
      return AlertCircle;
  }
};

const getIcon = (integrationName: string): React.ElementType => {
  return platformIcons[integrationName] || platformIcons["Default"];
};

const formatLastSync = (lastSync: string | null): string => {
  if (!lastSync) return "Never";

  const syncDate = new Date(lastSync);
  const now = new Date();
  const diffMs = now.getTime() - syncDate.getTime();

  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

// Get all data points across all sync data
const getAllDataPoints = (integration: Integration): string[] => {
  const allPoints: string[] = [];

  if (integration.sync_data && integration.sync_data.length > 0) {
    integration.sync_data.forEach((data) => {
      if (data.data_points && Array.isArray(data.data_points)) {
        allPoints.push(...data.data_points);
      }
    });
  }

  return allPoints;
};

const IntegrationsContent: React.FC = () => {
  const {
    integrations,
    isLoading,
    error,
    refreshIntegrations,
    triggerSync,
    disconnectIntegration,
  } = useIntegrations();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();
  const router = useRouter();

  // Filter Integrations
  const filteredIntegrations = integrations.filter((integration) => {
    const matchesStatus =
      statusFilter === "all" || integration.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      integration.integration_category === categoryFilter;
    const matchesSearch =
      searchQuery === "" ||
      integration.integration_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Calculate Overview Metrics
  const totalConnected = integrations.filter(
    (i) => i.status === "connected" || i.status === "syncing",
  ).length;
  const needsAttention = integrations.filter(
    (i) => i.status === "needs_attention",
  ).length;
  const totalIntegrations = integrations.length;

  // Calculate the total number of data points across all connected integrations
  const totalDataPoints = integrations
    .filter((i) => i.status !== "disconnected")
    .reduce((acc, i) => {
      const points = getAllDataPoints(i);
      return acc + points.length;
    }, 0);

  const overviewMetrics = [
    {
      title: "Integrations",
      value: totalConnected,
      total: totalIntegrations,
      icon: <Plug className="h-4 w-4" />,
      description: `of ${totalIntegrations} available`,
    },
    {
      title: "Active Syncs",
      value: integrations.filter((i) => i.status === "syncing").length,
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
      value: totalDataPoints,
      icon: <Database className="h-4 w-4" />,
      description: "Across connected platforms",
    },
  ];

  // Get unique categories for filtering
  const categories = [
    ...new Set(integrations.map((i) => i.integration_category)),
  ];

  // Handle adding new integration
  const handleAddSource = () => {
    router.push("/klaviyo");
  };

  // Handle refresh all integrations
  const handleRefreshAll = async () => {
    try {
      await refreshIntegrations();
      toast({
        title: "Integrations refreshed",
        description: "All integration statuses have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error refreshing integrations",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Handle sync for a specific integration
  const handleSync = async (integrationId: string) => {
    try {
      await triggerSync(integrationId);
      toast({
        title: "Sync triggered",
        description: "The integration is now syncing data.",
      });
    } catch (error) {
      toast({
        title: "Error triggering sync",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Handle disconnect for a specific integration
  const handleDisconnect = async (integrationId: string) => {
    try {
      await disconnectIntegration(integrationId);
      toast({
        title: "Integration disconnected",
        description: "The integration has been disconnected successfully.",
      });
    } catch (error) {
      toast({
        title: "Error disconnecting integration",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Globe className="h-6 w-6" /> Integrations
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor your data integrations
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Resync All
            </Button>
            <Button onClick={handleAddSource}>
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {overviewMetrics.map((metric, index) => (
            <Card key={index} className="border dark:border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <div
                  className={`rounded-full p-1 ${
                    metric.isWarning
                      ? "bg-destructive/10 dark:bg-destructive/20"
                      : "bg-muted dark:bg-muted"
                  }`}
                >
                  {metric.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
                {metric.total && (
                  <Progress
                    value={(metric.value / metric.total) * 100}
                    className="mt-2 h-1 dark:bg-muted"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter and Search Controls */}
        <Card className="dark:border-border">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search integrations by name or description..."
                  className="pl-8 dark:border-border dark:bg-card"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full dark:border-border dark:bg-card md:w-[180px]">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent className="dark:border-border dark:bg-card">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full dark:border-border dark:bg-card md:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:border-border dark:bg-card">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                    <SelectItem value="needs_attention">
                      Needs Attention
                    </SelectItem>
                    <SelectItem value="syncing">Syncing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Integrations List/Table */}
        <Card className="dark:border-border">
          <CardHeader>
            <CardTitle>Manage Integrations</CardTitle>
            <CardDescription>
              View, configure, and troubleshoot your connected platforms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg text-muted-foreground">
                  Loading integrations...
                </span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-border">
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
                      const IconComponent = getIcon(
                        integration.integration_name,
                      );
                      const dataPoints = getAllDataPoints(integration);

                      return (
                        <TableRow
                          key={integration.id}
                          className="dark:border-border"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border dark:border-border">
                                <AvatarFallback className="bg-muted dark:bg-muted">
                                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                {integration.integration_name}
                                <p
                                  className="w-48 truncate text-xs text-muted-foreground"
                                  title={integration.description}
                                >
                                  {integration.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="dark:bg-secondary dark:text-secondary-foreground"
                            >
                              {integration.integration_category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  className={`cursor-help ${
                                    integration.status === "connected"
                                      ? "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                                      : integration.status === "needs_attention"
                                        ? "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
                                        : integration.status === "syncing"
                                          ? "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                                          : "bg-secondary text-secondary-foreground"
                                  }`}
                                >
                                  <StatusIcon
                                    className={`mr-1 h-3 w-3 ${
                                      integration.status === "syncing"
                                        ? "animate-spin"
                                        : ""
                                    }`}
                                  />
                                  {integration.status
                                    .replace("_", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="dark:border-border dark:bg-popover">
                                {integration.status === "needs_attention" &&
                                integration.error_message ? (
                                  <p className="text-destructive">
                                    {integration.error_message}
                                  </p>
                                ) : (
                                  <p>
                                    {integration.status
                                      .replace("_", " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    {integration.last_sync &&
                                      ` since ${new Date(integration.last_sync).toLocaleDateString()}`}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {integration.last_sync ? (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatLastSync(integration.last_sync)}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex max-w-[200px] flex-wrap gap-1">
                                  {dataPoints.length > 0 ? (
                                    <>
                                      {dataPoints.slice(0, 3).map((dp, i) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="text-xs dark:border-border"
                                        >
                                          {dp}
                                        </Badge>
                                      ))}
                                      {dataPoints.length > 3 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs dark:border-border"
                                        >
                                          +{dataPoints.length - 3} more
                                        </Badge>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      No data synced
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="dark:border-border dark:bg-popover"
                              >
                                {dataPoints.length > 0 ? (
                                  <ul className="list-inside list-disc text-xs">
                                    {dataPoints.map((dp, i) => (
                                      <li key={i}>{dp}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs">
                                    No data points synced yet
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="dark:border-border dark:bg-popover"
                              >
                                <DropdownMenuLabel>Manage</DropdownMenuLabel>
                                {integration.status === "disconnected" ? (
                                  <DropdownMenuItem
                                    onClick={() => router.push("/klaviyo")}
                                  >
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Connect
                                  </DropdownMenuItem>
                                ) : (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => router.push("/klaviyo")}
                                    >
                                      <Settings className="mr-2 h-4 w-4" />
                                      Configure Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleSync(integration.id)}
                                      disabled={
                                        integration.status === "syncing"
                                      }
                                    >
                                      <RefreshCw
                                        className={`mr-2 h-4 w-4 ${
                                          integration.status === "syncing"
                                            ? "animate-spin"
                                            : ""
                                        }`}
                                      />
                                      Trigger Manual Sync
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Activity className="mr-2 h-4 w-4" />
                                      View Sync Logs
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {integration.status === "needs_attention" && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={() => handleSync(integration.id)}
                                  >
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Resolve Issue
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="dark:bg-border" />
                                {integration.status !== "disconnected" && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={() =>
                                      handleDisconnect(integration.id)
                                    }
                                  >
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
                    <TableRow className="dark:border-border">
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        {!isLoading &&
                          (searchQuery ||
                          statusFilter !== "all" ||
                          categoryFilter !== "all" ? (
                            <>
                              No integrations found matching your filters.
                              <Button
                                variant="link"
                                onClick={() => {
                                  setSearchQuery("");
                                  setStatusFilter("all");
                                  setCategoryFilter("all");
                                }}
                              >
                                Clear filters
                              </Button>
                            </>
                          ) : (
                            <>
                              You haven't connected any integrations yet.
                              <Button variant="link" onClick={handleAddSource}>
                                Add your first integration
                              </Button>
                            </>
                          ))}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredIntegrations.length} of {integrations.length}{" "}
              integrations
            </div>
            <Button variant="ghost" onClick={handleAddSource}>
              View Integration Marketplace
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Recommended Integrations */}
        <Card className="border bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:border-border dark:bg-gradient-to-r dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Discover New Integrations
            </CardTitle>
            <CardDescription>
              Expand your platform's capabilities by connecting more tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card">
                <div className="mb-2 flex justify-center">
                  <Avatar className="h-10 w-10 border dark:border-border">
                    <AvatarFallback className="bg-muted dark:bg-muted">
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h4 className="mb-1 text-center text-sm font-medium">
                  Shopify
                </h4>
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  Connect your e-commerce store
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full dark:border-border"
                  onClick={handleAddSource}
                >
                  Connect
                </Button>
              </div>
              <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-border dark:bg-card">
                <div className="mb-2 flex justify-center">
                  <Avatar className="h-10 w-10 border dark:border-border">
                    <AvatarFallback className="bg-muted dark:bg-muted">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h4 className="mb-1 text-center text-sm font-medium">
                  Google Analytics
                </h4>
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  Track website analytics
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full dark:border-border"
                  onClick={handleAddSource}
                >
                  Connect
                </Button>
              </div>
              {/* More recommended integrations */}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleAddSource}>
              Explore Integration Marketplace
            </Button>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default IntegrationsContent;
