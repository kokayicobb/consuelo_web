"use client"

import { createPlatePlugin } from "platejs/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Download, Share, BarChart3, LineChartIcon, PieChartIcon } from "lucide-react"
import { useState } from "react"

export const ChartArtifactPlugin = createPlatePlugin({
  key: "chart-artifact",
  node: {
    isElement: true,
    isVoid: true,
  },
})

export function ChartArtifactElement({ element, ...props }: any) {
  const { title = "Chart", data = [] } = element
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar")

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  const handleExport = () => {
    // Export chart as image or PDF
    console.log("Exporting chart:", title)
  }

  const handleShare = () => {
    // Share chart via email or link
    console.log("Sharing chart:", title)
  }

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            {data[0]?.leads && <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} />}
          </LineChart>
        )
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
            {data[0]?.leads && <Bar dataKey="leads" fill="#10b981" />}
          </BarChart>
        )
    }
  }

  return (
    <Card className="my-4" {...props.attributes}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={chartType === "bar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("bar")}
                className="rounded-r-none"
              >
                <BarChart3 className="w-3 h-3" />
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("line")}
                className="rounded-none border-x"
              >
                <LineChartIcon className="w-3 h-3" />
              </Button>
              <Button
                variant={chartType === "pie" ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType("pie")}
                className="rounded-l-none"
              >
                <PieChartIcon className="w-3 h-3" />
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="outline" onClick={handleShare}>
              <Share className="w-3 h-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

ChartArtifactPlugin.withComponent(ChartArtifactElement)
