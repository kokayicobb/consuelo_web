"use client"

import type React from "react"

import { useState } from "react"

import {
  generateQuery,
  runGeneratedSQLQuery,
  generateChartConfig,
  explainQuery,
  generateActionSuggestions,
} from "@/lib/actions"
import type { QueryExplanation, Config } from "@/types/otf"
import { SegmentationForm, ExampleQueries, LoadingState, SqlDisplay, QueryResults } from "../../segmentation"

// Example segmentation queries to get users started
const EXAMPLE_QUERIES = [
  "Show me clients who had late cancellations in the last 30 days",
  "Find members whose membership is expiring in the next 14 days",
  "Show me clients who haven't attended a class in 30 days but still have an active membership",
  "Which coach has the highest attendance rate this month?",
  "Show me clients who signed up recently but haven't attended a class yet",
  "List members with upcoming birthdays this month who we should contact",
  "Find clients who attended class with coach Kokayi in the past month",
  "Show me clients who are approaching a class milestone (50, 100, etc.)",
]

export default function PlatformPage() {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [sqlQuery, setSqlQuery] = useState("")
  const [queryResults, setQueryResults] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [explanations, setExplanations] = useState<QueryExplanation[]>([])
  const [isExplaining, setIsExplaining] = useState(false)
  const [chartConfig, setChartConfig] = useState<Config | null>(null)
  const [isLoadingChart, setIsLoadingChart] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "chart" | "actions">("table")
  const [actionSuggestions, setActionSuggestions] = useState<any | null>(null)
  const [isLoadingActions, setIsLoadingActions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle natural language query submission
  const handleSubmit = async (e: React.FormEvent | string) => {
    if (typeof e !== "string") e.preventDefault()
    const query = typeof e === "string" ? e : inputValue
    if (!query.trim()) return

    setError(null)
    setIsLoading(true)
    setActiveStep(1)
    setSqlQuery("")
    setQueryResults([])
    setColumns([])
    setExplanations([])
    setChartConfig(null)
    setActionSuggestions(null)

    try {
      // Step 1: Generate SQL from natural language
      const generatedSql = await generateQuery(query)
      setSqlQuery(generatedSql)
      setActiveStep(2)

      // Step 2: Execute the SQL query
      let results = await runGeneratedSQLQuery(generatedSql)

      // Ensure results is an array of objects
      if (results && results.length > 0) {
        // If the first item is a string that looks like JSON, try to parse all items
        if (typeof results[0] === "string" && (results[0].startsWith("{") || results[0].startsWith("["))) {
          results = results.map((item) => {
            try {
              return JSON.parse(item)
            } catch (e) {
              return item
            }
          })
        }

        setQueryResults(results)

        // Get columns from the first result
        const firstResult = results[0]
        const cols = typeof firstResult === "object" && firstResult !== null ? Object.keys(firstResult) : ["value"]

        setColumns(cols)
        setActiveStep(3)

        // Step 3: Generate chart config and action suggestions in parallel
        setIsLoadingChart(true)
        setIsLoadingActions(true)

        try {
          const [chartResult, actionResult] = await Promise.allSettled([
            generateChartConfig(results, query),
            generateActionSuggestions(results, query),
          ])

          if (chartResult.status === "fulfilled") {
            setChartConfig(chartResult.value)
          }

          if (actionResult.status === "fulfilled") {
            setActionSuggestions(actionResult.value)
          }
        } catch (vizError) {
          console.error("Error in visualization/actions generation:", vizError)
        } finally {
          setIsLoadingChart(false)
          setIsLoadingActions(false)
        }
      } else {
        setQueryResults([])
        setColumns([])
      }
    } catch (err) {
      console.error("Error processing query:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Explain the generated SQL query
  const handleExplainQuery = async () => {
    if (!sqlQuery || isExplaining) return
    setIsExplaining(true)
    try {
      const explanationResult = await explainQuery(inputValue, sqlQuery)
      setExplanations(explanationResult)
    } catch (err) {
      console.error("Error explaining query:", err)
    } finally {
      setIsExplaining(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Consuelo AI Client Segmentation</h1>
        <p className="text-gray-600">
          Ask natural language questions to segment your clients and create targeted action lists.
        </p>
      </header>

      <SegmentationForm
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* Examples Section (shown when no query is active) */}
      {!isLoading && !sqlQuery && (
        <ExampleQueries
          queries={EXAMPLE_QUERIES}
          onSelectQuery={(query) => {
            setInputValue(query)
            handleSubmit(query)
          }}
        />
      )}

      {/* Loading Indicator */}
      {isLoading && <LoadingState activeStep={activeStep} />}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* SQL Query Display */}
      {sqlQuery && !isLoading && (
        <SqlDisplay
          sqlQuery={sqlQuery}
          explanations={explanations}
          isExplaining={isExplaining}
          onExplain={handleExplainQuery}
        />
      )}

      {/* Results Section */}
      {queryResults.length > 0 && !isLoading && (
        <QueryResults
          results={queryResults}
          columns={columns}
          viewMode={viewMode}
          setViewMode={setViewMode}
          chartConfig={chartConfig}
          isLoadingChart={isLoadingChart}
          actionSuggestions={actionSuggestions}
          isLoadingActions={isLoadingActions}
        />
      )}

      {/* No Results Message */}
      {sqlQuery && !isLoading && queryResults.length === 0 && (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <p className="text-gray-500">No clients match these criteria</p>
        </div>
      )}
    </div>
  )
}
