"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, DollarSign, Target } from "lucide-react"

// Enterprise-grade mock data
const salesData = {
  daily: [
    { name: "Mon", revenue: 2400000, target: 2200000, deals: 12 },
    { name: "Tue", revenue: 1800000, target: 2200000, deals: 8 },
    { name: "Wed", revenue: 3200000, target: 2200000, deals: 15 },
    { name: "Thu", revenue: 2800000, target: 2200000, deals: 11 },
    { name: "Fri", revenue: 3600000, target: 2200000, deals: 18 },
    { name: "Sat", revenue: 1200000, target: 2200000, deals: 5 },
    { name: "Sun", revenue: 800000, target: 2200000, deals: 3 },
  ],
  weekly: [
    { name: "W1", revenue: 45000000, target: 40000000, deals: 85 },
    { name: "W2", revenue: 52000000, target: 40000000, deals: 92 },
    { name: "W3", revenue: 38000000, target: 40000000, deals: 78 },
    { name: "W4", revenue: 61000000, target: 40000000, deals: 105 },
  ],
  monthly: [
    { name: "Jan", revenue: 180000000, target: 160000000, deals: 320 },
    { name: "Feb", revenue: 195000000, target: 160000000, deals: 340 },
    { name: "Mar", revenue: 220000000, target: 160000000, deals: 380 },
    { name: "Apr", revenue: 205000000, target: 160000000, deals: 365 },
    { name: "May", revenue: 240000000, target: 160000000, deals: 420 },
    { name: "Jun", revenue: 225000000, target: 160000000, deals: 395 },
  ],
  yearly: [
    { name: "2020", revenue: 1800000000, target: 1600000000, deals: 3200 },
    { name: "2021", revenue: 2100000000, target: 1900000000, deals: 3800 },
    { name: "2022", revenue: 2400000000, target: 2200000000, deals: 4200 },
    { name: "2023", revenue: 2800000000, target: 2500000000, deals: 4800 },
    { name: "2024", revenue: 3200000000, target: 2900000000, deals: 5400 },
  ],
}

const kpiData = {
  daily: {
    revenue: 15800000,
    growth: 12.5,
    deals: 72,
    avgDeal: 219444,
    target: 15400000,
    targetProgress: 102.6,
  },
  weekly: {
    revenue: 196000000,
    growth: 8.3,
    deals: 360,
    avgDeal: 544444,
    target: 160000000,
    targetProgress: 122.5,
  },
  monthly: {
    revenue: 1265000000,
    growth: 15.2,
    deals: 2220,
    avgDeal: 569820,
    target: 960000000,
    targetProgress: 131.8,
  },
  yearly: {
    revenue: 3200000000,
    growth: 14.3,
    deals: 5400,
    avgDeal: 592593,
    target: 2900000000,
    targetProgress: 110.3,
  },
}

// Update the export default function to include lg:col-span-2 and make the layout more horizontal
export default function SalesPerformanceCard() {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly")

  const currentData = salesData[timeRange]
  const currentKPI = kpiData[timeRange]

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value)
  }

  return (
    <Card className="border-gray-200 bg-white ">
      <div className="flex flex-col h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800 text-lg">Sales Performance</CardTitle>
              <CardDescription className="text-gray-600 text-sm">Revenue tracking and target analysis</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <TrendingUp className="w-3 h-3 mr-1" />+{currentKPI.growth}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <div className="flex h-full">
            {/* Chart - Takes up more horizontal space */}
            <div className="flex-1 pr-4">
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: "#6B7280", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={formatCurrency}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                      }}
                      formatter={(value: number, name: string) => [
                        formatTooltipValue(value),
                        name === "revenue" ? "Revenue" : "Target",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#10B981"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      fillOpacity={1}
                      fill="url(#colorTarget)"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KPIs and Controls - Takes up less horizontal space */}
            <div className="w-48 flex flex-col">
              {/* KPI Stats */}
              <div className="space-y-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Revenue</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(currentKPI.revenue)}</p>
                    <DollarSign className="h-3 w-3 text-blue-500" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Target Progress</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{currentKPI.targetProgress}%</p>
                    <Target className="h-3 w-3 text-green-500" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Deals Closed</p>
                  <p className="text-sm font-semibold text-gray-900">{currentKPI.deals.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Avg Deal Size</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(currentKPI.avgDeal)}</p>
                </div>
              </div>

              {/* Time Range Tabs */}
              <Tabs
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as typeof timeRange)}
                className="w-full mt-auto"
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-6">
                  <TabsTrigger
                    value="daily"
                    className="text-xs data-[state=active]:bg-white data-[state=active]:text-gray-800"
                  >
                    Daily
                  </TabsTrigger>
                  <TabsTrigger
                    value="weekly"
                    className="text-xs data-[state=active]:bg-white data-[state=active]:text-gray-800"
                  >
                    Weekly
                  </TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-7 mt-1">
                  <TabsTrigger
                    value="monthly"
                    className="text-xs data-[state=active]:bg-white data-[state=active]:text-gray-800"
                  >
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger
                    value="yearly"
                    className="text-xs data-[state=active]:bg-white data-[state=active]:text-gray-800"
                  >
                    Yearly
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
