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
      model: groq("llama3-8b-8192"), // Or your preferred model, e.g., "deepseek-r1-distill-llama-70b"
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
      model: groq("llama3-8b-8192"), // Or another capable model
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
      model: groq("llama3-8b-8192"),
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
interface RedditPostData {
  id: string;
  subreddit: string;
  author: string | null; // Author can be deleted
  title: string;
  selftext: string; // Reddit API field for post body
  url: string;
  created_utc: number; // UNIX timestamp (seconds)
  // Note: We are NOT fetching comments here initially for performance.
  // Fetching comments requires extra API calls per post.
}


export interface PotentialLead {
  id: string;
  subreddit: string;
  username: string;
  content: string;
  date: string;
  sentiment: 'seeking_recommendation' | 'pain_point' | 'complaining' | 'interest_shown' | 'generic_mention' | 'other' | 'not_applicable_if_not_lead';
  status: 'new';
  score: number;
  url: string;
  reasoning?: string;
}
async function scrapeSubreddits(
  subredditNames: string[],
  keywords: string[], // Keywords can be used later for pre-filtering if needed
  limitPerSubreddit: number = 25 // How many posts to fetch per subreddit
): Promise<RedditPostData[]> {
  const context = "scrapeSubreddits";
  debugLog(context, "Starting real Reddit scrape...", { subreddits: subredditNames, limitPerSubreddit });

  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET || !process.env.REDDIT_USER_AGENT) {
      console.error("Missing Reddit API credentials in environment variables (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT)");
      debugLog(context, "Aborted: Missing Reddit Credentials");
      // Optionally throw an error or return empty based on desired handling
      // throw new Error("Missing Reddit API credentials");
       return [];
  }

  let r: Snoowrap;
  try {
      // Initialize snoowrap using Client Credentials Grant (App-only access)
      // This is preferred for server-side tasks not acting on behalf of a user
       r = new Snoowrap({
          userAgent: process.env.REDDIT_USER_AGENT,
          clientId: process.env.REDDIT_CLIENT_ID,
          clientSecret: process.env.REDDIT_CLIENT_SECRET,
          // We need to request a token explicitly for Client Credentials
          // This approach avoids needing username/password
           // Note: Snoowrap doesn't have a direct method for pure Client Credentials Grant.
           // A common workaround is to use refreshToken: 'some_dummy_value' or provide dummy credentials,
           // as long as clientId and clientSecret are valid for an app, it often works for public data fetches.
           // However, the *correct* way involves manually fetching a token first if Snoowrap doesn't support it directly.
           // Let's try the simpler approach first, it often works for read-only public access.
           // If this fails, a manual OAuth token fetch would be needed.
          username: 'dummy_user_for_client_credentials', // Required by constructor, but not used if clientSecret is present for app auth
          password: 'dummy_password', // Required by constructor
      });
       // Disable rate limit checks if needed for testing, but be careful in production
       // r.config({ requestDelay: 1000, continueAfterRatelimitError: true });
      debugLog(context, "Snoowrap initialized.");

  } catch (error) {
       console.error("Failed to initialize Snoowrap:", error);
       debugLog(context, "Snoowrap initialization failed", { error: error instanceof Error ? error.message : String(error) });
       return [];
  }


  const allPosts: RedditPostData[] = [];
  const fetchPromises: Promise<Snoowrap.Listing<Snoowrap.Submission>>[] = [];

  for (const subredditName of subredditNames) {
      debugLog(context, `Preparing fetch for r/${subredditName}`);
      try {
          // Fetch top posts from the last month - adjust 'time' as needed ('week', 'day', 'year', 'all')
          // Using getTop helps find relevant discussions over a period.
          const fetchPromise = r.getSubreddit(subredditName).getTop({ time: 'month', limit: limitPerSubreddit });
          fetchPromises.push(fetchPromise);
      } catch (error) {
          console.error(`Error preparing fetch for r/${subredditName}:`, error);
          debugLog(context, `Error preparing fetch`, { subreddit: subredditName, error: error instanceof Error ? error.message : String(error)});
          // Continue to next subreddit
      }
  }

  // Execute all fetches in parallel
  const results = await Promise.allSettled(fetchPromises);
  debugLog(context, "Finished fetching from all subreddits (Promise.allSettled).");

  results.forEach((result, index) => {
      const subredditName = subredditNames[index];
      if (result.status === 'fulfilled') {
          const posts = result.value;
          debugLog(context, `Successfully fetched ${posts.length} posts from r/${subredditName}`);
          posts.forEach(post => {
              // Basic keyword check on title or selftext (optional pre-filter)
               const keywordMatch = keywords.some(kw =>
                   post.title.toLowerCase().includes(kw.toLowerCase()) ||
                   post.selftext.toLowerCase().includes(kw.toLowerCase())
               );

               if (keywordMatch) { // Only include posts that match at least one keyword
                  allPosts.push({
                      id: post.id,
                      subreddit: post.subreddit?.display_name || subredditName, // Use fetched name if available
                      author: post.author?.name || null, // Handle potential deleted author
                      title: post.title,
                      selftext: post.selftext,
                      url: `https://www.reddit.com${post.permalink}`, // Construct full URL
                      created_utc: post.created_utc,
                  });
              }
          });
      } else {
          console.error(`Failed to fetch posts from r/${subredditName}:`, result.reason);
           debugLog(context, `Fetch failed for r/${subredditName}`, { error: result.reason });
      }
  });

  debugLog(context, `Completed scraping. Total relevant posts found across all subreddits: ${allPosts.length}`);
  return allPosts;
}


