"use client"

import { useState } from "react"
import type { Config } from "@/types/otf"
import {
  Download,
  Table,
  BarChart,
  ListChecks,
  ChevronRight,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Info,
} from "lucide-react"
import ChartVisualization, { ChartLoading, ChartError } from "./chart-visualization"
import ActionSuggestions, { ActionSuggestionsLoading } from "./action-suggestions"

interface QueryResultsProps {
  results: any[]
  columns: string[]
  viewMode: "table" | "chart" | "actions"
  setViewMode: (mode: "table" | "chart" | "actions") => void
  chartConfig: Config | null
  isLoadingChart: boolean
  actionSuggestions: any | null
  isLoadingActions: boolean
}

export default function QueryResults({
  results,
  columns,
  viewMode,
  setViewMode,
  chartConfig,
  isLoadingChart,
  actionSuggestions,
  isLoadingActions,
}: QueryResultsProps) {
  // Export the segmentation results as CSV
  const exportCSV = () => {
    if (!results.length) return
    // Create CSV content
    const csvContent = [
      columns.join(","), // Header row
      ...results.map((row) =>
        columns
          .map((col) => {
            const value = row[col]
            // Handle values that might need escaping
            if (value === null || value === undefined) return ""
            if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `client-segment-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Card View Component
  const CardView = ({ data }: { data: any[] }) => {
    const [visibleCards, setVisibleCards] = useState(20)

    // Process the data to ensure we have an array of client objects
    const processedData = Array.isArray(data[0]) ? data[0] : data

    // Normalize each item to ensure it's an object
    const normalizedData = processedData.map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item)
        } catch (e) {
          return { value: item }
        }
      }
      return item
    })

    const handleShowMore = () => {
      setVisibleCards((prev) => prev + 20)
    }

    const getCardIcon = (key: string) => {
      const lowerKey = key.toLowerCase()
      if (lowerKey.includes("client") || lowerKey.includes("name")) return <User className="h-4 w-4" />
      if (lowerKey.includes("date") || lowerKey.includes("time")) return <Calendar className="h-4 w-4" />
      if (lowerKey.includes("location") || lowerKey.includes("address")) return <MapPin className="h-4 w-4" />
      if (lowerKey.includes("phone")) return <Phone className="h-4 w-4" />
      if (lowerKey.includes("email")) return <Mail className="h-4 w-4" />
      return <Info className="h-4 w-4" />
    }

    const getPrimaryField = (item: any) => {
      // Try to find a name or client field first
      for (const key of Object.keys(item)) {
        const lowerKey = key.toLowerCase()
        if (lowerKey.includes("client") || lowerKey.includes("name")) {
          return { key, value: item[key] }
        }
      }

      // Otherwise return the first field
      const firstKey = Object.keys(item)[0]
      return { key: firstKey, value: item[firstKey] }
    }

    const getSecondaryFields = (item: any, primaryKey: string) => {
      return Object.entries(item)
        .filter(([key]) => key !== primaryKey)
        .slice(0, 5) // Limit to 5 fields for cleaner cards
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {normalizedData.slice(0, visibleCards).map((item, index) => {
            const primary = getPrimaryField(item)
            const secondaryFields = getSecondaryFields(item, primary.key)

            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                onClick={() => console.log("Card clicked:", item)}
              >
                <div className="p-4 border-b border-gray-100 bg-orange-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900 truncate">
                      {typeof primary.value === "object" && primary.value !== null
                        ? JSON.stringify(primary.value)
                        : String(primary.value || "Unnamed Client")}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {secondaryFields.map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                      <div className="text-orange-500 mt-0.5">{getCardIcon(key)}</div>
                      <div>
                        <p className="text-xs text-gray-500">{key}</p>
                        <p className="text-sm text-gray-700 break-words">
                          {value instanceof Date
                            ? value.toLocaleDateString()
                            : typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)
                              ? new Date(value).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : typeof value === "object" && value !== null
                                ? JSON.stringify(value)
                                : String(value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {visibleCards < normalizedData.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleShowMore}
              className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md font-medium transition-colors"
            >
              Show More ({visibleCards} of {normalizedData.length})
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold">
          Results ({results.length} {results.length === 1 ? "client" : "clients"})
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={exportCSV}
            className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md flex items-center justify-center gap-1"
          >
            <Download size={14} />
            Export CSV
          </button>
          <div className="bg-gray-100 rounded-md p-1 flex">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                viewMode === "table" ? "bg-white shadow" : "hover:bg-gray-200"
              }`}
            >
              <Table size={14} />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode("chart")}
              className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                viewMode === "chart" ? "bg-white shadow" : "hover:bg-gray-200"
              }`}
              disabled={!chartConfig && !isLoadingChart}
            >
              <BarChart size={14} />
              <span className="hidden sm:inline">Chart</span>
            </button>
            <button
              onClick={() => setViewMode("actions")}
              className={`px-3 py-1 rounded-md flex items-center gap-1 ${
                viewMode === "actions" ? "bg-white shadow" : "hover:bg-gray-200"
              }`}
              disabled={!actionSuggestions && !isLoadingActions}
            >
              <ListChecks size={14} />
              <span className="hidden sm:inline">Actions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card View (renamed from Table View) */}
      {viewMode === "table" && <CardView data={results} />}

      {/* Chart View */}
      {viewMode === "chart" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          {isLoadingChart ? (
            <ChartLoading />
          ) : chartConfig ? (
            <ChartVisualization config={chartConfig} data={results} />
          ) : (
            <ChartError message="Unable to generate a chart for this data" />
          )}
        </div>
      )}

      {/* Actions View */}
      {viewMode === "actions" && (
        <div>
          {isLoadingActions ? (
            <ActionSuggestionsLoading />
          ) : actionSuggestions ? (
            <ActionSuggestions actions={actionSuggestions.actions} summary={actionSuggestions.summary} />
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
              <p className="text-gray-500">Unable to generate action suggestions for this data</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
