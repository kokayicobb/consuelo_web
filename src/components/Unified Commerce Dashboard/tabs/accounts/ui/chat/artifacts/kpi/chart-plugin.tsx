"use client"

import { createPlatePlugin } from "platejs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, Minus, AlertCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

export const ChartArtifactPlugin = createPlatePlugin({
  key: "chart-artifact",
  node: {
    isElement: true,
    isVoid: true,
  },
})

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartElementProps {
  element: {
    title?: string;
    chartType?: 'bar' | 'line' | 'area';
    kpiType?: string;
    period?: string;
    limit?: number;
    data?: ChartData[];
  };
  attributes?: any;
}

export function ChartArtifactElement({ element, ...props }: ChartElementProps) {
  const { 
    chartType = "bar", 
    title = "KPI Chart",
    kpiType = "revenue",
    period = "monthly",
    limit = 12,
    data: staticData = []
  } = element;

  const [data, setData] = useState<ChartData[]>(staticData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  // Fetch data from API if kpiType is provided
  useEffect(() => {
    if (kpiType && staticData.length === 0) {
      fetchKPIData();
    }
  }, [kpiType, period, limit]);

  const fetchKPIData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/kpi?type=${kpiType}&period=${period}&limit=${limit}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      if (result.success) {
        setData(result.data || []);
        setSummary(result.summary);
      } else {
        throw new Error(result.error || 'Failed to load KPI data');
      }
    } catch (err) {
      console.error('Error fetching KPI data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      // Fallback to sample data
      setData(getSampleData());
    } finally {
      setLoading(false);
    }
  };

  const getSampleData = () => [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 5000 },
    { name: "Apr", value: 4500 },
    { name: "May", value: 6000 },
    { name: "Jun", value: 5500 },
  ];

  const formatValue = (value: number) => {
    if (kpiType === 'conversion' || kpiType === 'conversion rate') {
      return `${value.toFixed(1)}%`;
    }
    if (kpiType === 'revenue' || kpiType === 'sales') {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const getTrendIcon = () => {
    if (!summary?.trend) return <Minus className="w-4 h-4 text-gray-500" />;
    
    switch (summary.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading KPI data...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <span className="text-muted-foreground">No data available</span>
        </div>
      );
    }

    const chartProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip formatter={(value) => [formatValue(Number(value)), kpiType]} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip formatter={(value) => [formatValue(Number(value)), kpiType]} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default: // bar chart
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip formatter={(value) => [formatValue(Number(value)), kpiType]} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="my-4" {...props.attributes}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            {title}
          </div>
          {summary && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {summary.change !== undefined && (
                <span className={`flex items-center gap-1 ${
                  summary.trend === 'up' ? 'text-green-600' : 
                  summary.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {summary.change > 0 ? '+' : ''}{summary.change.toFixed(1)}%
                </span>
              )}
              {summary.total !== undefined && (
                <span>Total: {formatValue(summary.total)}</span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        {summary && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {summary.average !== undefined && (
                <div>
                  <span className="text-muted-foreground">Average:</span>
                  <div className="font-medium">{formatValue(summary.average)}</div>
                </div>
              )}
              {summary.total !== undefined && (
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <div className="font-medium">{formatValue(summary.total)}</div>
                </div>
              )}
              {summary.trend && (
                <div>
                  <span className="text-muted-foreground">Trend:</span>
                  <div className={`font-medium capitalize ${
                    summary.trend === 'up' ? 'text-green-600' : 
                    summary.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {summary.trend}
                  </div>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Period:</span>
                <div className="font-medium capitalize">{period}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

ChartArtifactPlugin.withComponent(ChartArtifactElement);