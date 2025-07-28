"use client"

// Define the type for a single chat message
interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  tool_calls?: Array<{
    id: string
    type: "function"
    function: {
      name: string
      arguments: string
    }
  }>
}

// Define reasoning part type
interface ReasoningPart {
  type: "reasoning"
  details: Array<{ type: "text"; text: string } | { type: "redacted" }>
}

// Define text part type
interface TextPart {
  type: "text"
  text: string
}

const systemPrompt = `You are a Sales Analytics AI Assistant for a comprehensive sales management platform. Your role is to help users analyze their sales data, understand client relationships, and make data-driven decisions.

## Your Capabilities:
1. **Client Analysis**: Help analyze client data, engagement scores, and relationship status
2. **Performance Metrics**: Generate insights from business KPIs and sales performance data
3. **Data Visualization**: Create charts and visualizations for better understanding
4. **Actionable Insights**: Provide specific recommendations based on data analysis

## Database Schema Knowledge:
You have access to:
- **Clients Table**: Contains client information, contact details, engagement scores, deal values, and relationship data
- **Business KPIs Table**: Contains various business metrics over time periods

## CRITICAL ARTIFACT GENERATION INSTRUCTIONS:

**IMPORTANT**: When a user asks about KPIs, metrics, charts, or data visualization, you MUST structure your response using this EXACT format:

<response>
[Your natural language response explaining what you're showing]
</response>

<artifacts>
[
  {
    "type": "chart",
    "title": "[Chart Title]",
    "chartType": "[bar|line|area]",
    "kpiType": "[revenue|leads|conversion|customers|satisfaction|sales_rep|engagement|deals]",
    "period": "[daily|weekly|monthly]",
    "limit": [number],
    "reasoning": "[Why this chart helps the user]"
  }
]
</artifacts>

### WHEN TO CREATE CHART ARTIFACTS:
- User asks "show me KPIs"
- User asks about revenue, sales, leads, conversion data
- User asks about client engagement or performance
- User wants to see trends or analytics
- User asks "show me a chart" or "create a chart"
- User mentions any metric that can be visualized
- User asks about business performance

### Chart Configuration Options:
- **kpiType**: "revenue", "leads", "conversion", "customers", "satisfaction", "sales_rep", "engagement", "deals"
- **chartType**: "bar", "line", "area"
- **period**: "daily", "weekly", "monthly"
- **limit**: Number of data points (e.g., 6, 12, 30)

## Response Guidelines:
- Always use markdown formatting for readability
- Provide specific, actionable insights
- Reference actual data when possible
- Suggest follow-up actions based on findings`

// Helper function to parse AI response with artifacts
function parseAIResponse(fullResponse: string): { content: string; artifacts: any[] } {
  try {
    // Check if response contains artifacts
    const responseMatch = fullResponse.match(/<response>([\s\S]*?)<\/response>/)
    const artifactsMatch = fullResponse.match(/<artifacts>([\s\S]*?)<\/artifacts>/)

    if (responseMatch && artifactsMatch) {
      const content = responseMatch[1].trim()
      const artifactsJson = artifactsMatch[1].trim()

      try {
        const artifacts = JSON.parse(artifactsJson)
        return { content, artifacts: Array.isArray(artifacts) ? artifacts : [] }
      } catch (e) {
        console.warn("Failed to parse artifacts JSON:", e)
        return { content, artifacts: [] }
      }
    }

    // If no artifacts structure found, return full response as content
    return { content: fullResponse, artifacts: [] }
  } catch (e) {
    console.warn("Failed to parse AI response:", e)
    return { content: fullResponse, artifacts: [] }
  }
}

