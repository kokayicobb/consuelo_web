import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages array is required", { status: 400 })
    }

    const result = streamText({
      model: groq("deepseek-r1-distill-llama-70b"), // Correct model format
      messages,
      maxTokens: 1024,
      temperature: 0.7,
    })

    return result.toDataStreamResponse() // Use the standard AI SDK response
  } catch (error) {
    console.error("Error in chat API route:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
