"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  MousePointer,
  RefreshCw,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Globe,
  Monitor,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface WebAnalyticsData {
  period: string;
  date_range: {
    start: string;
    end: string;
  };
  metrics: {
    pageviews: {
      total: number;
      timeline: number[];
      labels: string[];
    };
    unique_visitors: {
      total: number;
      timeline: number[];
      labels: string[];
    };
    sessions: {
      total: number;
      timeline: number[];
      avg_duration: number;
    };
    bounce_rate: {
      bounce_rate: number;
      bounced_sessions: number;
      total_sessions: number;
    };
    avg_session_duration: number;
    top_pages: Array<{
      page: string;
      views: number;
      percentage: number;
    }>;
    traffic_sources: Array<{
      source: string;
      visitors: number;
      percentage: number;
    }>;
    device_types: Array<{
      device: string;
      count: number;
      percentage: number;
    }>;
  };
}

export default function WebAnalyticsCard() {
  const [analyticsData, setAnalyticsData] = useState<WebAnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedPeriod] = useState("7d");

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/analytics/web-stats?period=${selectedPeriod}`,
      );
      if (response.ok) {
        const data = await response.json();

        // Calculate percentages for breakdown data
        if (data.metrics.top_pages) {
          const totalViews = data.metrics.top_pages.reduce(
            (sum: number, page: any) => sum + page.views,
            0,
          );
          data.metrics.top_pages = data.metrics.top_pages.map((page: any) => ({
            ...page,
            percentage:
              totalViews > 0 ? Math.round((page.views / totalViews) * 100) : 0,
          }));
        }

        if (data.metrics.traffic_sources) {
          const totalVisitors = data.metrics.traffic_sources.reduce(
            (sum: number, source: any) => sum + source.visitors,
            0,
          );
          data.metrics.traffic_sources = data.metrics.traffic_sources.map(
            (source: any) => ({
              ...source,
              percentage:
                totalVisitors > 0
                  ? Math.round((source.visitors / totalVisitors) * 100)
                  : 0,
            }),
          );
        }

        if (data.metrics.device_types) {
          const totalDevices = data.metrics.device_types.reduce(
            (sum: number, device: any) => sum + device.count,
            0,
          );
          data.metrics.device_types = data.metrics.device_types.map(
            (device: any) => ({
              ...device,
              percentage:
                totalDevices > 0
                  ? Math.round((device.count / totalDevices) * 100)
                  : 0,
            }),
          );
        }

        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Prepare chart data
  const chartData = analyticsData
    ? analyticsData.metrics.pageviews.labels.map((label, index) => ({
        date: new Date(label).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        pageviews: analyticsData.metrics.pageviews.timeline[index] || 0,
        visitors: analyticsData.metrics.unique_visitors.timeline[index] || 0,
      }))
    : [];

  if (loading) {
    return (
      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Web Analytics</CardTitle>
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="border-slate-200 bg-white shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Web Analytics</CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <BarChart3 className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bounceRate = (
    analyticsData.metrics.bounce_rate.bounce_rate * 100
  ).toFixed(1);
  const avgDuration = formatDuration(
    analyticsData.metrics.avg_session_duration,
  );

  return (
    <Card className="border-slate-200 bg-white shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-medium">Web Analytics</CardTitle>
          <p className="text-sm text-muted-foreground">
            Website traffic and user behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>+15.2%</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Page Views</span>
            </div>
            <div className="text-xl font-bold">
              {formatNumber(analyticsData.metrics.pageviews.total)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Visitors</span>
            </div>
            <div className="text-xl font-bold">
              {formatNumber(analyticsData.metrics.unique_visitors.total)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">
                Avg. Session
              </span>
            </div>
            <div className="text-xl font-bold">{avgDuration}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Bounce Rate</span>
            </div>
            <div className="text-xl font-bold">{bounceRate}%</div>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Traffic Trends (Last 7 Days)
            </h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>Page Views</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Visitors</span>
              </div>
            </div>
          </div>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="pageviewsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="visitorsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#pageviewsGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#visitorsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pages and Sources */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Pages */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4" />
              Top Pages
            </h4>
            <div className="space-y-2">
              {analyticsData.metrics.top_pages
                .slice(0, 3)
                .map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{page.page}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(page.views)} views
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {page.percentage}%
                    </Badge>
                  </div>
                ))}
            </div>
          </div>

          {/* Device Types */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Monitor className="h-4 w-4" />
              Device Types
            </h4>
            <div className="space-y-2">
              {analyticsData.metrics.device_types
                .slice(0, 3)
                .map((device, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {device.device === "Desktop" && (
                        <Monitor className="h-4 w-4 text-gray-500" />
                      )}
                      {device.device === "Mobile" && (
                        <Smartphone className="h-4 w-4 text-gray-500" />
                      )}
                      {device.device !== "Desktop" &&
                        device.device !== "Mobile" && (
                          <Smartphone className="h-4 w-4 text-gray-500" />
                        )}
                      <span className="font-medium">
                        {device.device || "Unknown"}
                      </span>
                    </div>
                    <Badge variant="secondary">{device.percentage}%</Badge>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-medium">
            <ExternalLink className="h-4 w-4" />
            Traffic Sources
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {analyticsData.metrics.traffic_sources
              .slice(0, 4)
              .map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded border p-2"
                >
                  <div>
                    <p className="text-sm font-medium">{source.source}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(source.visitors)} visitors
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {source.percentage}%
                  </Badge>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
