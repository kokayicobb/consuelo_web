"use server"

import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { supabaseAdmin } from "@/lib/supabase/client"
import { SQL_EXPLANATION_PROMPT } from "@/lib/prompts/sql-prompts"
import type { QueryExplanation } from "@/types/otf"

const AI_TASK_TIMEOUT = 120000 // 2 minutes

// Enhanced logging with timestamps and structured data
function debugLog(context: string, message: string, metadata?: object) {
  const timestamp = new Date().toISOString()
  console.log(
    JSON.stringify({
      timestamp,
      context,
      message,
      ...metadata,
    }),
  )
}

// Improved stream handling with chunk-level logging
// Updated handleAIStream function
function handleAIStream(stream: ReadableStream<Uint8Array>, context: string) {
  const startTime = Date.now()
  debugLog(context, "Starting stream processing")

  return new Promise<string>(async (resolve, reject) => {
    try {
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let fullText = ""
      let chunkCount = 0

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          debugLog(context, "Stream completed successfully", {
            totalChunks: chunkCount,
            totalLength: fullText.length,
            processingTime: Date.now() - startTime,
          })
          resolve(fullText)
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        chunkCount++
        fullText += chunk

        debugLog(context, "Stream chunk processed", {
          chunkLength: chunk.length,
          totalLength: fullText.length,
          chunkCount,
        })
      }
    } catch (error) {
      debugLog(context, "Stream processing failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
      })
      reject(error)
    }
  })
}

// Improved safeStreamText function with better token handling
// Completely redesigned safeStreamText with enhanced token handling
async function safeStreamText(params: any) {
  const context = "safeStreamText"
  const startTime = Date.now()

  debugLog(context, "Starting AI request", {
    model: params.model,
    maxTokens: params.maxTokens,
  })

  try {
    const result = await streamText(params)
    const stream = result.toDataStream()
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let fullText = ""

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      const textChunk = decoder.decode(value, { stream: true })
      fullText += textChunk
    }

    debugLog(context, "Raw stream response received", {
      rawTextLength: fullText.length,
      rawTextSample: fullText.slice(0, 200),
    })

    // Step 1: Remove all common non-SQL metadata patterns
    const processedText = fullText
      // Remove message/token metadata objects
      .replace(/[a-z]:\{.*?\}/g, "")
      // Remove e:{} and d:{} blocks that often appear at the end
      .replace(/[ed]:\{.*?\}/g, "")

    // Step 2: Handle token format (this is the critical part)
    let extractedSQL = ""

    // Check if we're dealing with tokenized output
    const tokenPattern = /\d+:"([^"]*)"/g
    if (tokenPattern.test(processedText)) {
      debugLog(context, "Detected tokenized format, extracting content")

      // Extract all token contents
      const matches = processedText.matchAll(tokenPattern)
      const tokens = Array.from(matches, (m) => m[1])

      // Join tokens to form SQL
      extractedSQL = tokens.join("")

      debugLog(context, "Extracted token contents", {
        tokenCount: tokens.length,
        extractedPreview: extractedSQL.slice(0, 100),
      })
    } else {
      // Not a tokenized response, use the processed text
      extractedSQL = processedText
    }

    // Step 3: Clean up any remaining formatting and code blocks
    let cleanSQL = extractedSQL
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/<\/?think>/g, "")
      .replace(/```sql/g, "")
      .replace(/```/g, "")
      .replace(/^.*?SELECT/i, "SELECT") // Focus on the SQL statement
      .trim()

    // Step 4: Format SQL properly
    cleanSQL = cleanSQL
      .replace(/\s+/g, " ")
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s*=\s*/g, " = ")
      .replace(/\s*>\s*/g, " > ")
      .replace(/\s*<\s*/g, " < ")
      .replace(/\s*;\s*$/, ";") // Ensure exactly one semicolon at the end

    // Final check: if something went wrong and we still have tokens, fallback to a simple extraction
    if (cleanSQL.includes('":')) {
      debugLog(context, "WARNING: Still detected token format after cleaning", {
        cleanedSample: cleanSQL.slice(0, 100),
      })

      // Extreme fallback: manually try to extract a SQL statement
      const selectMatch = fullText.match(/SELECT\s+.*?;/is)
      if (selectMatch) {
        cleanSQL = selectMatch[0].replace(/\s+/g, " ").trim()
        debugLog(context, "Used fallback SQL extraction", {
          fallbackSQL: cleanSQL,
        })
      }
    }

    // Fix common table name issues
    cleanSQL = cleanSQL
      .replace(/otf-/g, '"otf-')
      .replace(/(\botf-[a-z-]+\b)(?!")/g, '$1"')
      .replace(/"otf-/g, '"otf-')

    debugLog(context, "Final cleaned SQL", {
      textLength: cleanSQL.length,
      sqlText: cleanSQL,
    })

    return cleanSQL
  } catch (error) {
    debugLog(context, "AI request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - startTime,
    })
    throw error
  }
}

