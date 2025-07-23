"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  X,
  ChevronUp,
  Brain,
  PaperclipIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
} from "recharts";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  hasArtifacts?: boolean;
  artifacts?: ChartArtifact[];
  data?: QueryData;
  reasoning?: string;
  isStreamingReasoning?: boolean;
}

interface ChartArtifact {
  type: "chart";
  chartType: "bar" | "line" | "area";
  title: string;
  kpiType: string;
  period: string;
  limit: number;
}

interface QueryData {
  queryResults: any[];
  columns: string[];
  sqlQuery: string;
  userQuery: string;
  chartConfig?: ChartArtifact;
  actionSuggestions?: string[];
  explanations?: string;
}

interface ConversationalInterfaceProps {
  onBackToDashboard: () => void;
}

const EXAMPLE_QUERIES = [
  {
    name: "🎯 Lead & Client Management",
    description:
      "Find and manage your prospects and active clients effectively",
    queries: [
      { text: "Show me clients who haven't been contacted in 30 days" },
      { text: "Find high-value clients with engagement score below 50" },
      { text: "List clients whose deals are expiring this month" },
      { text: "Show me leads that match our ideal customer profile" },
      { text: "Which clients have the highest lifetime value?" },
      {
        text: "Find clients ready for upselling based on their product interests",
      },
    ],
  },
  {
    name: "📊 Sales Performance & Analytics",
    description: "Track team performance and identify opportunities",
    queries: [
      { text: "Show me revenue trends by month for the last year" },
      { text: "Which sales rep has the highest conversion rate?" },
      { text: "What's our average deal size by industry?" },
      { text: "Show me win/loss rates by lead source" },
      { text: "Compare this quarter's performance to last quarter" },
      { text: "Which products have the highest close rates?" },
    ],
  },
  {
    name: "🔔 Follow-ups & Engagement",
    description: "Never miss an opportunity to connect with your clients",
    queries: [
      { text: "Who should I follow up with today?" },
      { text: "Show me clients with upcoming renewal dates" },
      { text: "List clients who opened our last email but didn't respond" },
      { text: "Find clients celebrating anniversaries this month" },
      { text: "Which high-value clients have low engagement scores?" },
      { text: "Show me leads that have gone cold" },
    ],
  },
  {
    name: "🏆 Top Performers & Opportunities",
    description: "Identify your best clients and biggest opportunities",
    queries: [
      { text: "Show me our top 10 clients by revenue" },
      { text: "Which industries generate the most revenue for us?" },
      { text: "Find clients with the highest growth potential" },
      { text: "List clients who refer the most new business" },
      { text: "Show me deals at risk of not closing this quarter" },
      { text: "Which segments have the best retention rates?" },
    ],
  },
  {
    name: "📈 Pipeline & Forecasting",
    description:
      "Understand your sales pipeline and predict future performance",
    queries: [
      { text: "Show me all deals in the pipeline by stage" },
      { text: "What's our forecasted revenue for next quarter?" },
      { text: "Which deals are stuck in the pipeline?" },
      { text: "Show me conversion rates by pipeline stage" },
      { text: "List deals that need attention this week" },
      { text: "Compare pipeline velocity across different segments" },
    ],
  },
];

// Replace the generateQuery function:
const generateQuery = async (input: string): Promise<string> => {
  return await generateSQLFromNaturalLanguage(input);
};

// Replace the runGeneratedSQLQuery function:
const runGeneratedSQLQuery = async (sql: string): Promise<any[]> => {
  return await executeGeneratedSQL(sql);
};

// Replace the generateChartConfig function:
const generateChartConfig = async (
  results: any[],
  query: string,
): Promise<ChartArtifact | null> => {
  // Determine chart type based on query
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("trend") || lowerQuery.includes("over time")) {
    return {
      type: "chart",
      chartType: "line",
      title: "Trend Analysis",
      kpiType: lowerQuery.includes("revenue") ? "revenue" : "engagement",
      period: "monthly",
      limit: 12,
    };
  }

  return {
    type: "chart",
    chartType: "bar",
    title: "Analysis Results",
    kpiType: "revenue",
    period: "monthly",
    limit: 12,
  };
};

