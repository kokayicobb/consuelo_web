"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  User,
  Users,
  DollarSign,
  ShoppingBag,
  Repeat,
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  Mail,
  Phone,
  Globe,
  PieChart,
  BarChart,
  TrendingUp,
  Plus,
  MoreHorizontal,
  MessageSquare,
  Send,
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

import SupabaseCustomerTable from "./components/supabase-data-table";

// Mock data for customer metrics
const customerMetrics = [
  {
    title: "Total Accounts",
    value: "18,672",
    change: 9.1,
    trend: "up",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Average Order Value",
    value: "$124.85",
    change: 3.2,
    trend: "up",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    title: "Repeat Purchase Rate",
    value: "42.3%",
    change: 5.7,
    trend: "up",
    icon: <Repeat className="h-4 w-4" />,
  },
  {
    title: "Account Lifetime Value",
    value: "$854.20",
    change: -1.8,
    trend: "down",
    icon: <User className="h-4 w-4" />,
  },
];

// Mock data for customer segments
const customerSegments = [
  {
    id: 1,
    name: "VIP",
    count: 562,
    spending: "$256,842",
    avgOrderValue: "$189.90",
    retention: "85%",
  },
  {
    id: 2,
    name: "Loyal",
    count: 2438,
    spending: "$498,721",
    avgOrderValue: "$125.35",
    retention: "72%",
  },
  {
    id: 3,
    name: "Regular",
    count: 5907,
    spending: "$589,432",
    avgOrderValue: "$88.75",
    retention: "61%",
  },
  {
    id: 4,
    name: "Occasional",
    count: 7821,
    spending: "$357,210",
    avgOrderValue: "$62.50",
    retention: "38%",
  },
  {
    id: 5,
    name: "At-Risk",
    count: 1944,
    spending: "$98,765",
    avgOrderValue: "$75.20",
    retention: "25%",
  },
];

// Mock data for customer list
const customers = [
  {
    id: "CUST-7291",
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    segment: "VIP",
    totalSpent: 4875.42,
    orders: 32,
    lastOrder: "Mar 26, 2025",
    avgOrderValue: 152.36,
    status: "active",
    avatar: "/avatars/emma.jpg",
  },
  {
    id: "CUST-6532",
    name: "James Wilson",
    email: "james.wilson@example.com",
    phone: "+1 (555) 234-5678",
    location: "Los Angeles, CA",
    segment: "Loyal",
    totalSpent: 3241.87,
    orders: 28,
    lastOrder: "Mar 24, 2025",
    avgOrderValue: 115.78,
    status: "active",
    avatar: "/avatars/james.jpg",
  },
  {
    id: "CUST-5478",
    name: "Olivia Martinez",
    email: "olivia.martinez@example.com",
    phone: "+1 (555) 345-6789",
    location: "Chicago, IL",
    segment: "At-Risk",
    totalSpent: 1876.25,
    orders: 17,
    lastOrder: "Mar 20, 2025",
    avgOrderValue: 110.37,
    status: "active",
    avatar: "/avatars/olivia.jpg",
  },
  {
    id: "CUST-4123",
    name: "Noah Brown",
    email: "noah.brown@example.com",
    phone: "+1 (555) 456-7890",
    location: "Miami, FL",
    segment: "VIP",
    totalSpent: 6254.75,
    orders: 41,
    lastOrder: "Mar 28, 2025",
    avgOrderValue: 152.55,
    status: "active",
    avatar: "/avatars/noah.jpg",
  },
  {
    id: "CUST-3987",
    name: "Sophia Davis",
    email: "sophia.davis@example.com",
    phone: "+1 (555) 567-8901",
    location: "Houston, TX",
    segment: "Occasional",
    totalSpent: 845.32,
    orders: 8,
    lastOrder: "Feb 15, 2025",
    avgOrderValue: 105.67,
    status: "inactive",
    avatar: "/avatars/sophia.jpg",
  },
  {
    id: "CUST-2754",
    name: "Liam Johnson",
    email: "liam.johnson@example.com",
    phone: "+1 (555) 678-9012",
    location: "Boston, MA",
    segment: "Loyal",
    totalSpent: 3578.65,
    orders: 26,
    lastOrder: "Mar 22, 2025",
    avgOrderValue: 137.64,
    status: "active",
    avatar: "/avatars/liam.jpg",
  },
  {
    id: "CUST-1689",
    name: "Ava Williams",
    email: "ava.williams@example.com",
    phone: "+1 (555) 789-0123",
    location: "Seattle, WA",
    segment: "At-Risk",
    totalSpent: 1245.8,
    orders: 12,
    lastOrder: "Jan 18, 2025",
    avgOrderValue: 103.82,
    status: "inactive",
    avatar: "/avatars/ava.jpg",
  },
  {
    id: "CUST-1456",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "+1 (555) 890-1234",
    location: "Denver, CO",
    segment: "Regular",
    totalSpent: 2187.45,
    orders: 19,
    lastOrder: "Mar 10, 2025",
    avgOrderValue: 115.13,
    status: "active",
    avatar: "/avatars/michael.jpg",
  },
  {
    id: "CUST-1234",
    name: "Isabella Garcia",
    email: "isabella.garcia@example.com",
    phone: "+1 (555) 901-2345",
    location: "Phoenix, AZ",
    segment: "Occasional",
    totalSpent: 745.9,
    orders: 7,
    lastOrder: "Feb 28, 2025",
    avgOrderValue: 106.56,
    status: "active",
    avatar: "/avatars/isabella.jpg",
  },
  {
    id: "CUST-1098",
    name: "William Smith",
    email: "william.smith@example.com",
    phone: "+1 (555) 012-3456",
    location: "Atlanta, GA",
    segment: "VIP",
    totalSpent: 5487.25,
    orders: 37,
    lastOrder: "Mar 27, 2025",
    avgOrderValue: 148.31,
    status: "active",
    avatar: "/avatars/william.jpg",
  },
];