// Template-based SQL generator for reliable Supabase compatibility
export async function generateQuery(input: string) {
  const context = "generateQuery"
  const startTime = Date.now()

  debugLog(context, "Process started", {
    input: input,
  })

  try {
    // Normalize input for pattern matching
    const normalizedInput = input.toLowerCase().trim()

    // Common template patterns based on user queries
    let sqlQuery = ""

    // Pattern 1: Late cancellations in a time period
    // In your generateQuery function, update the template for late cancellations:
    // Pattern 1: Late cancellations in a time period
    // Updated generateQuery with contact logs added to all paths
    if (
      normalizedInput.includes("late cancel") ||
      (normalizedInput.includes("cancel") && normalizedInput.includes("last"))
    ) {
      let days = 30
      const daysMatch = normalizedInput.match(/(\d+)\s*days?/)
      if (daysMatch && daysMatch[1]) {
        days = Number.parseInt(daysMatch[1])
      }

      sqlQuery = `SELECT 
    c."Client ID", 
    c."Client", 
    c.Email, 
    c.Phone, 
    s.Date, 
    s.Description, 
    s.Staff AS "Coach",
    (
      SELECT json_agg(log_data)
      FROM (
        SELECT 
          cl."Log Date",
          cl."Contact Method",
          cl."Contact Log",
          cl."Log Type",
          cl."Sub Type",
          cl."Contact"
        FROM "otf-contact-logs" cl
        WHERE cl."Client" = c."Client"
        ORDER BY cl."Log Date" DESC
      ) as log_data
    ) as "contact_logs"
  FROM "otf-clients" c
  JOIN "otf-schedule" s ON s."Client ID" = c."Client ID"
  WHERE s.Status = 'Late Cancel' 
    AND s.Date >= CURRENT_DATE - INTERVAL '${days} days'
  ORDER BY s.Date DESC;`
    } else if (
      (normalizedInput.includes("new") || normalizedInput.includes("member")) &&
      (normalizedInput.includes("no class") ||
        normalizedInput.includes("haven") ||
        normalizedInput.includes("not attend"))
    ) {
      sqlQuery = `SELECT 
    c."Client ID", 
    c."Client", 
    c.Email, 
    c.Phone, 
    c."Pricing Option", 
    c."Expiration Date",
    (
      SELECT json_agg(log_data)
      FROM (
        SELECT 
          cl."Log Date",
          cl."Contact Method",
          cl."Contact Log",
          cl."Log Type",
          cl."Sub Type",
          cl."Contact"
        FROM "otf-contact-logs" cl
        WHERE cl."Client" = c."Client"
        ORDER BY cl."Log Date" DESC
      ) as log_data
    ) as "contact_logs"
  FROM "otf-clients" c
  LEFT JOIN "otf-schedule" s ON c."Client ID" = s."Client ID"
  WHERE s."Client ID" IS NULL 
    AND c."Expiration Date" > CURRENT_DATE
  ORDER BY c."Expiration Date" DESC;`
    } else if (
      normalizedInput.includes("coach") &&
      (normalizedInput.includes("attend") || normalizedInput.includes("rate"))
    ) {
      let timeFrame = "DATE_TRUNC('year', CURRENT_DATE)"
      if (normalizedInput.includes("month")) {
        timeFrame = "DATE_TRUNC('month', CURRENT_DATE)"
      } else if (normalizedInput.includes("week")) {
        timeFrame = "DATE_TRUNC('week', CURRENT_DATE)"
      }

      sqlQuery = `SELECT 
    s.Staff AS "Coach",
    COUNT(*) AS "Total_Classes",
    SUM(CASE WHEN s.Status = 'Signed in' THEN 1 ELSE 0 END) AS "Attended_Classes",
    ROUND(100.0 * SUM(CASE WHEN s.Status = 'Signed in' THEN 1 ELSE 0 END) / COUNT(*), 2) AS "Attendance_Rate"
  FROM "otf-schedule" s
  WHERE s.Date >= ${timeFrame}
  GROUP BY s.Staff
  HAVING COUNT(*) > 10
  ORDER BY "Attendance_Rate" DESC;`
    } else if (
      normalizedInput.includes("client") &&
      (normalizedInput.includes("haven't visit") || normalizedInput.includes("not visit"))
    ) {
      let days = 60
      const daysMatch = normalizedInput.match(/(\d+)\s*days?/)
      if (daysMatch && daysMatch[1]) {
        days = Number.parseInt(daysMatch[1])
      }

      sqlQuery = `SELECT 
    c."Client ID", 
    c."Client", 
    c.Email, 
    c.Phone, 
    c."Last Visit", 
    c."Pricing Option",
    (
      SELECT json_agg(log_data)
      FROM (
        SELECT 
          cl."Log Date",
          cl."Contact Method",
          cl."Contact Log",
          cl."Log Type",
          cl."Sub Type",
          cl."Contact"
        FROM "otf-contact-logs" cl
        WHERE cl."Client" = c."Client"
        ORDER BY cl."Log Date" DESC
      ) as log_data
    ) as "contact_logs"
  FROM "otf-clients" c
  WHERE c."Last Visit" < CURRENT_DATE - INTERVAL '${days} days'
    AND c."Expiration Date" > CURRENT_DATE
  ORDER BY c."Last Visit" ASC;`
    } else if (
      normalizedInput.includes("expir") ||
      normalizedInput.includes("renew") ||
      normalizedInput.includes("expiration")
    ) {
      let days = 30
      const daysMatch = normalizedInput.match(/(\d+)\s*days?/)
      if (daysMatch && daysMatch[1]) {
        days = Number.parseInt(daysMatch[1])
      }

      sqlQuery = `SELECT 
    c."Client ID", 
    c."Client", 
    c.Email, 
    c.Phone, 
    c."Pricing Option", 
    c."Expiration Date",
    c."Last Visit",
    (
      SELECT json_agg(log_data)
      FROM (
        SELECT 
          cl."Log Date",
          cl."Contact Method",
          cl."Contact Log",
          cl."Log Type",
          cl."Sub Type",
          cl."Contact"
        FROM "otf-contact-logs" cl
        WHERE cl."Client" = c."Client"
        ORDER BY cl."Log Date" DESC
      ) as log_data
    ) as "contact_logs"
  FROM "otf-clients" c
  WHERE c."Expiration Date" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
  ORDER BY c."Expiration Date" ASC;`
    } else if (
      normalizedInput.includes("follow") ||
      normalizedInput.includes("contact") ||
      normalizedInput.includes("reach out")
    ) {
      let days = 30
      const daysMatch = normalizedInput.match(/(\d+)\s*days?/)
      if (daysMatch && daysMatch[1]) {
        days = Number.parseInt(daysMatch[1])
      }

      sqlQuery = `SELECT 
    c."Client ID", 
    c."Client", 
    c.Email, 
    c.Phone, 
    c."Last Visit", 
    l."Log Date" AS "Last_Contact_Date",
    (
      SELECT json_agg(log_data)
      FROM (
        SELECT 
          cl."Log Date",
          cl."Contact Method",
          cl."Contact Log",
          cl."Log Type",
          cl."Sub Type",
          cl."Contact"
        FROM "otf-contact-logs" cl
        WHERE cl."Client" = c."Client"
        ORDER BY cl."Log Date" DESC
      ) as log_data
    ) as "contact_logs"
  FROM "otf-clients" c
  LEFT JOIN (
    SELECT "Client", MAX("Log Date") AS "Log Date"
    FROM "otf-contact-logs"
    GROUP BY "Client"
  ) l ON l."Client" = c."Client"
  WHERE (l."Log Date" IS NULL OR l."Log Date" < CURRENT_DATE - INTERVAL '${days} days')
    AND c."Expiration Date" > CURRENT_DATE
  ORDER BY l."Log Date" ASC NULLS FIRST;`
    } else {
      sqlQuery = `SELECT 
    c."Client ID", 
    c."Client", 
    c.Email, 
    c.Phone, 
    c."Last Visit", 
    c."# Visits", 
    c."Pricing Option", 
    c."Expiration Date",
    (
      SELECT json_agg(log_data)
      FROM (
        SELECT 
          cl."Log Date",
          cl."Contact Method",
          cl."Contact Log",
          cl."Log Type",
          cl."Sub Type",
          cl."Contact"
        FROM "otf-contact-logs" cl
        WHERE cl."Client" = c."Client"
        ORDER BY cl."Log Date" DESC
      ) as log_data
    ) as "contact_logs"
  FROM "otf-clients" c
  ORDER BY c."Last Visit" DESC
  LIMIT 50;`
    }

    debugLog(context, "Template-based SQL query generated", {
      finalSql: sqlQuery,
    })

    return sqlQuery
  } catch (error) {
    debugLog(context, "SQL generation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - startTime,
    })
    throw error
  }
}