// --- Ensure `PotentialLead` interface is defined correctly ---
export interface PotentialLead {
  id: string;
  subreddit: string;
  username: string; // Keep 'username' for UI consistency, map from 'author'
  content: string;
  date: string; // ISO String
  sentiment: 'seeking_recommendation' | 'pain_point' | 'complaining' | 'interest_shown' | 'generic_mention' | 'other' | 'not_applicable_if_not_lead';
  status: 'new';
  score: number;
  url: string;
  reasoning?: string;
}

// --- MINOR UPDATE to `processRedditDataForLeads` ---
// Make sure this function exists and modify it as shown below

export async function processRedditDataForLeads(
  selectedSubredditsConfig: Array<{ name: string; category: string; selected: boolean }>,
  keywords: string[],
  contentFilterConfig: { /* ... same as before ... */ },
  scanFrequency: string
): Promise<PotentialLead[]> {
  const context = "processRedditDataForLeads";
  const startTime = Date.now();
  debugLog(context, "Starting lead processing (with real scraper)...", { numKeywords: keywords.length, scanFrequency });

  const activeSubreddits = selectedSubredditsConfig
      .filter(sr => sr.selected)
      .map(sr => sr.name);

  if (activeSubreddits.length === 0) {
      debugLog(context, "No active subreddits selected. Aborting.");
      return [];
  }
  debugLog(context, "Active subreddits", { activeSubreddits });

  // Step 1: Scrape Reddit posts (Using the REAL function now)
  // ***** CHANGE HERE *****
  const scrapedPosts: RedditPostData[] = await scrapeSubreddits(activeSubreddits, keywords, 25); // Fetch top 25 from each
  // ***** END CHANGE *****

  if (scrapedPosts.length === 0) {
      debugLog(context, "No posts returned from scraping.");
      return [];
  }
  debugLog(context, `Real scraping returned ${scrapedPosts.length} posts potentially matching keywords.`);

  const identifiedLeads: PotentialLead[] = [];

  // Step 2 & 3: Process each post with LLM
  for (const post of scrapedPosts) {
       // ***** CHANGE HERE: Use correct field names from RedditPostData *****
      const postCorpus = `
Subreddit: r/${post.subreddit}
User: u/${post.author || 'deleted'}
Title: ${post.title}
Content (first 1000 chars): ${post.selftext.substring(0, 1000)}
URL: ${post.url}
      `.trim();
       // ***** END CHANGE *****

      // LLM Prompt remains largely the same, but ensure it knows comments aren't included
      let filterCriteriaDescription = "/* ... same as before ... */";
      const llmPrompt = `
You are an AI sales intelligence analyst for Orange Theory Fitness Charlotte.
Your task is to analyze the following Reddit post summary (title and content only) to determine if it represents a potential sales lead.
The primary keywords we are interested in are: ${keywords.join(', ')}.
Consider the user's content filter preferences:
${filterCriteriaDescription}

Reddit Post Summary:
${postCorpus}

Based ONLY on the post title and content, provide your analysis STRICTLY in the following JSON format:
{
"is_lead": boolean,
"lead_score": number, // 0-100
"sentiment": "seeking_recommendation" | "pain_point" | "complaining" | "interest_shown" | "generic_mention" | "other" | "not_applicable_if_not_lead",
"reasoning": "string",
"relevant_snippet": "string" // A short, relevant quote from the title or content.
}

Example for a good lead: /* ... same ... */
Example for not a lead: /* ... same ... */

Output ONLY the JSON object. No other text or explanations.
      `;

      try {
          debugLog(context, `Sending post ${post.id} to LLM for analysis.`);
          const aiResponseJsonString = await safeStreamText({ /* ... same LLM call params ... */ });
          debugLog(context, `LLM raw response for post ${post.id}: ${aiResponseJsonString.substring(0, 200)}...`);

          let analysisResult;
          try {
              // Robust JSON parsing
              const firstBrace = aiResponseJsonString.indexOf('{');
              const lastBrace = aiResponseJsonString.lastIndexOf('}');
              if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                  const jsonCandidate = aiResponseJsonString.substring(firstBrace, lastBrace + 1);
                  analysisResult = JSON.parse(jsonCandidate);
              } else { throw new Error("No valid JSON object found."); }
          } catch (parseError) {
              debugLog(context, `Failed to parse LLM JSON response for post ${post.id}`, { error: parseError instanceof Error ? parseError.message : parseError, response: aiResponseJsonString });
              continue; // Skip post
          }

          if (analysisResult && analysisResult.is_lead && analysisResult.lead_score >= 40) {
              // ***** CHANGE HERE: Map fields correctly to PotentialLead *****
              identifiedLeads.push({
                  id: post.id,
                  subreddit: post.subreddit,
                  username: post.author || 'unknown', // Map author to username for UI
                  content: analysisResult.relevant_snippet || post.selftext.substring(0, 300) || post.title, // Use snippet, fallback to selftext or title
                  date: new Date(post.created_utc * 1000).toISOString(), // Convert timestamp
                  sentiment: analysisResult.sentiment,
                  status: 'new',
                  score: analysisResult.lead_score,
                  url: post.url,
                  reasoning: analysisResult.reasoning,
              });
              // ***** END CHANGE *****
              debugLog(context, `Identified lead from post ${post.id}`, { score: analysisResult.lead_score });
          } else {
              debugLog(context, `Post ${post.id} not considered a strong lead or parsing failed.`, { analysis: analysisResult });
          }
      } catch (error) {
          debugLog(context, `Error processing post ${post.id} with LLM`, { error: error instanceof Error ? error.message : error, postId: post.id });
      }
  }

  debugLog(context, `Finished lead processing. Found ${identifiedLeads.length} potential leads. Total time: ${Date.now() - startTime}ms`);
  return identifiedLeads;
}