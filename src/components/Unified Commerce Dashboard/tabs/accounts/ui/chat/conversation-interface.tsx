"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  ArrowUp,
  ChevronUp,
  Send,
  Sparkles,
  User,
  Bot,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Loader2,
  Brain,
} from "lucide-react"
import { sendChatMessageInsights } from "@/components/Unified Commerce Dashboard/lib/actions/insights-actions"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { ChatMessageArea } from "@/components/ui/chat-message-area"
import { MarkdownContent } from "@/components/ui/markdown-content"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  hasArtifacts?: boolean
  artifacts?: any[]
  reasoning?: string
  isStreamingReasoning?: boolean
}

interface ConversationalInterfaceProps {
  onBackToDashboard: () => void
}

// Simple chart component that fetches KPI data
function SimpleKPIChart({ artifact }: { artifact: any }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    fetchKPIData()
  }, [artifact.kpiType, artifact.period, artifact.limit])

  const fetchKPIData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/kpi?type=${artifact.kpiType || "revenue"}&period=${artifact.period || "monthly"}&limit=${artifact.limit || 12}`,
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data")
      }

      if (result.success) {
        setData(result.data || [])
        setSummary(result.summary)
      } else {
        throw new Error(result.error || "Failed to load KPI data")
      }
    } catch (err) {
      console.error("Error fetching KPI data:", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
      // Fallback to sample data
      setData([
        { name: "Jan", value: 4000 },
        { name: "Feb", value: 3000 },
        { name: "Mar", value: 5000 },
        { name: "Apr", value: 4500 },
        { name: "May", value: 6000 },
        { name: "Jun", value: 5500 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (value: number) => {
    const kpiType = artifact.kpiType || "revenue"
    if (kpiType === "conversion" || kpiType === "conversion rate") {
      return `${value.toFixed(1)}%`
    }
    if (kpiType === "revenue" || kpiType === "sales") {
      return `${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }

  const getTrendIcon = () => {
    if (!summary?.trend) return <Minus className="h-4 w-4 text-gray-500" />

    switch (summary.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading KPI data...</span>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex h-[300px] items-center justify-center">
          <span className="text-muted-foreground">No data available</span>
        </div>
      )
    }

    const chartProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    }

    switch (artifact.chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip formatter={(value) => [formatValue(Number(value)), artifact.kpiType]} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip formatter={(value) => [formatValue(Number(value)), artifact.kpiType]} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        )

      default: // bar chart
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip formatter={(value) => [formatValue(Number(value)), artifact.kpiType]} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <Card className="my-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            {artifact.title}
          </div>
          {summary && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {summary.change !== undefined && (
                <span
                  className={`flex items-center gap-1 ${
                    summary.trend === "up"
                      ? "text-green-600"
                      : summary.trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {summary.change > 0 ? "+" : ""}
                  {summary.change.toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        {summary && (
          <div className="mt-4 rounded-lg bg-muted/50 p-3">
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              {summary.average !== undefined && (
                <div>
                  <span className="text-muted-foreground">Average:</span>
                  <div className="font-medium">{formatValue(summary.average)}</div>
                </div>
              )}
              {summary.total !== undefined && (
                <div>
                  <span className="text-muted-foreground">Total:</span>
                  <div className="font-medium">{formatValue(summary.total)}</div>
                </div>
              )}
              {summary.trend && (
                <div>
                  <span className="text-muted-foreground">Trend:</span>
                  <div
                    className={`font-medium capitalize ${
                      summary.trend === "up"
                        ? "text-green-600"
                        : summary.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {summary.trend}
                  </div>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Period:</span>
                <div className="font-medium capitalize">{artifact.period || "monthly"}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Updated AI Response Panel
function AIResponsePanel({ message }: { message: Message }) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        <div className="prose prose-sm max-w-none">
          <MarkdownContent id={`panel-${message.id}`} content={message.content} />
        </div>

        {message.artifacts && message.artifacts.length > 0 && (
          <div className="space-y-4">
            {message.artifacts.map((artifact, index) => (
              <Card key={index} className="p-4">
                {artifact.type === "chart" && <SimpleKPIChart artifact={artifact} />}

                {artifact.type === "email" && (
                  <div>
                    <h4 className="mb-2 font-semibold">Email Template</h4>
                    <div className="rounded bg-gray-50 p-4">
                      <p className="mb-3 text-sm text-gray-600">{artifact.reasoning}</p>
                      <div className="space-y-2 rounded border bg-white p-3">
                        <div>
                          <p className="text-xs text-gray-500">Subject:</p>
                          <p className="font-medium">{artifact.subject}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Template:</p>
                          <div className="mt-2 whitespace-pre-wrap rounded bg-gray-50 p-2 text-sm">
                            {artifact.template}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {artifact.type === "automation" && (
                  <div>
                    <h4 className="mb-2 font-semibold">{artifact.name}</h4>
                    <div className="space-y-3 rounded bg-gray-50 p-4">
                      <p className="text-sm text-gray-600">{artifact.reasoning}</p>
                      <div className="space-y-2 rounded border bg-white p-3">
                        <p className="text-sm">{artifact.description}</p>
                        <div>
                          <p className="text-xs text-gray-500">Trigger:</p>
                          <p className="text-sm font-medium">{artifact.trigger}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Actions:</p>
                          <ul className="list-inside list-disc space-y-1 text-sm">
                            {artifact.actions.map((action: string, i: number) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

export function ConversationalInterface({ onBackToDashboard }: ConversationalInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to United Capital Source! We're experts in finding the right financing for all types of businesses, especially those that have faced challenges with traditional banks. To get started, could you tell me a little about what you're hoping to accomplish with funding?",
      timestamp: new Date(),
    },
  ])
  const lastMessageRef = useRef<HTMLDivElement>(null)

  // Only scroll to the start of new messages, not the bottom
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start", // This ensures you see the TOP of the message
      })
    }
  }, [messages])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  // Add this state for tracking scroll position
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Add this function to be passed to a modified ChatMessageArea
  const handleScrollChange = useCallback((atBottom: boolean) => {
    setIsAtBottom(atBottom)
  }, [])

  const scrollToTopOfLastMessage = useCallback(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    // Create a temporary assistant message for streaming
    const tempAssistantId = (Date.now() + 1).toString()
    const tempAssistantMessage: Message = {
      id: tempAssistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      reasoning: "",
      isStreamingReasoning: true,
    }

    setMessages((prev) => [...prev, tempAssistantMessage])

    try {
      // Prepare conversation history for AI
      const conversationHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Get AI response with artifacts and streaming
      const { content, artifacts, reasoning } = await sendChatMessageInsights(
        conversationHistory,
        "deepseek-r1-distill-llama-70b",
        2048,
        // onStream callback for regular content
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempAssistantId ? { ...msg, content: msg.content + chunk } : msg)),
          )
        },
        // onReasoningStream callback for thinking tokens
        (reasoningChunk: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantId ? { ...msg, reasoning: (msg.reasoning || "") + reasoningChunk } : msg,
            ),
          )
        },
      )

      // Update the final message
      const finalAssistantMessage: Message = {
        id: tempAssistantId,
        role: "assistant",
        content: content,
        timestamp: new Date(),
        hasArtifacts: artifacts.length > 0,
        artifacts: artifacts,
        reasoning: reasoning,
        isStreamingReasoning: false,
      }

      setMessages((prev) => prev.map((msg) => (msg.id === tempAssistantId ? finalAssistantMessage : msg)))

      // Auto-open panel if there are artifacts
      if (artifacts.length > 0) {
        setSelectedMessage(finalAssistantMessage)
        setShowPanel(true)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: tempAssistantId,
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        isStreamingReasoning: false,
      }
      setMessages((prev) => prev.map((msg) => (msg.id === tempAssistantId ? errorMessage : msg)))
    } finally {
      setIsLoading(false)
    }
  }, [input, messages, isLoading])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleViewArtifacts = (message: Message) => {
    setSelectedMessage(message)
    setShowPanel(true)
  }

  const handleClosePanel = () => {
    setShowPanel(false)
    setSelectedMessage(null)
  }

  return (
    <div className="flex h-screen">
      {/* Chat Interface */}
      <div className={`flex flex-col transition-all duration-300 ${showPanel ? "w-1/2" : "w-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-background/95 p-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-blue-500" />
              AI Business Assistant
            </h2>
          </div>
        </div>

        {/* Messages */}
        <ChatMessageArea onScrollChange={handleScrollChange} className="space-y-4 px-4 py-8">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                ref={index === messages.length - 1 ? lastMessageRef : null} // Ref on last message
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}

                <div className={`max-w-[80%] space-y-2 ${message.role === "user" ? "order-first" : ""}`}>
                  {/* Reasoning/Thinking Display */}
                  {message.role === "assistant" && message.reasoning && (
                    <Card className="bg-gray-50 border-gray-200">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500 font-medium">
                            {message.isStreamingReasoning ? "Thinking..." : "Reasoning"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
                          {message.reasoning}
                          {message.isStreamingReasoning && (
                            <span className="inline-block w-2 h-3 bg-gray-400 animate-pulse ml-1" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Main Response */}
                  <Card className={`${message.role === "user" ? "bg-blue-500 text-white" : "bg-muted"}`}>
                    <CardContent className="p-3">
                      {message.role === "assistant" ? (
                        <MarkdownContent id={`message-${message.id}`} content={message.content} />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      {message.hasArtifacts && (
                        <div className="mt-2 border-t border-border/50 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewArtifacts(message)}
                            className="text-xs"
                          >
                            View Interactive Response ({message.artifacts?.length} item
                            {message.artifacts?.length !== 1 ? "s" : ""})
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <p className="mt-1 px-1 text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</p>
                </div>

                {message.role === "user" && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ChatMessageArea>

        {/* Input */}
        <div className="border-t bg-background/95 p-4 backdrop-blur">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about loan options, create email templates, analyze business data..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Scroll to Top Button */}
        {isAtBottom && messages[messages.length - 1]?.role === "assistant" && (
          <Button
            onClick={scrollToTopOfLastMessage}
            className="fixed bottom-40 right-10 z-50 h-9 w-9 rounded-full shadow-lg"
            size="icon"
            variant="secondary"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* AI Response Panel */}
      {showPanel && selectedMessage && (
        <div className="w-1/2 border-l bg-background">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-semibold">Interactive Response</h3>
            <Button variant="ghost" size="sm" onClick={handleClosePanel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AIResponsePanel message={selectedMessage} />
        </div>
      )}
    </div>
  )
}