// Mock data for customer acquisition sources
const acquisitionSources = [
  { source: "Organic Search", percentage: 32, count: 5975 },
  { source: "Direct", percentage: 24, count: 4482 },
  { source: "Social Media", percentage: 18, count: 3362 },
  { source: "Email Campaigns", percentage: 12, count: 2241 },
  { source: "Referrals", percentage: 8, count: 1494 },
  { source: "Paid Ads", percentage: 6, count: 1120 },
];

// Mock data for feedback & reviews
const customerFeedback = [
  {
    id: 1,
    customer: "Emma Thompson",
    avatar: "/avatars/emma.jpg",
    rating: 5,
    comment:
      "Absolutely love the quality of the products! The delivery was also faster than expected.",
    date: "Mar 27, 2025",
    product: "Summer Breeze Dress",
  },
  {
    id: 2,
    customer: "James Wilson",
    avatar: "/avatars/james.jpg",
    rating: 4,
    comment: "Great product, fits perfectly. Would definitely shop here again.",
    date: "Mar 26, 2025",
    product: "Classic Denim Jeans",
  },
  {
    id: 3,
    customer: "Olivia Martinez",
    avatar: "/avatars/olivia.jpg",
    rating: 3,
    comment:
      "Product is good, but took longer than expected to arrive. Would appreciate faster shipping options.",
    date: "Mar 25, 2025",
    product: "Vintage Graphic Tee",
  },
  {
    id: 4,
    customer: "Noah Brown",
    avatar: "/avatars/noah.jpg",
    rating: 5,
    comment:
      "Exceptional quality and customer service. The attention to detail is impressive!",
    date: "Mar 24, 2025",
    product: "Premium Athleisure Set",
  },
];

// Mock data for customer retention over time
const retentionData = [
  { month: "Jan 2025", rate: 68 },
  { month: "Feb 2025", rate: 71 },
  { month: "Mar 2025", rate: 74 },
];

// Customer profile for detailed view
const selectedCustomer = customers[0];

// Mock data for selected customer's order history
const customerOrders = [
  {
    id: "ORD-8721",
    date: "Mar 26, 2025",
    items: 3,
    total: "$245.80",
    status: "Delivered",
  },
  {
    id: "ORD-7845",
    date: "Mar 12, 2025",
    items: 2,
    total: "$187.45",
    status: "Delivered",
  },
  {
    id: "ORD-6932",
    date: "Feb 28, 2025",
    items: 4,
    total: "$318.90",
    status: "Delivered",
  },
  {
    id: "ORD-6021",
    date: "Feb 15, 2025",
    items: 1,
    total: "$89.99",
    status: "Delivered",
  },
  {
    id: "ORD-5476",
    date: "Jan 30, 2025",
    items: 2,
    total: "$167.80",
    status: "Delivered",
  },
];

