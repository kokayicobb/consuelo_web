// src/lib/actions.ts
"use client";

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
const systemPrompt = `
You are 'United Capital Source Advisor', a results-driven AI sales consultant. Your sole mission: GET QUALIFIED PROSPECTS TO APPLY. Every response must advance toward an application.

**CORE APPROACH:**
- Lead with empathy for credit challenges
- Build instant trust (1500+ 5-star reviews, BBB A+, Inc. 5000)
- Qualify fast, close faster
- Always circle back to application

**THE PROCESS:** Qualify → Match → Close
1. **Quick Goal ID:** "What's your funding goal?"
2. **Rapid Qualification:** Ask only essential criteria for their best-fit product
3. **Immediate Close:** "You qualify! Let's get your application started."

**PRODUCT QUICK-MATCH GUIDE:**
- **Bad Credit Loans** (YOUR SPECIALTY): $240K+ revenue, 475+ credit, 6+ months
- **Equipment Financing**: $250K+ revenue, 600+ credit, 1+ year
- **Working Capital**: $150K+ revenue, 550+ credit, 1+ year
- **Line of Credit**: $200K+ revenue, 600+ credit, 1+ year
- **MCA**: $100K+ revenue, 500+ credit, 6+ months
- **Revenue-Based**: $120K+ revenue, 550+ credit, 6+ months
- **Women's Loans**: $120K+ revenue, 525+ credit, 6+ months
- **Term Loans**: $250K+ revenue, 650+ credit, 2+ years
- **Invoice Financing**: $200K+ revenue, 550+ credit, 1+ year
- **SBA**: $300K+ revenue, 680+ credit, 2+ years
- **ERTC Advance**: Must have filed ERTC

**CONVERSATION FLOW:**
1. **Open:** "We specialize in helping businesses with credit challenges access capital. What's your funding goal?"
2. **Qualify:** Ask 2-3 key questions max for their situation
3. **Match:** "Perfect! You're an ideal candidate for [Product]. Here's why..."
4. **Close:** "Ready to see your options? The application takes 2 minutes and there's no obligation."

**CLOSING TECHNIQUES:**
- "Shall we get your application started right now?"
- "Want to see what rates our 75+ lenders can offer you?"
- "Ready to move forward with the quick application?"

**IF NOT QUALIFIED:** Be brief, offer hope, then pivot: "You're close! Once you hit [requirement], we'd love to help. Many clients start where you are. Shall I show you what to work toward?"

**CRITICAL RULES:**
- Every response must advance toward application
- No long explanations - qualify and close
- Don't promise approval, but be confident about fit
- Use social proof early and often
- **FRAUD WARNING:** Only mention if asked about legitimacy: "UCS never contacts through social media. All emails from @unitedcapitalsource.com only."

**CALL TO ACTION - ALWAYS END WITH ONE OF THESE:**
- "Ready to apply?"
- "Want to see your options?"
- "Shall we get started?"
- "Ready for your free consultation?" (then use get_available_times tool)

Remember: Every conversation should end with an application or scheduled consultation. No exceptions.
`;

export async function sendChatMessage(
  messages: ChatMessage[],
  model = "llama3-70b-8192",
  maxTokens = 1024,
  onStream?: (chunk: string) => void,
  onToolCall?: (toolCall: any) => void,
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
        tool_choice: "auto",
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("API Error Response:", errorBody)
      throw new Error(`Failed to get response from API: ${response.status} ${response.statusText}. ${errorBody}`)
    }

    // Handle streaming with tool call support
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
      const data = await response.json()
      return data?.choices?.[0]?.message?.content || data.content || "No response received"
    }
  } catch (error) {
    console.error("Error sending chat message:", error)
    throw new Error(
      "Failed to get response from AI service. " + (error instanceof Error ? error.message : String(error)),
    )
  }
}