import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Sparkles, User, Bot, X } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasArtifacts?: boolean;
  artifacts?: any[];
}

interface ConversationalInterfaceProps {
  onBackToDashboard: () => void;
}

// Simple AI Response Panel without complex dependencies
function SimpleAIResponsePanel({ message }: { message: Message }) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="prose prose-sm max-w-none">
          <p>{message.content}</p>
        </div>
        
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="space-y-4">
            {message.artifacts.map((artifact, index) => (
              <Card key={index} className="p-4">
                {artifact.type === "chart" && (
                  <div>
                    <h4 className="font-semibold mb-2">{artifact.title}</h4>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Chart visualization would appear here</p>
                      <pre className="text-xs mt-2 overflow-auto">
                        {JSON.stringify(artifact.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {artifact.type === "email" && (
                  <div>
                    <h4 className="font-semibold mb-2">Email Template</h4>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="font-medium">Subject: {artifact.subject}</p>
                      <div className="mt-2 whitespace-pre-wrap text-sm">
                        {artifact.template}
                      </div>
                    </div>
                  </div>
                )}
                
                {artifact.type === "automation" && (
                  <div>
                    <h4 className="font-semibold mb-2">{artifact.name}</h4>
                    <div className="bg-gray-50 p-4 rounded space-y-2">
                      <p className="text-sm">{artifact.description}</p>
                      <p className="text-sm"><strong>Trigger:</strong> {artifact.trigger}</p>
                      <div>
                        <strong className="text-sm">Actions:</strong>
                        <ul className="list-disc list-inside text-sm">
                          {artifact.actions.map((action: string, i: number) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
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
  );
}

// Fixed sendChatMessage function
async function sendChatMessage(messages: Array<{role: string, content: string}>): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle streaming response
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const content = JSON.parse(line.substring(2));
              if (typeof content === 'string') {
                result += content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
      
      return result || "I received your message but couldn't generate a proper response.";
    }

    // Fallback for non-streaming response
    const data = await response.json();
    return data.content || data.message || "I'm having trouble responding right now.";
    
  } catch (error) {
    console.error("Error in chat:", error);
    return "I'm sorry, I encountered an error processing your request. Please try again.";
  }
}

export function ConversationalInterface({ onBackToDashboard }: ConversationalInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI business assistant. I can help you analyze your CRM data, create reports, send emails, set up automations, and much more. What would you like to know about your business?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Prepare conversation history for AI
      const conversationHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await sendChatMessage(conversationHistory);

      // Determine if response should have artifacts based on content
      const hasArtifacts = shouldGenerateArtifacts(response, currentInput);
      const artifacts = hasArtifacts ? generateArtifacts(response, currentInput) : [];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        hasArtifacts,
        artifacts,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-open panel if there are artifacts
      if (hasArtifacts) {
        setSelectedMessage(assistantMessage);
        setShowPanel(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading]);

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

  return (
    <div className="flex h-screen">
      {/* Chat Interface */}
      <div className={`flex flex-col transition-all duration-300 ${showPanel ? "w-1/2" : "w-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBackToDashboard}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              AI Business Assistant
            </h2>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}

                <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                  <Card className={`${message.role === "user" ? "bg-blue-500 text-white" : "bg-muted"}`}>
                    <CardContent className="p-3">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.hasArtifacts && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewArtifacts(message)}
                            className="text-xs"
                          >
                            View Interactive Response
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-background/95 backdrop-blur">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your sales, create a report, send an email, set up automation..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI Response Panel */}
      {showPanel && selectedMessage && (
        <div className="w-1/2 border-l bg-background">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Interactive Response</h3>
            <Button variant="ghost" size="sm" onClick={handleClosePanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <SimpleAIResponsePanel message={selectedMessage} />
        </div>
      )}
    </div>
  );
}

// Helper functions
function shouldGenerateArtifacts(response: string, userInput: string): boolean {
  const artifactKeywords = [
    "chart",
    "graph",
    "report",
    "email",
    "template",
    "automation",
    "workflow",
    "kpi",
    "dashboard",
    "analysis",
    "data",
    "sales",
    "leads",
    "performance",
    "revenue",
    "conversion",
  ];

  const combinedText = (response + " " + userInput).toLowerCase();
  return artifactKeywords.some((keyword) => combinedText.includes(keyword));
}

function generateArtifacts(response: string, userInput: string): any[] {
  const artifacts = [];
  const combinedText = (response + " " + userInput).toLowerCase();

  // Generate chart if data/analytics requested
  if (
    combinedText.includes("chart") ||
    combinedText.includes("graph") ||
    combinedText.includes("sales") ||
    combinedText.includes("revenue") ||
    combinedText.includes("performance")
  ) {
    artifacts.push({
      type: "chart",
      title: "Sales Performance",
      data: generateSampleChartData(userInput),
    });
  }

  // Generate email template if email mentioned
  if (combinedText.includes("email") || combinedText.includes("template")) {
    artifacts.push({
      type: "email",
      subject: "Follow up on your inquiry",
      template: generateEmailTemplate(userInput),
    });
  }

  // Generate automation if workflow mentioned
  if (combinedText.includes("automation") || combinedText.includes("workflow")) {
    artifacts.push({
      type: "automation",
      name: "Lead Follow-up Automation",
      description: "Automatically follow up with new leads",
      trigger: "New lead created",
      actions: ["Send welcome email", "Add to nurture sequence", "Notify sales team"],
    });
  }

  return artifacts;
}

function generateSampleChartData(userInput: string) {
  if (userInput.toLowerCase().includes("month")) {
    return [
      { name: "Jan", value: 4000, leads: 120 },
      { name: "Feb", value: 3000, leads: 98 },
      { name: "Mar", value: 5000, leads: 150 },
      { name: "Apr", value: 4500, leads: 135 },
      { name: "May", value: 6000, leads: 180 },
      { name: "Jun", value: 5500, leads: 165 },
    ];
  }

  return [
    { name: "Week 1", value: 1200, leads: 30 },
    { name: "Week 2", value: 1800, leads: 45 },
    { name: "Week 3", value: 1600, leads: 38 },
    { name: "Week 4", value: 2100, leads: 52 },
  ];
}

function generateEmailTemplate(userInput: string): string {
  if (userInput.toLowerCase().includes("follow up")) {
    return `Hi {{firstName}},

Thank you for your interest in our services. I wanted to follow up on our recent conversation and see if you have any questions.

We're here to help you achieve your business goals. Would you like to schedule a quick call to discuss how we can support you?

Best regards,
{{senderName}}`;
  }

  return `Hi {{firstName}},

Thank you for reaching out to us. We're excited to help you with your business needs.

Our team will be in touch shortly to discuss the next steps.

Best regards,
{{senderName}}`;
}