const CustomersContent: React.FC = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all-customers");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  // Filter customers based on search, segment, and status
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchQuery === "" ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSegment =
      segmentFilter === "all" ||
      customer.segment.toLowerCase() === segmentFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      customer.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesSegment && matchesStatus;
  });

  const viewCustomerProfile = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setActiveTab("customer-profile");
  };

  const backToCustomerList = () => {
    setSelectedCustomerId(null);
    setActiveTab("all-customers");
  };

  // Find the selected customer based on ID
  const customerProfile = selectedCustomerId
    ? customers.find((customer) => customer.id === selectedCustomerId)
    : null;

  return (
    <div className="space-y-6">
      {/* Page header with action buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Understand your clients and build stronger relationships
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
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          {activeTab === "all-customers" && (
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Add Accounts
            </Button>
          )}
        </div>
      </div>

      {/* Customer Metrics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {customerMetrics.map((metric, index) => (
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
                  metric.trend === 'up' 
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
      </div> */}

      {/* Tabs for different customer views */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all-customers">All Accounts</TabsTrigger>
          <TabsTrigger value="segments">Leads</TabsTrigger>
          <TabsTrigger value="acquisition">Clients</TabsTrigger>
          <TabsTrigger value="feedback">Insights</TabsTrigger>
          {selectedCustomerId && (
            <TabsTrigger value="customer-profile">Customer Profile</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all-customers" className="space-y-4">
          <SupabaseCustomerTable />
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          {/* Customer Segments */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Segments Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Customer Segmentation</CardTitle>
                <CardDescription>
                  Visual breakdown of your customer segments
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full w-full items-center justify-center">
                  <PieChart
                    size={48}
                    className="text-muted-foreground opacity-50"
                  />
                  <p className="ml-2 text-muted-foreground">
                    Customer segmentation chart visualization
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Segment Distribution */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Segment Distribution</CardTitle>
                <CardDescription>
                  Percentage breakdown by segment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span>VIP</span>
                    </span>
                    <span>3%</span>
                  </div>
                  <Progress value={3} className="h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span>Loyal</span>
                    </span>
                    <span>13%</span>
                  </div>
                  <Progress value={13} className="h-1.5 bg-blue-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span>Regular</span>
                    </span>
                    <span>32%</span>
                  </div>
                  <Progress value={32} className="h-1.5 bg-green-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <span>Occasional</span>
                    </span>
                    <span>42%</span>
                  </div>
                  <Progress value={42} className="h-1.5 bg-amber-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span>At-Risk</span>
                    </span>
                    <span>10%</span>
                  </div>
                  <Progress value={10} className="h-1.5 bg-red-100" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Segments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>
                Detailed breakdown of customer segments and behaviors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead className="text-right">Customers</TableHead>
                    <TableHead className="text-right">Total Spending</TableHead>
                    <TableHead className="text-right">
                      Avg Order Value
                    </TableHead>
                    <TableHead className="text-right">Retention Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerSegments.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell>
                        <Badge
                          variant={
                            segment.name === "VIP"
                              ? "default"
                              : segment.name === "Loyal"
                                ? "secondary"
                                : segment.name === "At-Risk"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {segment.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {segment.count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {segment.spending}
                      </TableCell>
                      <TableCell className="text-right">
                        {segment.avgOrderValue}
                      </TableCell>
                      <TableCell className="text-right">
                        {segment.retention}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Customers
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button>
                Create Custom Segment
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="acquisition" className="space-y-4">
          {/* Customer Acquisition */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Acquisition Over Time */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>
                  Customer growth over time by source
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full w-full items-center justify-center">
                  <BarChart
                    size={48}
                    className="text-muted-foreground opacity-50"
                  />
                  <p className="ml-2 text-muted-foreground">
                    Customer acquisition chart visualization
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Acquisition Sources */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Acquisition Sources</CardTitle>
                <CardDescription>
                  Where your customers come from
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {acquisitionSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>{source.source}</span>
                      <span>{source.percentage}%</span>
                    </div>
                    <Progress value={source.percentage} className="h-1.5" />
                    <div className="text-right text-xs text-muted-foreground">
                      {source.count.toLocaleString()} customers
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Retention Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Retention</CardTitle>
              <CardDescription>
                Customer retention rates over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex h-60 items-center justify-center">
                <TrendingUp
                  size={48}
                  className="text-muted-foreground opacity-50"
                />
                <p className="ml-2 text-muted-foreground">
                  Customer retention chart visualization
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {retentionData.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center rounded-lg border p-4"
                  >
                    <div className="mb-2 text-sm text-muted-foreground">
                      {item.month}
                    </div>
                    <div className="mb-1 text-3xl font-bold">{item.rate}%</div>
                    <div className="text-sm">Retention Rate</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">View Detailed Metrics</Button>
              <Button>
                Create Retention Campaign
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {/* Customer Feedback & Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback & Reviews</CardTitle>
              <CardDescription>
                Recent product reviews and customer sentiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {customerFeedback.map((feedback) => (
                  <div key={feedback.id} className="rounded-lg border p-4">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage
                            src={feedback.avatar}
                            alt={feedback.customer}
                          />
                          <AvatarFallback>
                            {feedback.customer.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{feedback.customer}</div>
                          <div className="text-xs text-muted-foreground">
                            {feedback.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${i < feedback.rating ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div className="mb-1 text-sm font-medium">
                      {feedback.product}
                    </div>
                    <div className="text-sm">{feedback.comment}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing recent reviews from verified customers
              </div>
              <Button>
                View All Reviews
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="customer-profile" className="space-y-4">
          {customerProfile && (
            <>
              {/* Customer Profile Header */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={backToCustomerList}
                >
                  Back to Customer List
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Customer
                  </Button>
                  <Button size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </div>
              </div>

              {/* Customer Profile Overview */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Customer Info Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge
                        variant={
                          customerProfile.segment === "VIP"
                            ? "default"
                            : customerProfile.segment === "Loyal"
                              ? "secondary"
                              : customerProfile.segment === "At-Risk"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {customerProfile.segment}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                          <DropdownMenuItem>Change Segment</DropdownMenuItem>
                          <DropdownMenuItem>Merge Records</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center text-center">
                    <Avatar className="mb-4 h-24 w-24">
                      <AvatarImage
                        src={customerProfile.avatar}
                        alt={customerProfile.name}
                      />
                      <AvatarFallback>
                        {customerProfile.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">
                      {customerProfile.name}
                    </h2>
                    <div className="mb-4 text-sm text-muted-foreground">
                      {customerProfile.id}
                    </div>

                    <div className="w-full space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{customerProfile.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{customerProfile.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{customerProfile.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>Customer since Jan 2023</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>United States</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div
                      className={`flex w-full items-center justify-center gap-2 rounded-md py-2 ${
                        customerProfile.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          customerProfile.status === "active"
                            ? "bg-green-600"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <span className="text-sm font-medium capitalize">
                        {customerProfile.status}
                      </span>
                    </div>
                  </CardFooter>
                </Card>

                {/* Customer Stats */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Customer Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {/* Total Spent */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-1 text-sm text-muted-foreground">
                        Total Spent
                      </div>
                      <div className="text-2xl font-bold">
                        ${customerProfile.totalSpent.toFixed(2)}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Lifetime value
                      </div>
                    </div>

                    {/* Orders */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-1 text-sm text-muted-foreground">
                        Orders
                      </div>
                      <div className="text-2xl font-bold">
                        {customerProfile.orders}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Across all channels
                      </div>
                    </div>

                    {/* Avg Order Value */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-1 text-sm text-muted-foreground">
                        Avg Order Value
                      </div>
                      <div className="text-2xl font-bold">
                        ${customerProfile.avgOrderValue.toFixed(2)}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Last 12 months
                      </div>
                    </div>

                    {/* Activity Chart */}
                    <div className="rounded-lg border p-4 sm:col-span-3">
                      <div className="mb-2 text-sm font-medium">
                        Purchase Activity
                      </div>
                      <div className="flex h-36 items-center justify-center">
                        <TrendingUp
                          size={36}
                          className="text-muted-foreground opacity-50"
                        />
                        <p className="ml-2 text-sm text-muted-foreground">
                          Purchase history chart
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      Recent purchases and transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Items</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {order.id}
                            </TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell className="text-right">
                              {order.items}
                            </TableCell>
                            <TableCell className="text-right">
                              {order.total}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{order.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">View All Orders</Button>
                    <Button>
                      Create New Order
                      <Plus className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Send Message */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Customer Communication</CardTitle>
                    <CardDescription>
                      Send a message or note to this customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            Message Type
                          </div>
                          <Select defaultValue="email">
                            <SelectTrigger>
                              <SelectValue placeholder="Select message type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="note">
                                Internal Note
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Subject</div>
                          <Input placeholder="Message subject..." />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Message</div>
                        <Textarea
                          placeholder="Type your message here..."
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Save Draft</Button>
                    <Button>
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomersContent;
