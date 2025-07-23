"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { posthog } from "../../lib/posthog";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Bell,
  Calendar,
  DollarSign,
  Handshake,
  Users,
  BarChart3,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
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
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AICRMSwipeableCards from "./components/swipeable-cards";
import SalesPerformanceCard from "./components/chart";
import { TopPerformingCohortCard } from "./components/top-cohorts";
import LeadChannelPerformance from "./components/lead-performace";
import FollowUpsTracker from "./components/follow-ups";
import SessionReplayViewer from "../../components/SessionReplayViewer";
import WebAnalyticsViewer from "../../components/WebAnalyticsViewer";

const salesData = {
  week: [
    { name: "Mon", revenue: 4000, profit: 2400 },
    { name: "Tue", revenue: 3000, profit: 1398 },
    { name: "Wed", revenue: 5000, profit: 3000 },
    { name: "Thu", revenue: 2780, profit: 1908 },
    { name: "Fri", revenue: 7890, profit: 4800 },
    { name: "Sat", revenue: 2390, profit: 1200 },
    { name: "Sun", revenue: 3490, profit: 2300 },
  ],
  month: [
    { name: "Week 1", revenue: 24000, profit: 12000 },
    { name: "Week 2", revenue: 32000, profit: 17000 },
    { name: "Week 3", revenue: 28000, profit: 14500 },
    { name: "Week 4", revenue: 39000, profit: 21000 },
  ],
  quarter: [
    { name: "Jan", revenue: 85000, profit: 42000 },
    { name: "Feb", revenue: 78000, profit: 38000 },
    { name: "Mar", revenue: 109000, profit: 54000 },
  ],
  year: [
    { name: "Q1", revenue: 272000, profit: 134000 },
    { name: "Q2", revenue: 309000, profit: 156000 },
    { name: "Q3", revenue: 289000, profit: 142000 },
    { name: "Q4", revenue: 352000, profit: 184000 },
  ],
};

// Mock data for dashboard stats
const overviewStats = [
  {
    title: "Total Revenue",
    value: "$352,924",
    change: 12.5,
    trend: "up",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    title: "Accounts",
    value: "18,672",
    change: 9.1,
    trend: "up",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Deals Closed",
    value: "2,845",
    change: 4.3,
    trend: "up",
    icon: <Handshake className="h-4 w-4" />,
  },
  {
    title: "Conversion Rate",
    value: "3.9%",
    change: -0.8,
    trend: "down",
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

// Mock data for recent orders
const recentOrders = [
  {
    id: "ORD-7291",
    customer: "Emma Johnson",
    date: "Mar 28, 2025",
    amount: "$352.40",
    status: "completed",
    items: 5,
  },
  {
    id: "ORD-7290",
    customer: "James Wilson",
    date: "Mar 28, 2025",
    amount: "$98.20",
    status: "processing",
    items: 2,
  },
  {
    id: "ORD-7289",
    customer: "Olivia Martinez",
    date: "Mar 27, 2025",
    amount: "$185.70",
    status: "completed",
    items: 3,
  },
  {
    id: "ORD-7288",
    customer: "Noah Brown",
    date: "Mar 27, 2025",
    amount: "$432.10",
    status: "completed",
    items: 6,
  },
  {
    id: "ORD-7287",
    customer: "Sophia Davis",
    date: "Mar 26, 2025",
    amount: "$276.90",
    status: "processing",
    items: 4,
  },
];

// Mock data for channel performance
const channelPerformance = [
  { channel: "Website", sales: 142500, percentage: 45 },
  { channel: "Mobile App", sales: 89400, percentage: 28 },
  { channel: "Marketplaces", sales: 56800, percentage: 18 },
  { channel: "Social Commerce", sales: 28500, percentage: 9 },
];

// Mock data for notifications
const notifications = [
  {
    id: 1,
    type: "alert",
    message: 'Inventory low for "Summer Dress Collection" (5 items remaining)',
    time: "25 minutes ago",
    icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
  },
  {
    id: 2,
    type: "success",
    message: "Your API integration with Shopify was completed successfully",
    time: "2 hours ago",
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
  },
  {
    id: 3,
    type: "alert",
    message: "New feature available: AI-powered product recommendations",
    time: "Yesterday",
    icon: <Bell className="h-4 w-4 text-blue-500" />,
  },
];

// Mock data for tasks
const tasks = [
  {
    id: 1,
    title: "Review inventory restock orders",
    due: "Today",
    priority: "high",
    completed: false,
  },
  {
    id: 2,
    title: "Set up seasonal sale campaign",
    due: "Tomorrow",
    priority: "medium",
    completed: false,
  },
  {
    id: 3,
    title: "Approve new product listings",
    due: "Mar 31, 2025",
    priority: "medium",
    completed: true,
  },
  {
    id: 4,
    title: "Review customer feedback reports",
    due: "Apr 2, 2025",
    priority: "low",
    completed: false,
  },
];

// Mock data for target metrics
const targetMetrics = [
  {
    name: "Monthly Sales",
    current: 352924,
    target: 400000,
    percentage: 88,
  },
  {
    name: "New Customers",
    current: 842,
    target: 1000,
    percentage: 84,
  },
  {
    name: "Average Order Value",
    current: 124,
    target: 150,
    percentage: 83,
  },
];

const HomeContent: React.FC = () => {
  const [timeRange, setTimeRange] = useState("month");

  // Track page view and interactions with PostHog
  useEffect(() => {
    posthog.capture("dashboard_viewed", {
      page: "home_dashboard",
      time_range: timeRange,
    });
  }, [timeRange]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    posthog.capture("time_range_changed", {
      previous_range: timeRange,
      new_range: value,
    });
  };

  const handleGenerateReport = () => {
    posthog.capture("generate_report_clicked", {
      time_range: timeRange,
    });
  };

  const handleRefresh = () => {
    posthog.capture("dashboard_refresh_clicked", {
      time_range: timeRange,
    });
  };

  const handleDownload = () => {
    posthog.capture("dashboard_download_clicked", {
      time_range: timeRange,
    });
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Page header with date selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Dashboard
          </h1>
          <p className="text-slate-600">
            Welcome back. Here's an overview of your store's performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border px-3 py-2">
            <Calendar className="mr-2 h-4 w-4 opacity-50" />
            <Select
              defaultValue={timeRange}
              onValueChange={handleTimeRangeChange}
            >
              <SelectTrigger className="h-auto w-[120px] border-0 p-0 shadow-none focus:ring-0">
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
          <Button
            variant="outline"
            size="icon"
            className="bg-transparent shadow-none hover:bg-slate-100"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 text-black" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-transparent shadow-none hover:bg-slate-100"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 text-black" />
          </Button>

          {/* Session Replay Viewer - This goes in the red circle area */}
          <SessionReplayViewer />

          <Button
            className="bg-transparent text-black shadow-none hover:bg-slate-100"
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, index) => (
          <Card
            className="cursor-pointer border-slate-200 bg-white shadow-none transition-shadow hover:shadow-sm"
            key={index}
            onClick={() =>
              posthog.capture("stat_card_clicked", {
                stat_title: stat.title,
                stat_value: stat.value,
              })
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="rounded-full bg-muted p-1">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center pt-1 text-xs">
                <span
                  className={`flex items-center ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(stat.change)}%
                </span>
                <span className="ml-2 text-muted-foreground">
                  compared to last {timeRange}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Sections - 1 column */}
      <div className="grid grid-cols-1 gap-6">
        <WebAnalyticsViewer />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 gap-6 shadow-none lg:grid-cols-3">
        {/* Left Side - Performance Charts and Recent Orders */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Performance Charts */}
          <div className="h-auto">
            <SalesPerformanceCard />
          </div>

          <div className="h-auto">
            <TopPerformingCohortCard />
          </div>
        </div>

        {/* Right Side - Target Metrics and Notifications */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Target Metrics */}
          <div className="h-auto">
            <AICRMSwipeableCards />
          </div>

          {/* Notifications */}
          <div className="h-auto">
            <FollowUpsTracker />
          </div>
        </div>
      </div>

      {/* Bottom Sections - 1 column */}
      <div className="grid grid-cols-1 gap-6">
        <LeadChannelPerformance />
      </div>
    </div>
  );
};

export default HomeContent;
