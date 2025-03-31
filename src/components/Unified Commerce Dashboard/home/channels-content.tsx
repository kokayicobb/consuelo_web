"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  Filter, 
  RefreshCw, 
  Calendar, 
  Download 
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for sales chart component
const channelData = [
  { name: 'Website', sales: 42500, change: 12.3, color: '#8884d8' },
  { name: 'Amazon', sales: 37800, change: 8.6, color: '#FF9900' },
  { name: 'Shopify', sales: 31200, change: -2.1, color: '#96bf48' },
  { name: 'Etsy', sales: 24900, change: 15.4, color: '#F56400' },
  { name: 'eBay', sales: 18400, change: -4.7, color: '#e53238' },
  { name: 'Instagram', sales: 14200, change: 22.8, color: '#C13584' },
  { name: 'TikTok Shop', sales: 9800, change: 33.1, color: '#000000' },
];

// Mock data for performance metrics
const performanceMetrics = [
  { 
    title: 'Total Sales',
    value: '$178,800',
    change: 12.3,
    trend: 'up',
    description: 'Across all channels this month'
  },
  { 
    title: 'Conversion Rate',
    value: '4.2%',
    change: 0.8,
    trend: 'up',
    description: 'Average across channels'
  },
  { 
    title: 'Avg. Order Value',
    value: '$67.50',
    change: -1.3,
    trend: 'down',
    description: 'Compared to previous month'
  },
  { 
    title: 'Return Rate',
    value: '3.8%',
    change: -0.5,
    trend: 'up',
    description: 'Positive trend (lower returns)'
  },
];

// Mock data for top products table
const topProducts = [
  { id: 1, name: 'Summer Breeze Dress', channel: 'Website', sales: 4250, price: '$89.99' },
  { id: 2, name: 'Urban Classic Jeans', channel: 'Amazon', sales: 3890, price: '$64.99' },
  { id: 3, name: 'Vintage Tee Collection', channel: 'Shopify', sales: 3540, price: '$29.99' },
  { id: 4, name: 'Athleisure Set', channel: 'Instagram', sales: 3210, price: '$74.99' },
  { id: 5, name: 'Boho Blouse', channel: 'Etsy', sales: 2980, price: '$44.99' },
];

// Mock data for channel insights
const channelInsights = [
  { 
    channel: 'Website', 
    insight: 'Traffic increased 15% after latest SEO optimization',
    action: 'Consider more investment in SEO and content marketing'
  },
  { 
    channel: 'Amazon', 
    insight: 'Product reviews have declined by 8% this month',
    action: 'Implement post-purchase email sequence for reviews'
  },
  { 
    channel: 'TikTok Shop', 
    insight: 'Highest growth rate among all channels (+33%)',
    action: 'Increase ad budget and influencer partnerships'
  },
  { 
    channel: 'eBay', 
    insight: 'Seeing negative growth despite marketplace growth',
    action: 'Review pricing strategy and listing quality'
  },
];

const ChannelsContent: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  return (
    <div className="space-y-6">
      {/* Page header with action buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Channel Performance</h1>
          <p className="text-muted-foreground">
            Monitor and optimize your multi-channel sales performance
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
            Generate Report
          </Button>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`text-sm flex items-center ${
                metric.trend === 'up' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(metric.change)}%
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channel Breakdown</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Channel Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Sales Distribution</CardTitle>
              <CardDescription>
                Sales breakdown across all channels for {timeRange === 'month' ? 'this month' : timeRange === 'week' ? 'this week' : timeRange === 'quarter' ? 'this quarter' : 'this year'}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full w-full flex items-center justify-center">
                <BarChart3 size={48} className="text-muted-foreground opacity-50" />
                <p className="ml-2 text-muted-foreground">Channel sales chart visualization goes here</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Top Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>
                Best selling products across all channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Product</th>
                      <th className="py-3 px-4 text-left font-medium">Channel</th>
                      <th className="py-3 px-4 text-left font-medium">Sales</th>
                      <th className="py-3 px-4 text-left font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.channel}</td>
                        <td className="py-3 px-4">${product.sales.toLocaleString()}</td>
                        <td className="py-3 px-4">{product.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="link" className="gap-1">
                  View All Products
                  <ExternalLink size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="channels" className="space-y-4">
          {/* Channel Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance Details</CardTitle>
              <CardDescription>
                Detailed metrics for each sales channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Channel</th>
                      <th className="py-3 px-4 text-left font-medium">Sales</th>
                      <th className="py-3 px-4 text-left font-medium">Change</th>
                      <th className="py-3 px-4 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelData.map((channel, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: channel.color }}
                          />
                          {channel.name}
                        </td>
                        <td className="py-3 px-4">${channel.sales.toLocaleString()}</td>
                        <td className={`py-3 px-4 ${channel.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="flex items-center">
                            {channel.change >= 0 ? (
                              <ArrowUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDown className="h-4 w-4 mr-1" />
                            )}
                            {Math.abs(channel.change)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="link" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          {/* Placeholder for Products Tab Content */}
          <Card>
            <CardHeader>
              <CardTitle>Products Performance</CardTitle>
              <CardDescription>
                Performance analysis by product across all channels
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <p className="text-muted-foreground">Products performance content goes here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          {/* Channel Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Channel Insights & Recommendations</CardTitle>
              <CardDescription>
                AI-powered insights to optimize your channel strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelInsights.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-semibold text-sm">{item.channel}</div>
                    <div className="mt-2">{item.insight}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">Recommended Action:</span> {item.action}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChannelsContent;