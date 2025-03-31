"use client";

import React, { useState } from 'react';
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
  CheckCircle
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for dashboard stats
const overviewStats = [
  { 
    title: 'Total Revenue',
    value: '$352,924',
    change: 12.5,
    trend: 'up',
    icon: <DollarSign className="h-4 w-4" />
  },
  { 
    title: 'Orders',
    value: '2,845',
    change: 4.3,
    trend: 'up',
    icon: <ShoppingBag className="h-4 w-4" />
  },
  { 
    title: 'Customers',
    value: '18,672',
    change: 9.1,
    trend: 'up',
    icon: <Users className="h-4 w-4" />
  },
  { 
    title: 'Conversion Rate',
    value: '3.9%',
    change: -0.8,
    trend: 'down',
    icon: <BarChart3 className="h-4 w-4" />
  },
];

// Mock data for recent orders
const recentOrders = [
  { 
    id: 'ORD-7291',
    customer: 'Emma Johnson',
    date: 'Mar 28, 2025',
    amount: '$352.40',
    status: 'completed',
    items: 5
  },
  { 
    id: 'ORD-7290',
    customer: 'James Wilson',
    date: 'Mar 28, 2025',
    amount: '$98.20',
    status: 'processing',
    items: 2
  },
  { 
    id: 'ORD-7289',
    customer: 'Olivia Martinez',
    date: 'Mar 27, 2025',
    amount: '$185.70',
    status: 'completed',
    items: 3
  },
  { 
    id: 'ORD-7288',
    customer: 'Noah Brown',
    date: 'Mar 27, 2025',
    amount: '$432.10',
    status: 'completed',
    items: 6
  },
  { 
    id: 'ORD-7287',
    customer: 'Sophia Davis',
    date: 'Mar 26, 2025',
    amount: '$276.90',
    status: 'processing',
    items: 4
  },
];

// Mock data for channel performance
const channelPerformance = [
  { channel: 'Website', sales: 142500, percentage: 45 },
  { channel: 'Mobile App', sales: 89400, percentage: 28 },
  { channel: 'Marketplaces', sales: 56800, percentage: 18 },
  { channel: 'Social Commerce', sales: 28500, percentage: 9 },
];

// Mock data for notifications
const notifications = [
  {
    id: 1,
    type: 'alert',
    message: 'Inventory low for "Summer Dress Collection" (5 items remaining)',
    time: '25 minutes ago',
    icon: <AlertCircle className="h-4 w-4 text-amber-500" />
  },
  {
    id: 2,
    type: 'success',
    message: 'Your API integration with Shopify was completed successfully',
    time: '2 hours ago',
    icon: <CheckCircle className="h-4 w-4 text-green-500" />
  },
  {
    id: 3,
    type: 'alert',
    message: 'New feature available: AI-powered product recommendations',
    time: 'Yesterday',
    icon: <Bell className="h-4 w-4 text-blue-500" />
  },
];

// Mock data for tasks
const tasks = [
  {
    id: 1,
    title: 'Review inventory restock orders',
    due: 'Today',
    priority: 'high',
    completed: false
  },
  {
    id: 2,
    title: 'Set up seasonal sale campaign',
    due: 'Tomorrow',
    priority: 'medium',
    completed: false
  },
  {
    id: 3,
    title: 'Approve new product listings',
    due: 'Mar 31, 2025',
    priority: 'medium',
    completed: true
  },
  {
    id: 4,
    title: 'Review customer feedback reports',
    due: 'Apr 2, 2025',
    priority: 'low',
    completed: false
  },
];

// Mock data for target metrics
const targetMetrics = [
  {
    name: 'Monthly Sales',
    current: 352924,
    target: 400000,
    percentage: 88
  },
  {
    name: 'New Customers',
    current: 842,
    target: 1000,
    percentage: 84
  },
  {
    name: 'Average Order Value',
    current: 124,
    target: 150,
    percentage: 83
  }
];

const HomeContent: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  return (
    <div className="space-y-6">
      {/* Page header with date selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back. Here's an overview of your store's performance.
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
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="rounded-full bg-muted p-1">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center pt-1 text-xs">
                <span className={`flex items-center ${
                  stat.trend === 'up' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stat.change)}%
                </span>
                <span className="text-muted-foreground ml-2">
                  compared to last {timeRange}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Charts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>
              Revenue overview for {timeRange === 'month' ? 'this month' : timeRange === 'week' ? 'this week' : timeRange === 'quarter' ? 'this quarter' : 'this year'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="h-full w-full flex items-center justify-center">
              <TrendingUp size={48} className="text-muted-foreground opacity-50" />
              <p className="ml-2 text-muted-foreground">Sales chart visualization goes here</p>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-between items-center w-full">
              <Button variant="ghost" className="text-xs text-muted-foreground hover:text-primary">
                Previous Period
              </Button>
              <Tabs defaultValue="daily" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="ghost" className="text-xs text-muted-foreground hover:text-primary">
                Next Period
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Target Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Target Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {targetMetrics.map((metric, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">{metric.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${metric.current.toLocaleString()} / ${metric.target.toLocaleString()}
                    </div>
                  </div>
                  <Progress value={metric.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Me Reach Targets
              </Button>
            </CardFooter>
          </Card>

          {/* Notifications */}
          <Card>
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
                  className="flex items-start px-6 py-3 hover:bg-muted/50 border-b last:border-0"
                >
                  <div className="mr-2 mt-0.5">
                    {notification.icon}
                  </div>
                  <div>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t p-0">
              <Button variant="ghost" className="w-full rounded-none h-10">
                View All Notifications
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Bottom Sections - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
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
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Order</th>
                    <th className="py-3 px-4 text-left font-medium">Customer</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="font-medium">{order.id}</div>
                        <div className="text-xs text-muted-foreground">{order.date}</div>
                      </td>
                      <td className="py-3 px-4">
                        {order.customer}
                        <div className="text-xs text-muted-foreground">{order.items} items</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{order.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">
              View Order History
            </Button>
            <Button>
              Process Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Channel Performance */}
        <Card>
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
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{channel.channel}</div>
                    <div className="text-sm text-muted-foreground">${channel.sales.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={channel.percentage} className="h-2" />
                    <div className="text-muted-foreground text-xs w-8">
                      {channel.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">
              View Channel Details
            </Button>
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