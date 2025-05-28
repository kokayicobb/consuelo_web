"use client";

import React, { useState } from 'react';
import { 
  AlertCircle,
  ArrowRight, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  Download,
  Filter,
  Package,
  RefreshCw,
  Search,
  Truck,
  Tag,
  TrendingUp,
  BarChart3,
  ShoppingBag,
  Plus,
  Clipboard,
  Info
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for inventory stats
const inventoryStats = [
  { 
    title: 'Total Products',
    value: '1,254',
    change: 8.2,
    trend: 'up',
    icon: <Package className="h-4 w-4" />
  },
  { 
    title: 'Stock Value',
    value: '$875,432',
    change: 15.3,
    trend: 'up',
    icon: <Tag className="h-4 w-4" />
  },
  { 
    title: 'Low Stock Items',
    value: '37',
    change: -12.5,
    trend: 'down',
    icon: <AlertCircle className="h-4 w-4" />
  },
  { 
    title: 'Turnover Rate',
    value: '4.7x',
    change: 2.1,
    trend: 'up',
    icon: <TrendingUp className="h-4 w-4" />
  },
];

// Mock data for inventory items
const inventoryItems = [
  {
    id: 'SKU-7291',
    name: 'Summer Breeze Dress',
    category: 'Dresses',
    stock: 127,
    stockStatus: 'In Stock',
    threshold: 25,
    cost: 32.99,
    price: 89.99,
    value: 11428.73,
    sales30d: 98,
    lastRestock: 'Mar 10, 2025'
  },
  {
    id: 'SKU-5462',
    name: 'Classic Denim Jeans',
    category: 'Bottoms',
    stock: 215,
    stockStatus: 'In Stock',
    threshold: 40,
    cost: 24.50,
    price: 64.99,
    value: 13972.85,
    sales30d: 145,
    lastRestock: 'Mar 15, 2025'
  },
  {
    id: 'SKU-3871',
    name: 'Vintage Graphic Tee',
    category: 'Tops',
    stock: 89,
    stockStatus: 'In Stock',
    threshold: 30,
    cost: 12.75,
    price: 29.99,
    value: 2669.11,
    sales30d: 112,
    lastRestock: 'Mar 5, 2025'
  },
  {
    id: 'SKU-9023',
    name: 'Premium Athleisure Set',
    category: 'Activewear',
    stock: 18,
    stockStatus: 'Low Stock',
    threshold: 20,
    cost: 35.25,
    price: 74.99,
    value: 1349.82,
    sales30d: 87,
    lastRestock: 'Feb 28, 2025'
  },
  {
    id: 'SKU-6174',
    name: 'Boho Blouse',
    category: 'Tops',
    stock: 62,
    stockStatus: 'In Stock',
    threshold: 25,
    cost: 19.99,
    price: 44.99,
    value: 2789.38,
    sales30d: 72,
    lastRestock: 'Mar 8, 2025'
  },
  {
    id: 'SKU-2589',
    name: 'Structured Blazer',
    category: 'Outerwear',
    stock: 42,
    stockStatus: 'In Stock',
    threshold: 15,
    cost: 45.50,
    price: 119.99,
    value: 5039.58,
    sales30d: 38,
    lastRestock: 'Mar 1, 2025'
  },
  {
    id: 'SKU-4732',
    name: 'Leather Mini Skirt',
    category: 'Bottoms',
    stock: 9,
    stockStatus: 'Low Stock',
    threshold: 10,
    cost: 29.99,
    price: 59.99,
    value: 539.91,
    sales30d: 28,
    lastRestock: 'Feb 20, 2025'
  },
  {
    id: 'SKU-8156',
    name: 'Cashmere Sweater',
    category: 'Tops',
    stock: 5,
    stockStatus: 'Critical',
    threshold: 15,
    cost: 65.00,
    price: 149.99,
    value: 749.95,
    sales30d: 35,
    lastRestock: 'Jan 25, 2025'
  },
  {
    id: 'SKU-3095',
    name: 'Wide-Leg Trousers',
    category: 'Bottoms',
    stock: 37,
    stockStatus: 'In Stock',
    threshold: 20,
    cost: 32.75,
    price: 79.99,
    value: 2959.63,
    sales30d: 42,
    lastRestock: 'Mar 12, 2025'
  },
  {
    id: 'SKU-7415',
    name: 'Quilted Puffer Jacket',
    category: 'Outerwear',
    stock: 0,
    stockStatus: 'Out of Stock',
    threshold: 10,
    cost: 55.25,
    price: 129.99,
    value: 0,
    sales30d: 18,
    lastRestock: 'Jan 15, 2025'
  }
];

// Mock data for inventory categories
const categories = [
  { name: 'Tops', products: 326, value: 125980, percentStock: 28 },
  { name: 'Bottoms', products: 215, value: 98750, percentStock: 18 },
  { name: 'Dresses', products: 182, value: 145200, percentStock: 16 },
  { name: 'Outerwear', products: 157, value: 196350, percentStock: 14 },
  { name: 'Activewear', products: 134, value: 86500, percentStock: 12 },
  { name: 'Accessories', products: 98, value: 52400, percentStock: 8 },
  { name: 'Footwear', products: 82, value: 112800, percentStock: 7 },
  { name: 'Intimates', products: 60, value: 37900, percentStock: 5 },
];

// Mock data for incoming shipments
const incomingShipments = [
  {
    id: 'PO-4852',
    vendor: 'FashionTextiles Inc.',
    expectedDate: 'Mar 31, 2025',
    items: 12,
    value: 12480.50,
    status: 'In Transit'
  },
  {
    id: 'PO-4853',
    vendor: 'EcoFabrics Ltd.',
    expectedDate: 'Apr 5, 2025',
    items: 8,
    value: 8742.25,
    status: 'Processing'
  },
  {
    id: 'PO-4854',
    vendor: 'Premium Materials Co.',
    expectedDate: 'Apr 10, 2025',
    items: 15,
    value: 15987.80,
    status: 'Confirmed'
  },
];

// Mock data for inventory health score
const inventoryHealthData = {
  score: 82,
  stockAvailability: 92,
  turnoverRate: 78,
  forecastAccuracy: 85,
  inventoryCost: 74
};

const InventoryContent: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  // Filter inventory items based on search, category, and stock status
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      item.category.toLowerCase() === categoryFilter.toLowerCase();
    
    const matchesStock = stockFilter === 'all' || 
      item.stockStatus.toLowerCase().replace(' ', '-') === stockFilter.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStock;
  });
  
  return (
    <div className="space-y-6">
      {/* Page header with action buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Intelligence</h1>
          <p className="text-muted-foreground">
            Track, optimize, and forecast your inventory across all channels
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
            Add Product
          </Button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventoryStats.map((stat, index) => (
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
                  (stat.trend === 'up' && stat.title !== 'Low Stock Items') || 
                  (stat.trend === 'down' && stat.title === 'Low Stock Items')
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

      {/* Tabs for different inventory views */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="incoming">Incoming Shipments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products by name or SKU..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.name} value={category.name.toLowerCase()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={stockFilter} 
                onValueChange={setStockFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>
                Manage and monitor your product inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Sales (30d)</TableHead>
                    <TableHead className="text-right">Last Restock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.id}</div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={item.stockStatus === 'In Stock' 
                              ? 'outline' 
                              : item.stockStatus === 'Low Stock'
                                ? 'secondary'
                                : item.stockStatus === 'Critical'
                                  ? 'destructive'
                                  : 'default'
                            }
                          >
                            {item.stock} {item.stockStatus === 'Out of Stock' && 'Out'}
                          </Badge>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`h-2 w-2 rounded-full ${
                                  item.stockStatus === 'In Stock' 
                                    ? 'bg-green-500' 
                                    : item.stockStatus === 'Low Stock'
                                      ? 'bg-yellow-500'
                                      : item.stockStatus === 'Critical'
                                        ? 'bg-red-500'
                                        : 'bg-gray-500'
                                }`} />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Stock Level: {item.stockStatus}</p>
                                <p>Threshold: {item.threshold}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.sales30d}</TableCell>
                      <TableCell className="text-right">{item.lastRestock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredItems.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No products found matching your criteria
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredItems.length} of {inventoryItems.length} items
              </div>
              <Button>
                Export Inventory
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          {/* Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Inventory distribution by product category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center mb-4">
                <BarChart3 size={48} className="text-muted-foreground opacity-50" />
                <p className="ml-2 text-muted-foreground">Category distribution chart visualization</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">% of Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.name}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-right">{category.products}</TableCell>
                      <TableCell className="text-right">${category.value.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16">
                            <Progress value={category.percentStock} className="h-2" />
                          </div>
                          {category.percentStock}%
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="incoming" className="space-y-4">
          {/* Incoming Shipments */}
          <Card>
            <CardHeader>
              <CardTitle>Incoming Shipments</CardTitle>
              <CardDescription>
                Track orders and shipments from your vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Expected Arrival</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomingShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{shipment.id}</TableCell>
                      <TableCell>{shipment.vendor}</TableCell>
                      <TableCell>{shipment.expectedDate}</TableCell>
                      <TableCell className="text-right">{shipment.items}</TableCell>
                      <TableCell className="text-right">${shipment.value.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            shipment.status === 'In Transit' 
                              ? 'default' 
                              : shipment.status === 'Processing'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {shipment.status}
                        </Badge>
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
            <CardFooter>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          {/* Inventory Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Inventory Health Score */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Inventory Health</CardTitle>
                <CardDescription>
                  Overall inventory management score
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      className="text-muted stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-primary stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                      strokeDasharray={`${inventoryHealthData.score * 2.51} 251`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold">{inventoryHealthData.score}</span>
                    <span className="text-sm text-muted-foreground">out of 100</span>
                  </div>
                </div>
                
                <div className="w-full space-y-2 mt-6">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Stock Availability</span>
                      <span className="font-medium">{inventoryHealthData.stockAvailability}%</span>
                    </div>
                    <Progress value={inventoryHealthData.stockAvailability} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Turnover Rate</span>
                      <span className="font-medium">{inventoryHealthData.turnoverRate}%</span>
                    </div>
                    <Progress value={inventoryHealthData.turnoverRate} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Forecast Accuracy</span>
                      <span className="font-medium">{inventoryHealthData.forecastAccuracy}%</span>
                    </div>
                    <Progress value={inventoryHealthData.forecastAccuracy} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Inventory Cost</span>
                      <span className="font-medium">{inventoryHealthData.inventoryCost}%</span>
                    </div>
                    <Progress value={inventoryHealthData.inventoryCost} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Info className="mr-2 h-4 w-4" />
                  Improve Health Score
                </Button>
              </CardFooter>
            </Card>
            
            {/* Inventory Forecasting */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Inventory Forecasting</CardTitle>
                <CardDescription>
                  Projected inventory levels based on sales trends
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center">
                  <TrendingUp size={48} className="text-muted-foreground opacity-50" />
                  <p className="ml-2 text-muted-foreground">Inventory forecast chart visualization</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Inventory Alerts */}
            <Card className="md:col-span-3">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Alerts</CardTitle>
                  <CardDescription>
                    Critical issues requiring your attention
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Clipboard className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Out of Stock Items</h3>
                      <p className="text-sm text-muted-foreground">5 products have zero inventory</p>
                      <Button variant="link" className="h-8 px-0">View Items</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex gap-3">
                    <ShoppingBag className="h-6 w-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Slow-Moving Inventory</h3>
                      <p className="text-sm text-muted-foreground">12 products with low turnover rates</p>
                      <Button variant="link" className="h-8 px-0">View Items</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex gap-3">
                    <Truck className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Delayed Shipments</h3>
                      <p className="text-sm text-muted-foreground">2 purchase orders are delayed</p>
                      <Button variant="link" className="h-8 px-0">View Shipments</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryContent;