"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Bell,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  BarChart3,
  RefreshCw,
  Download,
  TrendingUp,
  HelpCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const salesData = {
  week: [
    { name: 'Mon', revenue: 4000, profit: 2400 },
    { name: 'Tue', revenue: 3000, profit: 1398 },
    { name: 'Wed', revenue: 5000, profit: 3000 },
    { name: 'Thu', revenue: 2780, profit: 1908 },
    { name: 'Fri', revenue: 7890, profit: 4800 },
    { name: 'Sat', revenue: 2390, profit: 1200 },
    { name: 'Sun', revenue: 3490, profit: 2300 },
  ],
  month: [
    { name: 'Week 1', revenue: 24000, profit: 12000 },
    { name: 'Week 2', revenue: 32000, profit: 17000 },
    { name: 'Week 3', revenue: 28000, profit: 14500 },
    { name: 'Week 4', revenue: 39000, profit: 21000 },
  ],
  quarter: [
    { name: 'Jan', revenue: 85000, profit: 42000 },
    { name: 'Feb', revenue: 78000, profit: 38000 },
    { name: 'Mar', revenue: 109000, profit: 54000 },
  ],
  year: [
    { name: 'Q1', revenue: 272000, profit: 134000 },
    { name: 'Q2', revenue: 309000, profit: 156000 },
    { name: 'Q3', revenue: 289000, profit: 142000 },
    { name: 'Q4', revenue: 352000, profit: 184000 },
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
    title: "Orders",
    value: "2,845",
    change: 4.3,
    trend: "up",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  {
    title: "Customers",
    value: "18,672",
    change: 9.1,
    trend: "up",
    icon: <Users className="h-4 w-4" />,
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

  return (
    <div className="space-y-6 bg-gray-50">
      {/* Page header with date selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back. Here's an overview of your store's performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border px-3 py-2">
            <Calendar className="mr-2 h-4 w-4 opacity-50" />
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
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
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, index) => (
          <Card className="border-gray-200 bg-white" key={index}>
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
                  className={`flex items-center ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
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

     {/* Main Dashboard Content */}
<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
  {/* Performance Charts */}
  <Card className="border-gray-200 bg-white lg:col-span-2">
    <CardHeader>
      <CardTitle className="text-gray-800">Sales Performance</CardTitle>
      <CardDescription className="text-gray-600">
        Revenue overview for{" "}
        {timeRange === "month"
          ? "this month"
          : timeRange === "week"
            ? "this week"
            : timeRange === "quarter"
              ? "this quarter"
              : "this year"}
      </CardDescription>
    </CardHeader>
    <CardContent className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={salesData[timeRange]}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6B7280' }} 
            axisLine={{ stroke: '#E5E7EB' }} 
          />
          <YAxis 
            tick={{ fill: '#6B7280' }} 
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `$${value/1000}k`} 
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#F9FAFB', 
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              color: '#374151'
            }} 
            formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px', color: '#4B5563' }} 
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#colorProfit)"
            name="Profit"
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
    <CardFooter className="border-t border-gray-200 px-6 py-4">
      <div className="flex w-full items-center justify-between">
        <Button
          variant="ghost"
          className="text-xs text-gray-200 hover:text-gray-800"
        >
          Previous Period
        </Button>
        <Tabs defaultValue="daily" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger 
              value="daily" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-800"
            >
              Daily
            </TabsTrigger>
            <TabsTrigger 
              value="weekly"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-800"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger 
              value="monthly"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-800"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger 
              value="yearly"
              className="data-[state=active]:bg-white data-[state=active]:text-gray-800"
            >
              Yearly
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          className="text-xs text-gray-200 hover:text-gray-800"
        >
          Next Period
        </Button>
      </div>
    </CardFooter>
  </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Target Metrics */}
          <Card className="border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Target Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {targetMetrics.map((metric, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">{metric.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${metric.current.toLocaleString()} / $
                      {metric.target.toLocaleString()}
                    </div>
                  </div>
                  <Progress value={metric.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help Me Reach Targets
              </Button>
            </CardFooter>
          </Card>

          {/* Notifications */}
          <Card className="border-gray-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Notifications
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bell className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Mark all as read</DropdownMenuItem>
                  <DropdownMenuItem>Notification settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-2 p-0">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start border-b px-6 py-3 last:border-0 hover:bg-muted/50"
                >
                  <div className="mr-2 mt-0.5">{notification.icon}</div>
                  <div>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t p-0">
              <Button variant="ghost" className="h-10 w-full rounded-none">
                View All Notifications
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Bottom Sections - 2 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders across all your sales channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-100/50">
                    <th className="px-4 py-3 text-left font-medium">Order</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200">
                      <td className="px-4 py-3">
                        <div className="font-medium">{order.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.date}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.customer}
                        <div className="text-xs text-muted-foreground">
                          {order.items} items
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">View Order History</Button>
            <Button>
              Process Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Channel Performance */}
        <Card className="border-gray-200 bg-white">
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>
              Sales distribution across your channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channelPerformance.map((channel, index) => (
                <div key={index}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-sm font-medium">{channel.channel}</div>
                    <div className="text-sm text-muted-foreground">
                      ${channel.sales.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={channel.percentage} className="h-2" />
                    <div className="w-8 text-xs text-muted-foreground">
                      {channel.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">View Channel Details</Button>
            <Button>
              Optimize Channels
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HomeContent;

