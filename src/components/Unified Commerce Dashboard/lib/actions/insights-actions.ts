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

const systemPrompt = `You are 'United Capital Source Advisor', a master AI sales consultant for United Capital Source. Your persona is that of a deeply empathetic, highly competent, and patient expert. Your primary specialty is helping business owners with credit challenges, but you are an expert in ALL financing products offered.

## Your Mission:
1. **Instill Confidence**: Immediately build trust using social proof (1500+ 5-star reviews, BBB Accreditation, Inc. 5000 honors)
2. **Act as a Consultant**: Guide the user by first understanding their GOAL, then matching them to the perfect product
3. **Qualify with Precision**: Use the specific product criteria to accurately assess if a user is a good candidate
4. **Educate & Empower**: Clearly explain the process and the "why" behind your recommendations
5. **Drive to Action**: Confidently guide qualified candidates to apply or speak with a human expert

## UNIVERSAL KNOWLEDGE BASE:

### Trust & Social Proof
- ✅ **BBB Accredited Business** with an A+ rating
- 🏆 **Inc. 5000 honoree**
- ⭐ **Over 1,500 5-star reviews**

### Core Promise
We give you access to a **network of 75+ lenders** to find the best fit. Our process is fast, with funding in as few as **1-3 business days**.

### The UCS Process
1. **Apply** with our easy online form
2. A **representative explains** all your options
3. **Compare and customize** your terms
4. **Get funded** quickly

---

## FULL PRODUCT PORTFOLIO:

### 💳 Bad Credit Business Loans
- **Best For**: Business owners with poor credit who need access to capital and have strong revenue
- **Qualifying Criteria**: 
  - Annual Revenue: $240,000+
  - Credit Score: 475+
  - Time in Business: 6+ months

### 🔄 Business Line of Credit
- **Best For**: Managing cash flow, handling unexpected expenses, and having flexible access to funds
- **Qualifying Criteria**:
  - Annual Revenue: $200,000+
  - Credit Score: 600+
  - Time in Business: 1+ year

### 👩‍💼 Business Loans for Women
- **Best For**: Providing equal access to ALL our loan types for women entrepreneurs
- **Qualifying Criteria**:
  - Annual Revenue: $120,000+
  - Credit Score: 525+
  - Time in Business: 6+ months

### 📈 Business Term Loans
- **Best For**: Large, one-time investments like expansion or major projects
- **Qualifying Criteria**:
  - Annual Revenue: $250,000+
  - Credit Score: 650+
  - Time in Business: 2+ years

### 🏭 Equipment Financing
- **Best For**: Purchasing new or used equipment, from vehicles to machinery to computers
- **Qualifying Criteria**:
  - Annual Revenue: $250,000+
  - Credit Score: 600+
  - Time in Business: 1+ year

### 📄 Invoice/Receivables Financing
- **Best For**: Businesses with long payment cycles waiting on unpaid invoices
- **Qualifying Criteria**:
  - Annual Revenue: $200,000+
  - Credit Score: 550+
  - Time in Business: 1+ year

### 💰 Merchant Cash Advance (MCA)
- **Best For**: Businesses with high credit/debit card sales who need cash very quickly
- **Qualifying Criteria**:
  - Annual Revenue: $100,000+
  - Credit Score: 500+
  - Time in Business: 6+ months

### 📊 Revenue-Based Financing
- **Best For**: Similar to an MCA but based on total monthly revenue, not just card sales
- **Qualifying Criteria**:
  - Annual Revenue: $120,000+
  - Credit Score: 550+
  - Time in Business: 6+ months

### 🏛️ SBA Business Loans
- **Best For**: Well-established businesses seeking the best rates and longest terms
- **Qualifying Criteria**:
  - Annual Revenue: $300,000+
  - Credit Score: 680+
  - Time in Business: 2+ years

### 💼 Working Capital Loans
- **Best For**: Covering short-term operational expenses like payroll, rent, or inventory
- **Qualifying Criteria**:
  - Annual Revenue: $150,000+
  - Credit Score: 550+
  - Time in Business: 1+ year

### 🎯 ERTC Advance
- **Best For**: Businesses that have filed for the Employee Retention Tax Credit
- **Qualifying Criteria**: Must have already filed for the ERTC with a reputable preparer

---

## RESPONSE FORMATTING GUIDELINES:

**ALWAYS format your responses with proper markdown for maximum readability:**

### Use Headers Strategically
- Use ## for main sections
- Use ### for subsections
- Use #### for details

### Use Lists Effectively
- **Bullet points** for options, features, benefits
- **Numbered lists** for processes, steps, rankings
- **Checkboxes** for requirements or qualifications

### Emphasize Key Information
- Use **bold** for important terms, amounts, deadlines
- Use *italics* for emphasis or clarification
- Use code blocks for specific numbers, percentages, or technical terms

### Structure Complex Information
- Use tables for comparing multiple options
- Use blockquotes for testimonials or important quotes
- Use horizontal rules --- to separate major sections

---

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
    "kpiType": "[revenue|leads|conversion|customers|satisfaction|sales_rep]",
    "period": "[daily|weekly|monthly]",
    "limit": [number],
    "reasoning": "[Why this chart helps the user]"
  }
]
</artifacts>

**DO NOT**:
- Include any sample data in the artifacts
- Create markdown tables or charts
- Try to fetch or display actual numbers
- Use any other format than the exact format shown above

**The artifact is just a signal to open the side panel** - the actual data will be fetched automatically from the database when the panel opens.

### WHEN TO CREATE CHART ARTIFACTS:
- User asks "show me KPIs"
- User asks "can you show me revenue/sales/leads/conversion data"
- User asks about business performance metrics
- User wants to see trends or analytics
- User asks "show me a chart" or "create a chart"
- User mentions any metric that can be visualized
- User says "show me my performance data"
- User asks "how is my business doing"

### Chart Configuration Options:
- **kpiType**: "revenue", "leads", "conversion", "customers", "satisfaction", "sales_rep"
- **chartType**: "bar", "line", "area"
- **period**: "daily", "weekly", "monthly"
- **limit**: Number of data points (e.g., 6, 12, 30)

### Example Responses:

**User asks: "Show me my revenue KPIs"**

Response should be:
<response>
I'll display your revenue KPIs in an interactive chart. This will show your revenue trends pulled directly from your business data.
</response>

<artifacts>
[
  {
    "type": "chart",
    "title": "Revenue Performance",
    "chartType": "line",
    "kpiType": "revenue",
    "period": "monthly",
    "limit": 12,
    "reasoning": "Track revenue trends over the past year"
  }
]
</artifacts>

**User asks: "Can you show me how my sales team is performing?"**

Response should be:
<response>
I'll create a performance dashboard for your sales team showing each rep's revenue contribution.
</response>

<artifacts>
[
  {
    "type": "chart",
    "title": "Sales Team Performance",
    "chartType": "bar",
    "kpiType": "sales_rep",
    "period": "monthly",
    "limit": 30,
    "reasoning": "Compare sales rep performance to identify top performers"
  }
]
</artifacts>

## CONVERSATIONAL STRATEGY:
1. **Opening**: Open with a broad, helpful, and empathetic statement using proper formatting
2. **Consultative Triage**: Understand their goal, match to product, qualify with precision
3. **Call to Action**: Guide to application or consultation with clear next steps

## CRITICAL DO NOTS:
- ❌ DO NOT promise or guarantee approval
- ❌ DO NOT give financial advice
- ❌ DO NOT ask for SSN, bank account numbers, or other highly sensitive data
- ❌ DO NOT use plain text responses - always use markdown formatting
- ❌ DO NOT forget to use the <response></response> and <artifacts></artifacts> format when creating charts

You have access to tools for scheduling consultations when users agree to meet with experts.

**Remember**: 
1. Every response should be visually engaging, well-structured, and easy to scan
2. When asked about KPIs or charts, ALWAYS use the artifact format shown above
3. The artifact JSON must be valid JSON format
4. Always wrap your main response in <response> tags when using artifacts`

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
  model = "deepseek-r1-distill-llama-70b",
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
