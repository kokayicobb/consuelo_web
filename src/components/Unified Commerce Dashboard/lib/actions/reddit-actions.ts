// src/lib/actions.ts
"use client";

import consueloRedditPrompt from "../system-prompts/consuelo/consuelo-reddit-prompt";

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
// --- SYSTEM PROMPT V3: The Comprehensive AI Sales Agent for United Capital Source ---
// This prompt synthesizes the entire product portfolio and multiple detailed product pages.
// It creates a persona of a master consultant, specializing in finding the right solution for any business owner.
// --- SYSTEM PROMPT V4: High-Impact Sales Agent ---


// In src/lib/actions.ts - REPLACE the entire sendChatMessage function with this:
export async function sendChatMessage(
  messages: ChatMessage[],
  model = "deepseek-r1-distill-llama-70b",
  maxTokens = 1024,
  onStream?: (chunk: string) => void,
  onToolCall?: (toolCall: any) => void,
  customSystemPrompt?: string,
): Promise<string> {
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
            content: customSystemPrompt || consueloRedditPrompt,

          },
          ...messages,
        ],
        model: model,
        max_tokens: maxTokens,
        stream: !!onStream, // Explicitly set stream mode
        tools: customSystemPrompt ? undefined : [ // Only include tools if not using custom prompt
          {
            type: "function",
            function: {
              name: "get_available_times",
              description: "Get available time slots for scheduling a consultation",
              parameters: {
                type: "object",
                properties: {},
                required: [],
              },
            },
          },
        ],
        tool_choice: customSystemPrompt ? undefined : "auto",
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("API Error Response:", errorBody)
      throw new Error(`Failed to get response from API: ${response.status} ${response.statusText}. ${errorBody}`)
    }

    // Handle streaming if onStream is provided
    if (onStream && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        let eolIndex

        while ((eolIndex = buffer.indexOf("\n")) >= 0) {
          const line = buffer.substring(0, eolIndex).trim()
          buffer = buffer.substring(eolIndex + 1)

          if (line.startsWith("0:")) {
            try {
              const content = JSON.parse(line.substring(2))
              if (typeof content === "string") {
                fullText += content
                onStream(content)
              }
            } catch (e) {
              console.warn("Skipping invalid JSON in stream chunk:", line, e)
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
          }
        }
      }
      return fullText
    } else {
      // For non-streaming responses, check if the response is text or JSON
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        return data?.choices?.[0]?.message?.content || data.content || "No response received"
      } else {
        // Handle text/event-stream or other text responses
        const text = await response.text()
        
        // If it's a streaming response but we didn't request streaming, parse it
        if (text.includes("\n") && text.includes("0:")) {
          let fullContent = ""
          const lines = text.split("\n")
          
          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const content = JSON.parse(line.substring(2))
                if (typeof content === "string") {
                  fullContent += content
                }
              } catch (e) {
                // Skip invalid lines
              }
            }
          }
          
          return fullContent || "No response received"
        }
        
        // Otherwise return the text as is
        return text
      }
    }
  } catch (error) {
    console.error("Error sending chat message:", error)
    throw new Error(
      "Failed to get response from AI service. " + (error instanceof Error ? error.message : String(error)),
    )
  }
}