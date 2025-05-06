'use client';

import { generateQuery, runGeneratedSQLQuery, generateChartConfig, explainQuery, generateActionSuggestions } from '@/lib/actions';
import { QueryExplanation, Config} from '@/types/otf';
import { useState } from 'react';

import ActionSuggestions, { ActionSuggestionsLoading } from './action-suggestion';
import ChartVisualization, { ChartLoading, ChartError } from './chart-visualization';


// Example segmentation queries to get users started
const EXAMPLE_QUERIES = [
  'Show me clients who had late cancellations in the last 30 days',
  'Find members whose membership is expiring in the next 14 days',
  'Show me clients who haven\'t attended a class in 30 days but still have an active membership',
  'Which coach has the highest attendance rate this month?',
  'Show me clients who signed up recently but haven\'t attended a class yet',
  'List members with upcoming birthdays this month who we should contact',
  'Find clients who attended class with coach Kokayi in the past month',
  'Show me clients who are approaching a class milestone (50, 100, etc.)',
];

export default function PlatformPage() {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [explanations, setExplanations] = useState<QueryExplanation[]>([]);
  const [isExplaining, setIsExplaining] = useState(false);
  const [chartConfig, setChartConfig] = useState<Config | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'actions'>('table');
  const [actionSuggestions, setActionSuggestions] = useState<any | null>(null);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle natural language query submission
  const handleSubmit = async (e: React.FormEvent | string) => {
    console.log("=== handleSubmit STARTED ===");
    if (typeof e !== 'string') e.preventDefault();
    
    const query = typeof e === 'string' ? e : inputValue;
    console.log("Query:", query);
    if (!query.trim()) return;

    setError(null);
    setIsLoading(true);
    setActiveStep(1);
    setSqlQuery('');
    setQueryResults([]);
    setColumns([]);
    setExplanations([]);
    setChartConfig(null);
    setActionSuggestions(null);
    
    try {
      // Step 1: Generate SQL from natural language
      console.log("Calling generateQuery...");
      const generatedSql = await generateQuery(query);
      console.log("generateQuery completed:", generatedSql ? "SUCCESS" : "FAILED");
      console.log("SQL Query:", generatedSql);
      setSqlQuery(generatedSql);
      setActiveStep(2);
      
      // Step 2: Execute the SQL query
      console.log("Calling runGeneratedSQLQuery...");
      const results = await runGeneratedSQLQuery(generatedSql);
      console.log("runGeneratedSQLQuery completed:", results ? `SUCCESS (${results.length} results)` : "FAILED");
      if (results.length > 0) {
        console.log("Setting query results and columns...");
        setQueryResults(results);
        setColumns(Object.keys(results[0]));
        setActiveStep(3);
        
        // Step 3: Generate chart config and action suggestions in parallel
        console.log("Starting chart and action generation...");
        setIsLoadingChart(true);
        setIsLoadingActions(true);
        
        try {
          console.log("Setting up promises...");
          const chartPromise = generateChartConfig(results, query);
          console.log("Chart promise created");
          
          const actionPromise = generateActionSuggestions(results, query);
          console.log("Action promise created");
          
          console.log("Awaiting Promise.all...");
          const responses = await Promise.allSettled([chartPromise, actionPromise]);
          console.log("Promise.all completed!");
          
          // Check each promise result
          if (responses[0].status === 'fulfilled') {
            console.log("Chart generation succeeded");
            setChartConfig(responses[0].value);
          } else {
            console.error("Chart generation failed:", responses[0].reason);
          }
          
          if (responses[1].status === 'fulfilled') {
            console.log("Action suggestions succeeded");
            setActionSuggestions(responses[1].value);
          } else {
            console.error("Action suggestions failed:", responses[1].reason);
          }
        } catch (vizError) {
          console.error('Error in visualization/actions block:', vizError);
        } finally {
          console.log("Setting isLoadingChart and isLoadingActions to false");
          setIsLoadingChart(false);
          setIsLoadingActions(false);
        }
        
      } else {
        console.log("No results returned, clearing results and columns");
        setQueryResults([]);
        setColumns([]);
      }
    } catch (err) {
      console.error('Main try/catch error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
      console.log("=== handleSubmit COMPLETED ===");
    }
  };

  // Explain the generated SQL query
  const handleExplainQuery = async () => {
    console.log("handleExplainQuery started");
    if (!sqlQuery || isExplaining) return;
    
    setIsExplaining(true);
    try {
      console.log("Calling explainQuery...");
      const explanationResult = await explainQuery(inputValue, sqlQuery);
      console.log("explainQuery completed:", explanationResult);
      setExplanations(explanationResult);
    } catch (err) {
      console.error('Error explaining query:', err);
    } finally {
      setIsExplaining(false);
      console.log("handleExplainQuery completed");
    }
  };

  // Export the segmentation results as CSV
  const exportCSV = () => {
    if (!queryResults.length) return;

    // Create CSV content
    const csvContent = [
      columns.join(','), // Header row
      ...queryResults.map(row => 
        columns.map(col => {
          const value = row[col];
          // Handle values that might need escaping
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `client-segment-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // DEBUG - Add a simple logging function for component state
  const debugState = () => {
    console.log("===== COMPONENT STATE =====");
    console.log("isLoading:", isLoading);
    console.log("activeStep:", activeStep);
    console.log("sqlQuery exists:", !!sqlQuery);
    console.log("queryResults count:", queryResults.length);
    console.log("isLoadingChart:", isLoadingChart);
    console.log("chartConfig exists:", !!chartConfig);
    console.log("isLoadingActions:", isLoadingActions);
    console.log("actionSuggestions exists:", !!actionSuggestions);
    console.log("===========================");
  };

  // Call debugState whenever any of these values change
  useState(() => {
    debugState();
  }, [isLoading, activeStep, sqlQuery, queryResults, isLoadingChart, chartConfig, isLoadingActions, actionSuggestions]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Consuelo AI Client Segmentation</h1>
      <p className="text-gray-600 mb-6">
        Ask natural language questions to segment your clients and create targeted action lists.
      </p>

      {/* Debug Button (for testing) */}
      <button 
        onClick={debugState}
        className="mb-4 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
      >
        Debug State
      </button>

      {/* Query Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., Show me clients who haven't attended class in 30 days but still have active memberships"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Segment'}
          </button>
        </div>
      </form>

      {/* Examples Section (shown when no query is active) */}
      {!isLoading && !sqlQuery && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Example Queries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXAMPLE_QUERIES.map((query, index) => (
              <button
                key={index}
                onClick={() => {
                  console.log("Example query clicked:", query);
                  setInputValue(query);
                  handleSubmit(query);
                }}
                className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-orange-300"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          <p className="text-gray-600">
            {activeStep === 1 && "Generating SQL query..."}
            {activeStep === 2 && "Executing query..."}
            {activeStep === 3 && "Creating visualizations..."}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* SQL Query Display */}
      {sqlQuery && !isLoading && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Generated SQL</h2>
            <button
              onClick={handleExplainQuery}
              disabled={isExplaining}
              className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md"
            >
              {isExplaining ? 'Explaining...' : 'Explain SQL'}
            </button>
          </div>
          <div className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
            <pre>{sqlQuery}</pre>
          </div>

          {/* SQL Explanation */}
          {explanations.length > 0 && (
            <div className="mt-4 bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">SQL Explanation</h3>
              {explanations.map((exp, i) => (
                <div key={i} className="mb-2">
                  <p className="font-medium">{exp.section}</p>
                  <p className="text-gray-700">{exp.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {queryResults.length > 0 && !isLoading && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Results ({queryResults.length} {queryResults.length === 1 ? 'client' : 'clients'})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md"
              >
                Export CSV
              </button>
              <div className="bg-gray-100 rounded-md p-1 flex">
                <button
                  onClick={() => {
                    console.log("Switching to TABLE view");
                    setViewMode('table');
                  }}
                  className={`px-3 py-1 rounded-md ${
                    viewMode === 'table' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => {
                    console.log("Switching to CHART view");
                    setViewMode('chart');
                  }}
                  className={`px-3 py-1 rounded-md ${
                    viewMode === 'chart' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  disabled={!chartConfig && !isLoadingChart}
                >
                  Chart
                </button>
                <button
                  onClick={() => {
                    console.log("Switching to ACTIONS view");
                    setViewMode('actions');
                  }}
                  className={`px-3 py-1 rounded-md ${
                    viewMode === 'actions' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  disabled={!actionSuggestions && !isLoadingActions}
                >
                  Actions
                </button>
              </div>
            </div>
          </div>

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    {columns.map((column) => (
                      <th key={column} className="py-2 px-3 text-left border-b">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResults.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {columns.map((column) => (
                        <td key={`${rowIndex}-${column}`} className="py-2 px-3 border-b">
                          {row[column] !== null ? String(row[column]) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Chart View */}
          {viewMode === 'chart' && (
            <div className="bg-white p-4 rounded-md border border-gray-200">
              {isLoadingChart ? (
                <ChartLoading />
              ) : chartConfig ? (
                <ChartVisualization config={chartConfig} data={queryResults} />
              ) : (
                <ChartError message="Unable to generate a chart for this data" />
              )}
            </div>
          )}

          {/* Actions View */}
          {viewMode === 'actions' && (
            <div>
              {isLoadingActions ? (
                <ActionSuggestionsLoading />
              ) : actionSuggestions ? (
                <ActionSuggestions 
                  actions={actionSuggestions.actions} 
                  summary={actionSuggestions.summary} 
                />
              ) : (
                <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
                  <p className="text-gray-500">Unable to generate action suggestions for this data</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {sqlQuery && !isLoading && queryResults.length === 0 && (
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <p className="text-gray-500">No clients match these criteria</p>
        </div>
      )}
    </div>
  );
}