// Update the import for MarkdownContent:
import { MarkdownContent } from "@/components/ui/markdown-content";

import {
  generateSQLFromNaturalLanguage,
  executeGeneratedSQL,
} from "@/components/Unified Commerce Dashboard/lib/database-queries";
import { sendChatMessageInsights } from "../../lib/actions/main-chat-actions";

export function ConversationalInterface({
  onBackToDashboard,
}: ConversationalInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationState, setAnimationState] = useState<"idle" | "animating">(
    "idle",
  );

  const placeholders = [
    "Find clients who haven't been contacted in 30 days...",
    "Show me revenue trends for this quarter...",
    "Which sales rep has the highest conversion rate?...",
    "List high-value clients with low engagement...",
    "Analyze deal pipeline by stage...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (animationState === "idle" && !input && !hasStarted) {
        setAnimationState("animating");
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % placeholders.length);
          setAnimationState("idle");
        }, 1000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [animationState, placeholders.length, input, hasStarted]);

  useEffect(() => {
    if (lastMessageRef.current && hasStarted) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [messages, hasStarted]);

  const handleScrollChange = useCallback((atBottom: boolean) => {
    setIsAtBottom(atBottom);
  }, []);

  const scrollToTopOfLastMessage = useCallback(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  const addMessage = (message: Omit<Message, "id" | "timestamp">): Message => {
    const newMessage = { ...message, id: uuidv4(), timestamp: new Date() };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  // Update the handleSendMessage function to use the AI chat:
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    if (!hasStarted) {
      setHasStarted(true);
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Create a system message for analysis
      const analysisMessage = addMessage({
        role: "system",
        content: `Analyzing: "${currentInput}"...`,
      });

      let streamingContent = "";
      let streamingReasoning = "";
      let assistantMessage: Message | null = null;

      // Use the AI chat service
      const result = await sendChatMessageInsights(
        [{ role: "user", content: currentInput }],
        "moonshotai/kimi-k2-instruct",
        2048,
        // onStream callback
        (chunk: string) => {
          streamingContent += chunk;
          if (assistantMessage) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage!.id
                  ? { ...msg, content: streamingContent }
                  : msg,
              ),
            );
          } else {
            assistantMessage = addMessage({
              role: "assistant",
              content: streamingContent,
              hasArtifacts: false,
              artifacts: [],
            });
          }
        },
        // onReasoningStream callback
        (reasoning: string) => {
          streamingReasoning += reasoning;
          if (assistantMessage) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage!.id
                  ? {
                      ...msg,
                      reasoning: streamingReasoning,
                      isStreamingReasoning: true,
                    }
                  : msg,
              ),
            );
          }
        },
      );

      // Remove the analysis message
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== analysisMessage.id),
      );

      // Update final message with artifacts
      if (assistantMessage && result.artifacts && result.artifacts.length > 0) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage!.id
              ? {
                  ...msg,
                  content: result.content,
                  hasArtifacts: true,
                  artifacts: result.artifacts,
                  reasoning: result.reasoning,
                  isStreamingReasoning: false,
                }
              : msg,
          ),
        );

        setSelectedMessage({
          ...assistantMessage,
          content: result.content,
          hasArtifacts: true,
          artifacts: result.artifacts,
          reasoning: result.reasoning,
        });
        setShowPanel(true);
      } else if (assistantMessage) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage!.id
              ? {
                  ...msg,
                  content: result.content,
                  reasoning: result.reasoning,
                  isStreamingReasoning: false,
                }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error("Error processing query:", error);
      addMessage({
        role: "assistant",
        content:
          "I encountered an error processing your request. Please try rephrasing your question or check back later.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, hasStarted]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleViewArtifacts = (message: Message) => {
    setSelectedMessage(message);
    setShowPanel(true);
  };

  const handleClosePanel = () => {
    setShowPanel(false);
    setSelectedMessage(null);
  };

  const handleExampleQuery = (query: string) => {
    setInput(query);
    if (!hasStarted) {
      setHasStarted(true);
    }
  };

  function SimpleKPIChart({ artifact }: { artifact: ChartArtifact }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<any>(null);

    const fetchKPIData = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/kpi?type=${artifact.kpiType || "revenue"}&period=${artifact.period || "monthly"}&limit=${artifact.limit || 12}`,
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch data");
        }

        if (result.success) {
          setData(result.data || []);
          setSummary(result.summary);
        } else {
          throw new Error(result.error || "Failed to load KPI data");
        }
      } catch (err) {
        console.error("Error fetching KPI data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");

        // Fallback to sample data
        setData([
          { name: "Jan", value: 4000 },
          { name: "Feb", value: 3000 },
          { name: "Mar", value: 5000 },
          { name: "Apr", value: 4500 },
          { name: "May", value: 6000 },
          { name: "Jun", value: 5500 },
        ]);
      } finally {
        setLoading(false);
      }
    }, [artifact.kpiType, artifact.period, artifact.limit]);

    useEffect(() => {
      fetchKPIData();
    }, [fetchKPIData]);

    const formatValue = (value: number) => {
      const kpiType = artifact.kpiType || "revenue";
      if (kpiType === "conversion" || kpiType === "conversion rate") {
        return `${value.toFixed(1)}%`;
      }
      if (kpiType === "revenue" || kpiType === "sales") {
        return `$${value.toLocaleString()}`;
      }
      return value.toLocaleString();
    };

    const renderChart = () => {
      if (loading) {
        return (
          <div className="flex h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading KPI data...</span>
            </div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="flex h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        );
      }

      const chartProps = {
        data,
        margin: { top: 5, right: 30, left: 20, bottom: 5 },
      };

      switch (artifact.chartType) {
        case "line":
          return (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatValue} />
                <Tooltip
                  formatter={(value) => [
                    formatValue(Number(value)),
                    artifact.kpiType,
                  ]}
                />
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
          );
        case "area":
          return (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatValue} />
                <Tooltip
                  formatter={(value) => [
                    formatValue(Number(value)),
                    artifact.kpiType,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          );
        default:
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart {...chartProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatValue} />
                <Tooltip
                  formatter={(value) => [
                    formatValue(Number(value)),
                    artifact.kpiType,
                  ]}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          );
      }
    };

    return (
      <Card className="my-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{artifact.title}</span>
            {summary && summary.trend && (
              <div className="flex items-center gap-2">
                {summary.trend === "up" && (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                {summary.trend === "down" && (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                {summary.trend === "flat" && (
                  <Minus className="h-4 w-4 text-gray-500" />
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>
    );
  }

  function ChatMessageArea({
    children,
    onScrollChange,
    className,
  }: {
    children: React.ReactNode;
    onScrollChange: (atBottom: boolean) => void;
    className?: string;
  }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
        onScrollChange(atBottom);
      }
    }, [onScrollChange]);

    return (
      <ScrollArea
        ref={scrollRef}
        className={cn("flex-1", className)}
        onScrollCapture={handleScroll}
      >
        {children}
      </ScrollArea>
    );
  }

  function AIResponsePanel({ message }: { message: Message }) {
    return (
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          <div className="prose prose-sm max-w-none">
            <MarkdownContent
              id={`panel-${message.id}`}
              content={message.content}
              className="prose prose-sm prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-ul:text-foreground prose-ol:text-foreground max-w-none"
            />
          </div>

          {message.artifacts && message.artifacts.length > 0 && (
            <div className="space-y-4">
              {message.artifacts.map((artifact, index) => (
                <div key={index}>
                  {artifact.type === "chart" && (
                    <SimpleKPIChart artifact={artifact} />
                  )}
                </div>
              ))}
            </div>
          )}

          {message.data && (
            <div className="mt-4">
              {message.data.queryResults &&
                message.data.queryResults.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Query Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              {message.data.columns?.map((col: string) => (
                                <th
                                  key={col}
                                  className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {message.data.queryResults
                              .slice(0, 10)
                              .map((row: any, idx: number) => (
                                <tr key={idx}>
                                  {message.data.columns?.map((col: string) => (
                                    <td
                                      key={col}
                                      className="px-3 py-2 text-sm text-gray-900"
                                    >
                                      {row[col]?.toString() || "-"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        {message.data.queryResults.length > 10 && (
                          <p className="mt-2 text-sm text-gray-500">
                            Showing 10 of {message.data.queryResults.length}{" "}
                            results
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {message.data.sqlQuery && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">SQL Query</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-xs">
                      <code>{message.data.sqlQuery}</code>
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="flex h-screen">
      <div
        className={cn(
          "flex flex-col transition-all duration-300",
          showPanel ? "w-1/2" : "w-full",
        )}
      >
        <div className="flex items-center justify-between border-b bg-background/95 p-4 backdrop-blur">
          <div className="flex items-center gap-2">
            {/* <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
              <ArrowLeft className="h-4 w-4" />
            </Button> */}
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              {/* <Bot className="h-6 w-6" /> */}
              Home
            </h2>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {!hasStarted ? (
              <motion.div
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex h-full w-full flex-col"
              >
                <div className="flex flex-1 items-center justify-center">
                  <div className="w-full max-w-3xl px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mb-8 text-center"
                    >
                      <h1 className="text-4xl font-medium text-foreground">
                        How can I help with your sales?
                      </h1>
                      <p className="mt-2 text-lg text-muted-foreground">
                        Ask me about clients, performance metrics, or
                        opportunities
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="w-full"
                    >
                      <div className="relative w-full">
                        <div
                          className={cn(
                            "relative rounded-3xl border border-border bg-transparent transition-all duration-300",
                            "shadow-[0_0_15px_rgba(0,0,0,0.05)]",
                            isFocused
                              ? "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
                              : "hover:shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.05)]",
                          )}
                        >
                          <div className="relative min-h-[120px] w-full">
                            <textarea
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onFocus={() => setIsFocused(true)}
                              onBlur={() => setIsFocused(false)}
                              onKeyPress={handleKeyPress}
                              className="min-h-[120px] w-full resize-none rounded-3xl bg-transparent px-4 py-5 text-foreground outline-none"
                              placeholder=""
                              disabled={isLoading}
                            />
                            {!input && (
                              <div className="pointer-events-none absolute inset-0 overflow-hidden px-4 py-5 text-muted-foreground">
                                <div className="relative h-full">
                                  <motion.div
                                    key={`current-${currentIndex}`}
                                    initial={{ y: 0, opacity: 1 }}
                                    animate={{
                                      y:
                                        animationState === "animating"
                                          ? -20
                                          : 0,
                                      opacity:
                                        animationState === "animating" ? 0 : 1,
                                    }}
                                    transition={{
                                      duration: 0.6,
                                      ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="absolute inset-0"
                                  >
                                    {placeholders[currentIndex]}
                                  </motion.div>
                                  <motion.div
                                    key={`next-${currentIndex}`}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{
                                      y:
                                        animationState === "animating" ? 0 : 20,
                                      opacity:
                                        animationState === "animating" ? 1 : 0,
                                    }}
                                    transition={{
                                      duration: 0.6,
                                      ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="absolute inset-0"
                                  >
                                    {
                                      placeholders[
                                        (currentIndex + 1) % placeholders.length
                                      ]
                                    }
                                  </motion.div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-4 right-4 flex items-center gap-2">
                            <button className="rounded-full p-1.5 transition-colors hover:bg-muted/20">
                              <PaperclipIcon
                                size={18}
                                className="text-muted-foreground"
                              />
                            </button>
                            <div className="flex justify-center">
                               <button
                            onClick={handleSendMessage}
                            disabled={isLoading || !input.trim()}
                            className="rounded-full bg-purple-600 p-1.5 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 4V20M12 4L6 10M12 4L18 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                               
                              />
                            </svg>
                          </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-full px-8 pb-8"
                >
                  <div className="mx-auto max-w-7xl">
                    <h3 className="mb-4 text-center text-lg font-semibold">
                      Popular Queries
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {EXAMPLE_QUERIES.slice(0, 3).map((category) => (
                        <Card
                          key={category.name}
                          className="transition-shadow hover:shadow-lg"
                        >
                          <CardHeader>
                            <CardTitle className="text-base">
                              {category.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {category.queries
                                .slice(0, 3)
                                .map((query, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() =>
                                      handleExampleQuery(query.text)
                                    }
                                    className="w-full rounded p-2 text-left text-sm transition-colors hover:bg-muted"
                                  >
                                    {query.text}
                                  </button>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex h-full flex-col"
              >
                <ChatMessageArea
                  onScrollChange={handleScrollChange}
                  className="space-y-4 px-4 py-8"
                >
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        ref={
                          index === messages.length - 1 ? lastMessageRef : null
                        }
                        className={cn(
                          "flex gap-3",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start",
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] space-y-2",
                            message.role === "user" ? "order-first" : "",
                          )}
                        >
                          {message.role === "assistant" &&
                            message.reasoning && (
                              <Card className="border-gray-200 bg-gray-50">
                                <CardContent className="p-3">
                                  <div className="mb-2 flex items-center gap-2">
                                    <Brain className="h-3 w-3 text-gray-500" />
                                    <span className="text-xs font-medium text-gray-500">
                                      {message.isStreamingReasoning
                                        ? "Thinking..."
                                        : "Reasoning"}
                                    </span>
                                  </div>
                                  <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-600">
                                    {message.reasoning}
                                    {message.isStreamingReasoning && (
                                      <span className="ml-1 inline-block h-3 w-2 animate-pulse bg-gray-400" />
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          <Card
                            className={cn(
                              message.role === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-muted",
                            )}
                          >
                            <CardContent className="p-3">
                              {message.role === "assistant" ? (
                                <MarkdownContent
                                  id={`message-${message.id}`}
                                  content={message.content}
                                  className="prose prose-sm prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-ul:text-foreground prose-ol:text-foreground max-w-none"
                                />
                              ) : (
                                <p className="whitespace-pre-wrap text-sm">
                                  {message.content}
                                </p>
                              )}
                              {message.hasArtifacts && (
                                <div className="mt-2 border-t border-border/50 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewArtifacts(message)}
                                    className="text-xs"
                                  >
                                    View Results & Charts
                                  </Button>
                                </div>
                              )}
                              {message.data?.queryResults && (
                                <div className="mt-2 rounded bg-black/5 p-2 text-sm">
                                  Found {message.data.queryResults.length}{" "}
                                  results
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          {message.role === "system" && (
                            <div className="text-xs italic text-muted-foreground">
                              {message.content}
                            </div>
                          )}
                          <p className="mt-1 px-1 text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <Card className="bg-muted">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </ChatMessageArea>

                {!isAtBottom && messages.length > 3 && (
                  <Button
                    onClick={scrollToTopOfLastMessage}
                    className="fixed bottom-32 right-10 z-50 h-9 w-9 rounded-full shadow-lg"
                    size="icon"
                    variant="secondary"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {hasStarted && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t bg-background/95 p-4 backdrop-blur"
            >
              <div className="mx-auto w-full max-w-4xl">
                <div
                  className={cn(
                    "relative rounded-3xl border border-border bg-transparent transition-all duration-300",
                    "shadow-[0_0_15px_rgba(0,0,0,0.05)]",
                    isFocused
                      ? "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
                      : "hover:shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.05)]",
                  )}
                >
                  <div className="flex items-center">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Ask about clients, metrics, or sales opportunities..."
                      className="flex-1 rounded-3xl bg-transparent px-4 py-3 text-foreground outline-none"
                      disabled={isLoading}
                    />
                    <div className="flex items-center gap-2 pr-3">
                      <button className="rounded-full p-1.5 transition-colors hover:bg-muted/20">
                        <PaperclipIcon
                          size={18}
                          className="text-muted-foreground"
                        />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        className="rounded-full bg-blue-600 p-1.5 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Top clients",
                    "At-risk deals",
                    "Follow-ups today",
                    "Revenue trends",
                    "Team performance",
                  ].map((action) => (
                    <button
                      key={action}
                      onClick={() => setInput(action)}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showPanel && selectedMessage && (
        <div className="w-1/2 border-l bg-background">
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="font-semibold">Analysis Results</h3>
            <Button variant="ghost" size="sm" onClick={handleClosePanel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AIResponsePanel message={selectedMessage} />
        </div>
      )}
    </div>
  );
}