export async function sendChatMessageInsights(
  messages: ChatMessage[],
  model = "moonshotai/kimi-k2-instruct",
  maxTokens = 2048,
  onStream?: (chunk: string) => void,
  onReasoningStream?: (reasoning: string) => void,
  onToolCall?: (toolCall: any) => void,
): Promise<{ content: string; artifacts: any[]; reasoning?: string }> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
        model: model,
        max_tokens: maxTokens,
        tools: [
          {
            type: "function",
            function: {
              name: "query_clients",
              description: "Query client data from the database",
              parameters: {
                type: "object",
                properties: {
                  filters: {
                    type: "object",
                    description: "Filters to apply to client query",
                  },
                  limit: {
                    type: "number",
                    description: "Maximum number of results to return",
                  },
                },
                required: [],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "query_kpis",
              description: "Query business KPI data from the database",
              parameters: {
                type: "object",
                properties: {
                  metric_type: {
                    type: "string",
                    description: "Type of metric to query",
                  },
                  period_type: {
                    type: "string",
                    description: "Period type (daily, weekly, monthly)",
                  },
                  limit: {
                    type: "number",
                    description: "Maximum number of results to return",
                  },
                },
                required: [],
              },
            },
          },
        ],
        tool_choice: "auto",
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("API Error Response:", errorBody)
      throw new Error(`Failed to get response from API: ${response.status} ${response.statusText}. ${errorBody}`)
    }

    // Handle streaming response
    if (response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ""
      let fullReasoning = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        let eolIndex

        while ((eolIndex = buffer.indexOf("\n")) >= 0) {
          const line = buffer.substring(0, eolIndex).trim()
          buffer = buffer.substring(eolIndex + 1)

          // Skip empty lines
          if (!line) continue

          try {
            // Handle different streaming formats
            if (line.startsWith("0:")) {
              // Format: 0:"content" - regular text content
              const content = JSON.parse(line.substring(2))
              if (typeof content === "string") {
                fullText += content
                if (onStream) onStream(content)
              }
            } else if (line.startsWith("3:")) {
              // Format: 3:[reasoning_data] - reasoning tokens
              try {
                const reasoningData = JSON.parse(line.substring(2))
                if (reasoningData && reasoningData.details) {
                  const reasoningText = reasoningData.details
                    .map((detail: any) => (detail.type === "text" ? detail.text : "<redacted>"))
                    .join("")
                  fullReasoning += reasoningText
                  if (onReasoningStream) onReasoningStream(reasoningText)
                }
              } catch (e) {
                console.warn("Skipping invalid reasoning JSON:", line, e)
              }
            } else if (line.startsWith("2:")) {
              // Handle tool calls
              try {
                const toolCallData = JSON.parse(line.substring(2))
                if (onToolCall) {
                  onToolCall(toolCallData)
                }
              } catch (e) {
                console.warn("Skipping invalid tool call JSON:", line, e)
              }
            } else if (line.startsWith("e:") || line.startsWith("f:") || line.startsWith("d:")) {
              // Skip these metadata lines
              continue
            } else {
              // Try to parse as direct JSON response
              try {
                const parsed = JSON.parse(line)
                if (parsed.content || parsed.message) {
                  const content = parsed.content || parsed.message
                  fullText += content
                  if (onStream) onStream(content)
                }
              } catch (e) {
                // If it's not JSON, treat as plain text
                if (
                  line.length > 0 &&
                  !line.includes("finishReason") &&
                  !line.includes("usage") &&
                  !line.includes("messageId")
                ) {
                  fullText += line
                  if (onStream) onStream(line)
                }
              }
            }
          } catch (e) {
            console.warn("Error parsing line:", line, e)
            // Continue processing other lines
          }
        }
      }

      // Parse the full response for artifacts
      const parsed = parseAIResponse(fullText || "I received your message but couldn't generate a proper response.")
      return {
        ...parsed,
        reasoning: fullReasoning || undefined,
      }
    } else {
      // Handle non-streaming response
      try {
        const data = await response.json()
        const fullResponse =
          data?.choices?.[0]?.message?.content || data?.content || data?.message || "No response received"
        return parseAIResponse(fullResponse)
      } catch (e) {
        console.error("Failed to parse non-streaming response:", e)
        return parseAIResponse("I'm having trouble processing the response right now.")
      }
    }
  } catch (error) {
    console.error("Error sending chat message:", error)
    throw new Error(
      "Failed to get response from AI service. " + (error instanceof Error ? error.message : String(error)),
    )
  }
}