// Execute SQL query - simpler version with minimal formatting
export async function runGeneratedSQLQuery(sqlQuery: string) {
  const context = "runGeneratedSQLQuery"
  const startTime = Date.now()

  debugLog(context, "Query execution started", {
    originalQuery: sqlQuery,
  })

  try {
    // Basic validation
    if (!sqlQuery || !sqlQuery.trim()) {
      throw new Error("Empty SQL query")
    }

    if (!sqlQuery.toLowerCase().trim().startsWith("select")) {
      throw new Error("Only SELECT queries are allowed")
    }

    // No complex formatting - use the template output directly
    // Just ensure proper semicolon
    let cleanedQuery = sqlQuery.trim()
    cleanedQuery = cleanedQuery.replace(/;\s*$/, "")

    // Log the query for debugging
    debugLog(context, "Executing SQL query", {
      query: cleanedQuery,
    })

    // Execute the query
    const { data, error } = await supabaseAdmin.rpc("execute_sql", {
      query: cleanedQuery,
    })

    if (error) {
      debugLog(context, "Supabase execution error", {
        error: error.message,
        details: error.details,
        hint: error.hint,
        query: cleanedQuery,
      })

      throw new Error(`Database error: ${error.message}${error.hint ? ` (Hint: ${error.hint})` : ""}`)
    }

    debugLog(context, "Query executed successfully", {
      resultCount: data?.length || 0,
      executionTime: Date.now() - startTime,
    })

    return data || []
  } catch (error) {
    debugLog(context, "Query execution failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - startTime,
    })
    throw error
  }
}
// Query Explanation with diagnostics
export async function explainQuery(input: string, sqlQuery: string): Promise<QueryExplanation[]> {
  const context = "explainQuery"
  const startTime = Date.now()

  debugLog(context, "Explanation started", {
    inputPreview: input.slice(0, 50),
    sqlPreview: sqlQuery.slice(0, 50),
  })

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${AI_TASK_TIMEOUT}ms`)), AI_TASK_TIMEOUT),
    )

    const explanationText = await Promise.race([
      safeStreamText({
        model: groq("deepseek-r1-distill-llama-70b"),
        system: SQL_EXPLANATION_PROMPT,
        prompt: `Explain SQL for: ${input}\n${sqlQuery}\nBreakdown required.`,
      }),
      timeoutPromise,
    ])

    const explanations = parseExplanations(explanationText)
    debugLog(context, "Explanation parsed", {
      sectionsFound: explanations.length,
      processingTime: Date.now() - startTime,
    })

    return explanations
  } catch (error) {
    debugLog(context, "Explanation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - startTime,
    })
    throw error
  }
}

// Helper function to parse explanations
function parseExplanations(text: string | unknown): QueryExplanation[] {
  const explanations: QueryExplanation[] = []
  const sections = (text as string).split(/Section:|SECTION:/i).filter(Boolean)

  for (const section of sections) {
    const parts = section.split(/Explanation:|EXPLANATION:/i)
    if (parts.length >= 2) {
      explanations.push({
        section: parts[0].trim(),
        explanation: parts[1].trim(),
      })
    }
  }

  return explanations.length > 0
    ? explanations
    : [
        {
          section: "Full Explanation",
          explanation: (text as string).trim(),
        },
      ]
}

// Visualization Configuration Generator
export async function generateChartConfig(results: any[], userQuery: string) {
  const context = "generateChartConfig"
  const startTime = Date.now()

  debugLog(context, "Chart config started", {
    resultCount: results.length,
    queryPreview: userQuery.slice(0, 50),
  })

  try {
    const jsonText = await safeStreamText({
      model: groq("deepseek-r1-distill-llama-70b"),
      system: "Data visualization expert",
      prompt: `Generate chart config for:\n${userQuery}\nData: ${JSON.stringify(results.slice(0, 20))}`,
    })

    const chartConfig = parseChartConfig(jsonText, results)
    debugLog(context, "Chart config created", {
      configType: chartConfig.type,
      processingTime: Date.now() - startTime,
    })

    return chartConfig
  } catch (error) {
    debugLog(context, "Chart config failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - startTime,
    })
    return getDefaultChartConfig(results)
  }
}

// Action Suggestions Generator
export async function generateActionSuggestions(results: any[], userQuery: string) {
  const context = "generateActionSuggestions"
  const startTime = Date.now()

  debugLog(context, "Action suggestions started", {
    resultCount: results.length,
    queryPreview: userQuery.slice(0, 50),
  })

  try {
    const jsonText = await safeStreamText({
      model: groq("deepseek-r1-distill-llama-70b"),
      system: "Fitness business expert",
      prompt: `Generate actions for:\n${userQuery}\nData: ${JSON.stringify(results.slice(0, 10))}`,
    })

    const suggestions = parseActions(jsonText)
    debugLog(context, "Actions generated", {
      actionCount: suggestions.actions.length,
      processingTime: Date.now() - startTime,
    })

    return suggestions
  } catch (error) {
    debugLog(context, "Action generation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: Date.now() - startTime,
    })
    return getDefaultActions()
  }
}

// Helper functions for fallback configurations
function getChartColor(index: number): string {
  const colors = ["#F58220", "#1E88E5", "#43A047", "#8E24AA", "#FFB300"]
  return colors[index % colors.length]
}

function parseChartConfig(jsonText: string, results: any[]): any {
  try {
    const cleanedJson = jsonText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()
    const config = JSON.parse(cleanedJson)
    return {
      ...config,
      colors: (config.yKeys || []).map((_: any, i: number) => getChartColor(i)),
    }
  } catch {
    return getDefaultChartConfig(results)
  }
}

function getDefaultChartConfig(results: any[]): any {
  return {
    type: "bar",
    title: "Data Overview",
    xKey: Object.keys(results[0] || {})[0] || "x",
    yKeys: [Object.keys(results[0] || {})[1] || "y"],
    colors: [getChartColor(0)],
  }
}

function parseActions(jsonText: string): any {
  try {
    const cleanedJson = jsonText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()
    return JSON.parse(cleanedJson)
  } catch {
    return getDefaultActions()
  }
}

function getDefaultActions(): any {
  return {
    actions: [
      {
        title: "Follow-up Check-in",
        description: "Contact clients for progress update",
        priority: "medium",
        effort: "easy",
        scriptTemplate: "Hi [Name], checking in on your fitness goals...",
      },
    ],
    summary: "Regular communication improves client retention",
  }
}

// Utility function for safe logging
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(16)
}
