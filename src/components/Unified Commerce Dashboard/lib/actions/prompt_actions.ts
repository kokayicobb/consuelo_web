"use server"
import Snoowrap from 'snoowrap';
import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { supabaseAdmin } from "@/lib/supabase/client"
import { SQL_EXPLANATION_PROMPT } from "@/lib/prompts/sql-prompts"
import type { OtfContactLog, QueryExplanation } from "@/types/otf"

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

    const context = "safeStreamGenericText";
    const startTime = Date.now();
  
    debugLog(context, "Starting AI request (Generic)", {
      model: params.model?.modelId || params.model || "unknown", // Handle different model object structures
      maxTokens: params.maxTokens,
      promptPreview: typeof params.prompt === 'string' ? params.prompt.slice(0, 100) : 'N/A',
    });
  
    try {
      // Ensure model is passed correctly (might be nested)
      const modelInstance = typeof params.model === 'string' ? groq(params.model) : params.model;
  
      const result = await streamText({
          ...params,
          model: modelInstance // Use the potentially unwrapped model instance
      });
  
      // --- Simpler text accumulation ---
      let fullText = '';
      for await (const textPart of result.textStream) {
          fullText += textPart;
      }
      // --- End simpler text accumulation ---
  
  
      debugLog(context, "Raw stream response received (Generic)", {
         rawTextLength: fullText.length,
         rawTextSample: fullText.slice(0, 200),
      });
  
      // Minimal cleaning: remove common stream metadata if necessary, trim
      // Vercel AI SDK might add prefixes like `0:"`, `1:"`, etc. or data messages `d:{...}`
      // Let's try a more robust way to handle potential prefixes/metadata
      let cleanText = fullText;
  
      // Attempt to remove potential Vercel AI SDK stream prefixes/data messages
      // Example: 0:"Hello" -> "Hello"
      // Example: d:{"some":"data"} -> ""
      cleanText = cleanText.replace(/^\d+:"/, '"').replace(/"\s*$/, '"'); // Handle potential quote wrapping if prefix is removed
      if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
         try {
            // If it looks like a JSON string, parse it to unescape characters
            cleanText = JSON.parse(cleanText);
         } catch {
           // If parsing fails, remove just the outer quotes
           cleanText = cleanText.substring(1, cleanText.length - 1);
         }
      }
      // Remove data messages like d:{...} or e:{...}
      cleanText = cleanText.replace(/(?:^[de]:\{.*?\}$)/gm, '');
  
      // Replace escaped newlines with actual newlines
      cleanText = cleanText.replace(/\\n/g, '\n').trim();
  
      debugLog(context, "Processed generic text", {
         textLength: cleanText.length,
         textPreview: cleanText.slice(0,100)
      });
  
      return cleanText;
  
    } catch (error) {
      debugLog(context, "AI request failed during generic text processing", {
        error: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined,
        duration: Date.now() - startTime,
      });
      // It's often better to throw the error here and let the calling function handle it
      // This prevents returning a potentially misleading success state.
      throw error;
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
  FROM "clients" c
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
  FROM "clients" c
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
  FROM "clients" c
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
  FROM "clients" c
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
  FROM "clients" c
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
  FROM "clients" c
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
export async function generateSalesScript({
  contactLogs,
  scriptType,
  clientName,
  queryContext,
  businessName = "Orange Theory Fitness" // Default to Orange Theory, can be overridden
}: {
  contactLogs?: OtfContactLog[];
  scriptType: 'call' | 'email';
  clientName?: string;
  queryContext?: string;
  businessName?: string;
}): Promise<string> {
  const context = "generateSalesScript";
  const startTime = Date.now();
  debugLog(context, "Script generation started", { 
    scriptType, 
    clientName, 
    hasLogs: !!contactLogs?.length,
    logCount: contactLogs?.length || 0,
    queryContextPreview: queryContext?.slice(0, 50) 
  });

  let promptContent = `You are an expert sales scriptwriter for ${businessName}.
Your task is to generate a compelling and effective ${scriptType} script.`;

  if (clientName) {
    promptContent += `\nThe script is specifically for a client named ${clientName}. Personalize the script for them.`;
  } else if (queryContext) {
    promptContent += `\nThe script should be generally applicable to clients related to the following context or query: "${queryContext}".`;
  }

  if (contactLogs && contactLogs.length > 0) {
    promptContent += `\n\nTo help you tailor the script, here's a summary or examples of recent contact logs (up to 5 shown):\n`;
    // Provide a sample of logs to guide the LLM without overwhelming it
    const logsSample = contactLogs.slice(0, 5); // Show up to 5 logs
    const formattedLogs = logsSample.map(log => {
      let logEntry = `- Log Date: ${log["Log Date"] || 'N/A'}`;
      if (log["Client"]) logEntry += `, Client: ${log["Client"]}`; // Include client name if available in log
      logEntry += `, Method: ${log["Contact Method"] || 'N/A'}`;
      logEntry += `, Type: ${log["Log Type"] || 'N/A'}`;
      if (log["Contact Log"]) logEntry += `, Note: "${log["Contact Log"]}"`;
      return logEntry;
    }).join("\n");
    promptContent += formattedLogs;
    promptContent += `\n\nBased on these interactions (if available) and the overall context, craft the ${scriptType} script.`;
    
    if (scriptType === 'call') {
      promptContent += ` The call script should be engaging, empathetic, aim to understand the client's current needs or situation, address potential concerns hinted at in the logs (if any), and guide them towards a clear positive action (e.g., booking a class, discussing membership options, reactivating an account).`;
    } else { // email
      promptContent += ` The email script should be concise, professional, personalized, and have a clear call to action. Ensure it's easy to read and encourages a response or desired action.`;
    }
  } else {
    promptContent += `\n\nSince no specific contact logs are provided for this request, generate a more general ${scriptType} script for ${businessName}.`;
    if (scriptType === 'call') {
      promptContent += ` This call script should be welcoming, clearly articulate the value of ${businessName}, and motivate the listener to take the next step (e.g., schedule a visit, learn more).`;
    } else { // email
      promptContent += ` This email script should effectively introduce or re-engage with ${businessName}, highlight key benefits, and include a strong call to action (e.g., visit website, book an intro class).`;
    }
  }

  promptContent += `\n\nKey objectives:
  - For call scripts: Be conversational, clear, and goal-oriented. Include a strong opening and closing.
  - For email scripts: Be professional, skimmable, with a clear subject line (if you were to suggest one, though only provide the body), and a compelling call-to-action.
  - Adapt the tone appropriately for ${businessName}.
  
  Output *only* the complete script text. Do not include any preambles, explanations, or markdown formatting like \`\`\` around the script. Just the raw script.`;

  try {
    // Using the existing safeStreamText utility. It should handle plain text output reasonably well.
    // If issues arise with script formatting due to SQL-specific cleaning in safeStreamText,
    // a simpler text extraction method from the stream might be needed.
    const script = await safeStreamText({
      model: groq("deepseek-r1-distill-llama-70b"), // Or your preferred model, e.g., "deepseek-r1-distill-llama-70b"
      system: `You are an expert sales scriptwriter for ${businessName}. Your goal is to produce high-quality, ready-to-use scripts.`,
      prompt: promptContent,
      maxTokens: 700, // Increased for potentially longer scripts
      // temperature: 0.7, // Optional: Adjust for creativity vs. predictability
    });

    debugLog(context, "Script generated successfully", { 
      scriptType, 
      clientName, 
      scriptLength: script.length,
      processingTime: Date.now() - startTime 
    });
    return script; // safeStreamText already trims and processes the text
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    debugLog(context, "Script generation failed", {
      error: errorMessage,
      scriptType,
      clientName,
      duration: Date.now() - startTime,
    });
    // Consider re-throwing a more user-friendly error or a specific error type
    throw new Error(`Failed to generate ${scriptType} script: ${errorMessage}`);
  }
  
}
export async function generateKeyTalkingPoints(scriptText: string): Promise<string[]> {
  const context = "generateKeyTalkingPoints";
  const startTime = Date.now();
  debugLog(context, "Talking points generation started", {
    scriptLength: scriptText.length,
    scriptPreview: scriptText.slice(0, 100) + "..."
  });

  if (!scriptText || scriptText.trim().length < 20) {
    debugLog(context, "Skipping generation for short/empty script");
    return []; // Return empty if script too short (intended behavior)
  }

  // Prompt asking specifically for a JSON array string
  const promptContent = `Analyze the following sales script and extract the 3 to 5 most important key talking points for the salesperson. Focus on the core message, key value propositions mentioned, and the main call-to-action.

Sales Script:
---
${scriptText}
---

Output *only* a JSON array of strings, where each string is a single talking point. Do not include any introductory text, explanations, or markdown formatting like \`\`\` or \`\`\`json. Just the raw JSON array itself.

Example of desired output format:
["Key point 1", "Key point 2", "Key point 3"]`;

  try {
    // Use safeStreamGenericText
    const aiResponse = await safeStreamText({
      model: groq("deepseek-r1-distill-llama-70b"), // Or another capable model
      // REMOVED response_format: { type: "json_object" } - Let the prompt guide it
      system: "You are an expert sales coach. Your task is to identify the 3-5 most crucial talking points from a sales script. Output ONLY a JSON array of strings as requested.",
      prompt: promptContent,
      maxTokens: 250,
      temperature: 0.2, // Lower temperature for more deterministic JSON output
    });

    // Log the *exact* response received before parsing attempts
    debugLog(context, "AI raw response received for talking points", {
      rawResponse: aiResponse, // Log the full response
      responseLength: aiResponse.length,
    });

    // --- Attempt to parse the response as JSON ---
    let points: string[] = [];
    let parseErrorMsg: string | null = null;

    try {
       if (!aiResponse || aiResponse.trim() === '') {
            throw new Error("Received empty response from AI.");
       }
      // 1. Try to find JSON array brackets `[...]` anywhere in the string
      const jsonMatch = aiResponse.match(/(\[[\s\S]*?\])/);
      let jsonString = '';

      if (jsonMatch && jsonMatch[0]) {
        jsonString = jsonMatch[0];
        debugLog(context, "Extracted potential JSON array string via regex", { jsonString });
      } else {
        // 2. If no brackets found, check if the entire trimmed response IS the array
        const trimmedResponse = aiResponse.trim();
        if (trimmedResponse.startsWith('[') && trimmedResponse.endsWith(']')) {
          jsonString = trimmedResponse;
          debugLog(context, "Using trimmed AI response as potential JSON array string");
        } else {
          // 3. If neither works, assume it's not JSON and trigger fallback later
           debugLog(context, "No JSON array structure found, will attempt fallback.");
           // We don't throw error here yet, let the outer catch handle fallback
           parseErrorMsg = "AI response did not contain a valid JSON array structure '[...]'.";
        }
      }

      // Only parse if we think we found a JSON string
      if (jsonString) {
        points = JSON.parse(jsonString);

        // Validate the parsed structure
        if (!Array.isArray(points)) { // Stricter check
          throw new Error("Parsed JSON is not an array.");
        }
        // Ensure all elements are strings (or filter out non-strings)
        points = points.filter(p => typeof p === "string" && p.trim().length > 0);

         if (points.length === 0 && jsonString.length > 2) {
             // Parsed correctly but resulted in empty array (e.g., ["", ""])
             debugLog(context, "JSON parsed but resulted in empty points array.");
             // Allow fallback by setting parseErrorMsg
             parseErrorMsg = "JSON parsed but contained no valid string points.";
         } else if (points.length > 0) {
            debugLog(context, "Successfully parsed JSON talking points", { count: points.length });
             // Successfully parsed, clear any previous parse error message
             parseErrorMsg = null;
         }
      }
       // If parseErrorMsg is still set here, JSON parsing effectively failed or yielded nothing useful

    } catch (parseError) {
       parseErrorMsg = parseError instanceof Error ? parseError.message : "Unknown JSON parsing error";
       debugLog(context, "JSON parsing failed", { error: parseErrorMsg, rawResponse: aiResponse });
       points = []; // Ensure points is empty if JSON parsing fails
    }

    // --- Fallback: Newline Split (ONLY if JSON parsing failed or yielded no points) ---
    if (points.length === 0) {
        debugLog(context, "JSON parsing yielded no points, attempting newline split fallback", { reason: parseErrorMsg });

        const potentialPoints = aiResponse
            .split('\n') // Split by newline
            .map(p => p.replace(/^[\s"-]*\*?\s*([\d.]+)?\s*/, '') // Remove leading spaces, quotes, dashes, list markers (*, 1.)
                       .replace(/\\"/g, '"') // Fix escaped quotes
                       .replace(/",?\s*$/, '') // Remove trailing quote/comma/space
                       .trim())
            .filter(p => p.length > 10 && !p.startsWith('{') && !p.endsWith('}')); // Filter out short lines, likely JSON objects

       if (potentialPoints.length > 0) {
          points = potentialPoints;
          debugLog(context, "Using newline split fallback results", { count: points.length });
       } else {
           // If BOTH JSON and newline split fail, return a specific error message in the array
            debugLog(context, "Both JSON parsing and newline fallback failed to yield points.");
            // Construct user-facing error message
            const finalError = parseErrorMsg ? `Parsing failed: ${parseErrorMsg}` : "Could not extract points from response.";
            return [`Error: ${finalError} Please review script manually.`];
       }
    }

    // Final log before returning successfully extracted points
    debugLog(context, "Talking points processing finished successfully", {
      pointCount: points.length,
      finalPoints: points,
      processingTime: Date.now() - startTime,
    });

    // Ensure max 5 points are returned
    return points.slice(0, 5);

  } catch (error) {
    // This catches errors during the safeStreamGenericText call itself
    debugLog(context, "AI call failed during talking points generation", {
      error: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack: undefined,
      duration: Date.now() - startTime,
    });
    // Return a user-friendly error message IN THE ARRAY for the UI
    return ["Error: AI call failed. Please check logs or try again."];
  }
}

// Define the suggestion type
interface ScriptSuggestion {
  original?: string;
  suggested: string;
  type: 'tone' | 'clarity' | 'structure' | 'enhancement';
  reason?: string;
}

/**
 * Generate AI-powered suggestions to improve a sales script
 */
/**
 * Generate AI-powered suggestions to improve a sales script
 */
export async function generateScriptEdits(scriptText: string): Promise<ScriptSuggestion[]> {
  const context = "generateScriptEdits";
  const startTime = Date.now();
  console.log(`${context}: Starting edit suggestions for script of length ${scriptText.length}`);

  if (!scriptText || scriptText.trim().length < 30) {
    console.log(`${context}: Script too short for meaningful suggestions`);
    return [];
  }

  const promptContent = `Analyze the following sales script and suggest 3-5 specific improvements:

Sales Script:
---
${scriptText}
---

For each suggestion:
1. Identify a specific part of the text that could be improved (and provide that exact text)
2. Provide the suggested replacement text
3. Classify the suggestion as one of: "tone", "clarity", "structure", or "enhancement"
4. Include a short reason why this change would improve the script

Output a JSON array where each item has these properties:
- original: The exact text being replaced (if applicable)
- suggested: The text to replace it with
- type: One of ["tone", "clarity", "structure", "enhancement"]
- reason: Why this improves the script

Example format:
[
  {
    "original": "Hello, this is Orange Theory.",
    "suggested": "Hello! I noticed it's been a while since your last visit to Orange Theory Fitness.",
    "type": "tone",
    "reason": "More friendly opening to re-engage the client"
  }
]

Important: Output only the JSON array with no other text, explanation, or formatting.`;

  try {
    const aiResponse = await streamText({
      model: groq("deepseek-r1-distill-llama-70b"),
      system: "You are an expert sales coach specializing in creating effective client communication. You provide concise, actionable suggestions to improve sales scripts.",
      prompt: promptContent,
      maxTokens: 800,
      temperature: 0.2,
    });

    // Accumulate the response
    let fullText = '';
    for await (const textPart of aiResponse.textStream) {
      fullText += textPart;
    }

    console.log(`${context}: Raw AI response received, length: ${fullText.length}`);

    // Extract and parse JSON array
    // First, clean up the response
    let cleanedJson = fullText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Try to find JSON array pattern
    const jsonMatch = cleanedJson.match(/(\[[\s\S]*?\])/);
    if (jsonMatch && jsonMatch[0]) {
      cleanedJson = jsonMatch[0];
    }

    // Parse the JSON
    const suggestions: ScriptSuggestion[] = JSON.parse(cleanedJson);

    // Validate the structure
    const validSuggestions = suggestions
      .filter(s => 
        typeof s.suggested === "string" && 
        s.suggested.trim().length > 0 &&
        typeof s.type === "string" &&
        ["tone", "clarity", "structure", "enhancement"].includes(s.type)
      )
      .slice(0, 5); // Limit to 5 suggestions
      
    console.log(`${context}: Generated ${validSuggestions.length} valid suggestions`);
    return validSuggestions;
  } catch (error) {
    console.error(`${context}: Error generating suggestions:`, error);
    
    // Return fallback suggestions if API fails
    return [
      {
        original: "Hello",  // Now we include the original text to replace
        suggested: "Hello! I noticed it's been a while since your last visit to Orange Theory Fitness.",
        type: 'tone',
        reason: 'More welcoming opener'
      },
      {
        suggested: "Would you be interested in our new [Premium] membership that includes unlimited classes?",
        type: 'enhancement',
        reason: 'Specific offer increases conversion rate'
      },
      {
        suggested: "I'd love to schedule a time for you to come back and experience our updated workout program.",
        type: 'clarity',
        reason: 'Clear call to action'
      }
    ];
  }
}
// Interface for posts from Reddit API
interface RedditPostData {
  id: string;
  subreddit: string;
  author: string | null;
  title: string;
  selftext: string;
  url: string;
  created_utc: number;
}

// Interface for potential leads
export interface PotentialLead {
  id: string;
  subreddit: string;
  username: string;
  content: string;
  date: string;
  sentiment: 'seeking_funding' | 'cash_flow_issues' | 'expansion_plans' | 'equipment_needs' | 'inventory_funding' | 'growth_opportunity' | 'generic_mention' | 'other' | 'not_applicable_if_not_lead';
  status: 'new';
  score: number;
  url: string;
  reasoning?: string;
}

// Function to scrape Reddit data
async function scrapeSubredditsWithFetch(
  subredditNames: string[],
  keywords: string[],
  limitPerSubreddit: number = 25,
  timeframe: 'day' | 'week' | 'month' | 'year' | 'all' = 'month'
): Promise<RedditPostData[]> {
  const context = "scrapeSubredditsWithFetch";
  debugLog(context, `Starting Reddit scrape with direct fetch for ${timeframe} timeframe...`, { 
    subreddits: subredditNames, 
    keywordsCount: keywords.length,
    limitPerSubreddit
  });

  const allPosts: RedditPostData[] = [];
  const USER_AGENT = process.env.REDDIT_USER_AGENT || 'BusinessLendingAgent/1.0';

  // Process each subreddit
  for (const subredditName of subredditNames) {
    try {
      debugLog(context, `Fetching r/${subredditName}...`);
      
      // For loan/borrow subreddits, be VERY inclusive since these are direct requests
      const isDirectLoanSubreddit = ['borrow', 'simpleloans', 'donationrequest'].includes(subredditName.toLowerCase());
      const isBusinessSubreddit = ['smallbusiness', 'entrepreneur', 'startups', 'business'].includes(subredditName.toLowerCase());
      
      // Use 'new' for loan subreddits to get recent requests, 'top' for business subreddits
      const endpointType = isDirectLoanSubreddit ? 'new' : (isBusinessSubreddit ? 'new' : 'top');
      
      // Reddit's JSON API endpoint
      const url = `https://www.reddit.com/r/${subredditName}/${endpointType}.json?limit=${limitPerSubreddit}&t=${timeframe}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.data || !data.data.children) {
        debugLog(context, `No valid data returned for r/${subredditName}`);
        continue;
      }
      
      // Process posts
      const posts = data.data.children;
      debugLog(context, `Successfully fetched ${posts.length} posts from r/${subredditName}`);
      
      for (const post of posts) {
        const postData = post.data;
        
        // For loan/borrow subreddits, include almost everything since it's all loan requests
        let includePost = false;
        
        if (isDirectLoanSubreddit) {
          // For direct loan subreddits, include virtually all posts since they're requesting money
          includePost = true; // These subreddits are specifically for loan requests
        } else if (isBusinessSubreddit) {
          // For business subreddits, include posts that might relate to funding/growth
          const businessKeywords = ['funding', 'loan', 'capital', 'cash flow', 'revenue', 'investment', 
            'equipment', 'inventory', 'expansion', 'grow', 'scale', 'money', 'finance', 
            'credit', 'working capital', 'startup costs', 'business loan', 'line of credit',
            'sba', 'bank', 'lender', 'financing', 'budget', 'expenses', 'profit', 'sales'];
          
          includePost = businessKeywords.some(kw => 
            postData.title.toLowerCase().includes(kw.toLowerCase()) || 
            (postData.selftext && postData.selftext.toLowerCase().includes(kw.toLowerCase()))
          );
          
          // If we can't find business keywords, include posts where people are seeking advice or help
          if (!includePost) {
            const helpKeywords = ['need help', 'advice needed', 'struggling with', 'how do i', 
                                'looking for advice', 'need suggestions', 'cash problems', 'tight budget',
                                'need money', 'financial help', 'business advice'];
            
            includePost = helpKeywords.some(kw => 
              postData.title.toLowerCase().includes(kw.toLowerCase()) || 
              (postData.selftext && postData.selftext.toLowerCase().includes(kw.toLowerCase()))
            );
          }
        } else {
          // For other subreddits, use the original keyword matching
          includePost = keywords.some(kw => 
            postData.title.toLowerCase().includes(kw.toLowerCase()) || 
            (postData.selftext && postData.selftext.toLowerCase().includes(kw.toLowerCase()))
          );
        }
        
        if (includePost) {
          allPosts.push({
            id: postData.id,
            subreddit: postData.subreddit,
            author: postData.author,
            title: postData.title,
            selftext: postData.selftext || '',
            url: `https://www.reddit.com${postData.permalink}`,
            created_utc: postData.created_utc
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching r/${subredditName}:`, error);
      debugLog(context, `Error fetching r/${subredditName}`, { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }
  
  debugLog(context, `Completed scraping. Found ${allPosts.length} relevant posts`);
  return allPosts;
}

// Business funding lead analysis
async function analyzePotentialLead(postContent: string, keywords: string[]): Promise<{
  is_lead: boolean;
  lead_score: number;
  sentiment: string;
  reasoning: string;
  relevant_snippet: string;
}> {
  // Extract key information from the post content
  const subreddit = postContent.match(/Subreddit: r\/([^\s]+)/)?.[1] || '';
  const title = postContent.match(/Title: ([^\n]+)/)?.[1] || '';
  const content = postContent.match(/Content \(first 1000 chars\): ([^]*?)(?:URL:|$)/s)?.[1]?.trim() || '';
  const combinedText = (title + ' ' + content).toLowerCase();
  
  // Initialize score
  let score = 0;
  let isLead = false;
  let sentiment = 'other';
  let reasoning = '';
  let relevant_snippet = content.substring(0, 200);
  
  // --- SUBREDDIT RELEVANCE ---
  const isDirectLoanSubreddit = ['borrow', 'simpleloans', 'donationrequest'].includes(subreddit.toLowerCase());
  const isBusinessSubreddit = ['smallbusiness', 'entrepreneur', 'startups', 'business'].includes(subreddit.toLowerCase());
  
  // Give highest score for direct loan subreddits
  if (isDirectLoanSubreddit) {
    score += 40; // Very high starting boost for direct loan requests
    reasoning += `Post in direct loan subreddit r/${subreddit}. `;
    sentiment = 'seeking_funding'; // Default sentiment for these subreddits
  } else if (isBusinessSubreddit) {
    score += 20; // Strong starting boost for business subreddits
    reasoning += `Post in business subreddit r/${subreddit}. `;
  }
  
  // --- FUNDING/FINANCIAL NEED SIGNALS ---
  // Direct funding-related terms
  const fundingTerms = [
    'need funding', 'need loan', 'need capital', 'need money', 'need cash', 'need financing',
    'looking for funding', 'seeking funding', 'apply for loan', 'business loan', 'small business loan',
    'working capital', 'line of credit', 'equipment financing', 'invoice factoring',
    'cash flow problems', 'cash flow issues', 'short on cash', 'tight budget', 'financial struggle'
  ];
  
  // More subtle financial stress indicators
  const financialStressTerms = [
    'struggling financially', 'money tight', 'hard to pay', 'behind on payments', 'debt',
    'can\'t afford', 'expensive', 'costly', 'budget constraints', 'limited funds',
    'financial pressure', 'making ends meet', 'payroll', 'overhead costs'
  ];
  
  const fundingMatches = fundingTerms.filter(term => combinedText.includes(term.toLowerCase()));
  const stressMatches = financialStressTerms.filter(term => combinedText.includes(term.toLowerCase()));
  
  // High score for direct funding needs
  if (fundingMatches.length > 0) {
    const fundingBoost = Math.min(fundingMatches.length * 15, 40);
    score += fundingBoost;
    reasoning += `Direct funding needs mentioned: ${fundingMatches.join(', ')}. `;
    sentiment = 'seeking_funding';
  }
  
  // Medium score for financial stress indicators
  if (stressMatches.length > 0) {
    const stressBoost = Math.min(stressMatches.length * 10, 25);
    score += stressBoost;
    reasoning += `Financial stress indicators: ${stressMatches.join(', ')}. `;
    if (sentiment === 'other') sentiment = 'cash_flow_issues';
  }
  
  // --- GENERAL BUSINESS SIGNALS ---
  // Even general business discussion can be valuable
  const generalBusinessTerms = [
    'small business', 'my business', 'our business', 'startup', 'company', 'llc', 'inc',
    'entrepreneur', 'business owner', 'self employed', 'freelance', 'side business',
    'business plan', 'business model', 'customer', 'client', 'market', 'competition'
  ];
  
  const generalMatches = generalBusinessTerms.filter(term => combinedText.includes(term.toLowerCase()));
  
  if (generalMatches.length > 0) {
    const generalBoost = Math.min(generalMatches.length * 3, 15);
    score += generalBoost;
    reasoning += `General business indicators present. `;
  }
  
  // --- OPPORTUNITY SIGNALS ---
  // Signals that suggest potential for growth/funding needs
  const opportunityTerms = [
    'opportunity', 'potential', 'could grow', 'want to expand', 'thinking about',
    'considering', 'planning', 'dream', 'goal', 'vision', 'next step',
    'big break', 'game changer', 'breakthrough', 'pivot', 'transition'
  ];
  
  const opportunityMatches = opportunityTerms.filter(term => combinedText.includes(term.toLowerCase()));
  
  if (opportunityMatches.length > 0) {
    const opportunityBoost = Math.min(opportunityMatches.length * 5, 20);
    score += opportunityBoost;
    reasoning += `Business opportunity signals: ${opportunityMatches.join(', ')}. `;
    if (sentiment === 'other') sentiment = 'growth_opportunity';
  }
  const growthTerms = [
    'expand', 'expansion', 'growing', 'scale up', 'scaling', 'new location', 'second location',
    'hire employees', 'hiring', 'increase inventory', 'buy equipment', 'new equipment',
    'purchase equipment', 'upgrade', 'invest in', 'opportunity', 'big order', 'large contract'
  ];
  
  const growthMatches = growthTerms.filter(term => combinedText.includes(term.toLowerCase()));
  
  if (growthMatches.length > 0) {
    const growthBoost = Math.min(growthMatches.length * 10, 30);
    score += growthBoost;
    reasoning += `Business growth indicators: ${growthMatches.join(', ')}. `;
    if (sentiment === 'other') sentiment = 'expansion_plans';
  }
  
  // --- CASH FLOW ISSUES ---
  const cashFlowTerms = [
    'cash flow', 'slow paying customers', 'accounts receivable', 'payment delays',
    'seasonal business', 'feast or famine', 'inconsistent income', 'waiting for payment',
    'invoice', 'net 30', 'net 60', 'collection issues'
  ];
  
  const cashFlowMatches = cashFlowTerms.filter(term => combinedText.includes(term.toLowerCase()));
  
  if (cashFlowMatches.length > 0) {
    const cashFlowBoost = Math.min(cashFlowMatches.length * 8, 25);
    score += cashFlowBoost;
    reasoning += `Cash flow concerns: ${cashFlowMatches.join(', ')}. `;
    if (sentiment === 'other') sentiment = 'cash_flow_issues';
  }
  
  // --- EQUIPMENT/INVENTORY NEEDS ---
  const equipmentTerms = [
    'need equipment', 'buy equipment', 'lease equipment', 'equipment financing',
    'new machinery', 'tools', 'vehicle', 'truck', 'van', 'computer', 'software',
    'inventory', 'stock', 'supplies', 'materials', 'bulk purchase'
  ];
  
  const equipmentMatches = equipmentTerms.filter(term => combinedText.includes(term.toLowerCase()));
  
  if (equipmentMatches.length > 0) {
    const equipmentBoost = Math.min(equipmentMatches.length * 7, 20);
    score += equipmentBoost;
    reasoning += `Equipment/inventory needs: ${equipmentMatches.join(', ')}. `;
    if (sentiment === 'other') sentiment = 'equipment_needs';
  }
  
  // --- BUSINESS TYPE INDICATORS ---
  const businessTypes = [
    'restaurant', 'retail', 'manufacturing', 'construction', 'contractor', 'service business',
    'consulting', 'agency', 'ecommerce', 'online business', 'brick and mortar', 'franchise',
    'salon', 'auto repair', 'cleaning service', 'landscaping', 'plumbing', 'electrical'
  ];
  
  const businessTypeMatches = businessTypes.filter(term => combinedText.includes(term.toLowerCase()));
  
  if (businessTypeMatches.length > 0) {
    score += 5; // Small boost for having identifiable business type
    reasoning += `Business type identified: ${businessTypeMatches.join(', ')}. `;
  }
  
  // --- REVENUE/SIZE INDICATORS ---
  const revenueIndicators = [
    'revenue', 'sales', 'profit', 'income', 'gross', 'net', '$', 'million', 'thousand',
    'employees', 'staff', 'team size', 'years in business', 'established'
  ];
  
  const revenueMatches = revenueIndicators.filter(term => combinedText.includes(term.toLowerCase()));
  
  if (revenueMatches.length > 0) {
    score += Math.min(revenueMatches.length * 3, 15);
    reasoning += `Business metrics mentioned. `;
  }
  
  // --- INTENT SIGNALS ---
  const intentTerms = [
    'need advice', 'looking for help', 'suggestions', 'recommendations', 'what should i do',
    'how do i', 'where can i', 'best way to', 'anyone know', 'has anyone', 'experience with'
  ];
  
  const intentMatches = intentTerms.filter(term => combinedText.includes(term.toLowerCase()));
  
  if (intentMatches.length > 0) {
    const intentBoost = Math.min(intentMatches.length * 5, 20);
    score += intentBoost;
    reasoning += `Seeking advice/help: ${intentMatches.join(', ')}. `;
  }
  
  // --- URGENCY INDICATORS ---
  const urgencyTerms = [
    'urgent', 'asap', 'quickly', 'emergency', 'immediately', 'deadline', 'time sensitive',
    'running out of time', 'need soon', 'by next week', 'by month end'
  ];
  
  const urgencyMatches = urgencyTerms.filter(term => combinedText.includes(term.toLowerCase()));
  
  if (urgencyMatches.length > 0) {
    score += 15;
    reasoning += `Urgency indicators present. `;
  }
  
  // --- NEGATIVE SIGNALS ---
  
  // Automated/mod posts
  if (title.includes('Daily') || title.includes('Weekly') || title.includes('Thread') || 
      title.includes('Megathread') || title.toLowerCase().includes('automod')) {
    score = Math.max(score - 25, 0);
    reasoning += "Automated or recurring thread. ";
  }
  
  // Posts about giving advice rather than seeking it
  if (combinedText.includes('here\'s how') || combinedText.includes('my advice') || 
      combinedText.includes('pro tip') || combinedText.includes('lesson learned')) {
    score = Math.max(score - 10, 0);
    reasoning += "Giving advice rather than seeking help. ";
  }
  
  // Success stories (less likely to need funding immediately)
  if (combinedText.includes('success story') || combinedText.includes('made it') || 
      combinedText.includes('achieved') || combinedText.includes('milestone')) {
    score = Math.max(score - 5, 0);
    reasoning += "Success story - may not need immediate funding. ";
  }
  
  // --- FINAL SCORING & CATEGORIZATION ---
  
  // Cap score at 100
  score = Math.min(Math.max(score, 0), 100);
  
  // Different thresholds based on subreddit type
  let leadThreshold;
  if (isDirectLoanSubreddit) {
    leadThreshold = 10; // Very low threshold for direct loan subreddits
  } else if (isBusinessSubreddit) {
    leadThreshold = 15; // Low threshold for business subreddits  
  } else {
    leadThreshold = 25; // Higher threshold for other subreddits
  }
  
  if (score >= leadThreshold) {
    isLead = true;
    
    // Set sentiment if not already specified
    if (sentiment === 'other') {
      if (isDirectLoanSubreddit) {
        sentiment = 'seeking_funding'; // Direct loan requests are always seeking funding
      } else if (score >= 60) {
        sentiment = 'seeking_funding';
      } else if (score >= 35) {
        sentiment = 'growth_opportunity';
      } else {
        sentiment = 'generic_mention';
      }
    }
    
    // Final assessment
    if (isDirectLoanSubreddit) {
      reasoning += "Direct loan request - high priority lead.";
    } else if (score >= 60) {
      reasoning += "High-quality lead with clear funding potential.";
    } else if (score >= 35) {
      reasoning += "Good potential lead with business growth indicators.";
    } else {
      reasoning += "Potential lead worth monitoring for business development.";
    }
  } else {
    isLead = false;
    sentiment = 'not_applicable_if_not_lead';
    reasoning += "Limited indicators of immediate funding needs.";
  }
  
  // Extract a relevant snippet that shows why this is a good lead
  if (isLead) {
    // Try to extract the most relevant sentence
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Prioritize sentences with funding terms
    const fundingSentence = sentences.find(s => {
      const lower = s.toLowerCase();
      return fundingTerms.some(t => lower.includes(t.toLowerCase()));
    });
    
    if (fundingSentence) {
      relevant_snippet = fundingSentence.trim();
    } else {
      // Otherwise prioritize: growth indicators, then cash flow, then equipment needs
      const growthSentence = sentences.find(s => {
        const lower = s.toLowerCase();
        return growthTerms.some(t => lower.includes(t.toLowerCase()));
      });
      
      if (growthSentence) {
        relevant_snippet = growthSentence.trim();
      } else {
        const cashFlowSentence = sentences.find(s => 
          cashFlowTerms.some(t => s.toLowerCase().includes(t.toLowerCase()))
        );
        if (cashFlowSentence) relevant_snippet = cashFlowSentence.trim();
        else {
          const equipmentSentence = sentences.find(s => 
            equipmentTerms.some(t => s.toLowerCase().includes(t.toLowerCase()))
          );
          if (equipmentSentence) relevant_snippet = equipmentSentence.trim();
        }
      }
    }
  }
  
  return {
    is_lead: isLead,
    lead_score: score,
    sentiment: sentiment,
    reasoning: reasoning,
    relevant_snippet: relevant_snippet || title // Fall back to title if no good snippet found
  };
}

// Process Reddit data for business funding leads
export async function processRedditDataForLeads(
  selectedSubredditsConfig: Array<{ name: string; category: string; selected: boolean }>,
  keywords: string[],
  contentFilterConfig: any,
  scanFrequency: string
): Promise<PotentialLead[]> {
  const context = "processRedditDataForLeads";
  const startTime = Date.now();
  
  console.log("==== BUSINESS FUNDING LEAD PROCESSING STARTED ====");
  debugLog(context, "Starting lead processing...", { 
    numKeywords: keywords.length, 
    scanFrequency,
    subredditsCount: selectedSubredditsConfig.length
  });

  // Get active subreddits
  const activeSubreddits = selectedSubredditsConfig
    .filter(sr => sr.selected)
    .map(sr => sr.name);

  if (activeSubreddits.length === 0) {
    debugLog(context, "No active subreddits selected. Aborting.");
    return [];
  }
  
  debugLog(context, "Active subreddits", { activeSubreddits });

  // Step 1: Scrape Reddit posts
  const scrapedPosts = await scrapeSubredditsWithFetch(activeSubreddits, keywords, 50, 'month');
  console.log("==== SCRAPING DEBUG INFO ====");
console.log("scrapeSubredditsWithFetch result:", {
  length: scrapedPosts.length,
  firstPost: scrapedPosts[0] || "No posts",
  activeSubreddits,
  keywords
});
  debugLog(context, `Scraping returned ${scrapedPosts.length} posts`);

  // For debugging
  if (scrapedPosts.length > 0) {
    console.log("SAMPLE POST:", JSON.stringify(scrapedPosts[0], null, 2));
  }

  if (scrapedPosts.length === 0) {
    console.log("==== NO POSTS RETURNED FROM SCRAPING ====");
    return [];
  }

  const identifiedLeads: PotentialLead[] = [];

  // Step 2: Process each post with business funding analysis
  for (const post of scrapedPosts) {
    // Create a corpus from the post content
    const postCorpus = `
Subreddit: r/${post.subreddit}
User: u/${post.author || 'deleted'}
Title: ${post.title}
Content (first 1000 chars): ${post.selftext.substring(0, 1000)}
URL: ${post.url}
    `.trim();

    try {
      // Use the business funding analysis function
      const analysisResult = await analyzePotentialLead(postCorpus, keywords);
      
      // Determine if we should include based on post score and content filters
      const isDirectLoanSub = ['borrow', 'simpleloans', 'donationrequest'].includes(post.subreddit.toLowerCase());
      const scoreThreshold = isDirectLoanSub ? 10 : (post.subreddit.toLowerCase() === 'smallbusiness' ? 15 : 25);
      
      if (analysisResult.is_lead && analysisResult.lead_score >= scoreThreshold) {
        // Apply content filters based on user preferences
        let includeBasedOnFilters = true;
        
        if (!contentFilterConfig.seekingFunding && analysisResult.sentiment === 'seeking_funding') {
          includeBasedOnFilters = false;
        }
        
        if (!contentFilterConfig.expansionPlans && analysisResult.sentiment === 'expansion_plans') {
          includeBasedOnFilters = false;
        }
        
        if (!contentFilterConfig.cashFlowIssues && analysisResult.sentiment === 'cash_flow_issues') {
          includeBasedOnFilters = false;
        }
        
        if (!contentFilterConfig.equipmentNeeds && analysisResult.sentiment === 'equipment_needs') {
          includeBasedOnFilters = false;
        }
        
        // Extract revenue discussion signal
        const isRevenueDiscussion = postCorpus.toLowerCase().includes('revenue') || 
                                   postCorpus.toLowerCase().includes('sales') ||
                                   postCorpus.toLowerCase().includes('profit');
                                   
        if (!contentFilterConfig.revenueDiscussion && isRevenueDiscussion) {
          includeBasedOnFilters = false;
        }
        
        // If passes all filters, add to leads
        if (includeBasedOnFilters) {
          identifiedLeads.push({
            id: post.id,
            subreddit: post.subreddit,
            username: post.author || 'unknown',
            content: analysisResult.relevant_snippet || post.title,
            date: new Date(post.created_utc * 1000).toISOString(),
            sentiment: analysisResult.sentiment as any,
            status: 'new',
            score: analysisResult.lead_score,
            url: post.url,
            reasoning: analysisResult.reasoning,
          });
        }
      }
    } catch (error) {
      console.error(`Error processing post ${post.id}:`, error);
    }
  }

  // Sort leads by score descending
  identifiedLeads.sort((a, b) => b.score - a.score);

  const totalTime = Date.now() - startTime;
  debugLog(context, `Finished lead processing. Found ${identifiedLeads.length} potential leads. Total time: ${totalTime}ms`);
  console.log("==== BUSINESS FUNDING LEAD PROCESSING COMPLETED ====");
  
  return identifiedLeads;
}