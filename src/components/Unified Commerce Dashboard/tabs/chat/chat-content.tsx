"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  generateQuery,
  runGeneratedSQLQuery,
  generateChartConfig,
  explainQuery,
  generateActionSuggestions,
} from "@/components/Unified Commerce Dashboard/lib/actions/prompt_actions";

import { ChatMessage, ChatMessageData } from "@/types/chats"; // Using your specified path
import { SegmentationForm, ExampleQueries } from "../../segmentation"; // Using your specified path
import ChatMessageItem from "../../components/chat-message-item"; // Using your specified path
import SideArtifactPanel from "./components/side.panel";

const EXAMPLE_QUERIES = [
  {
    name: "🚀 Customer Engagement & Retention",
    name: "🚀 Customer Engagement & Retention",
    description:
      "Keep your clients active, identify churn risks, and celebrate milestones.",
      "Keep your clients active, identify churn risks, and celebrate milestones.",
    queries: [
      {
        text: "Show me clients who haven't logged into their account in 30 days but still have an active loan or account.",
        text: "Show me clients who haven't logged into their account in 30 days but still have an active loan or account.",
      },
      {
        text: "Identify customers at high risk of closing their accounts based on recent activity.",
        text: "Identify customers at high risk of closing their accounts based on recent activity.",
      },
      {
        text: "List clients with upcoming birthdays this month for personalized offers.",
        text: "List clients with upcoming birthdays this month for personalized offers.",
      },
      {
        text: "Show me clients approaching a loan payoff milestone (e.g., 50%, 75% paid off).",
        text: "Show me clients approaching a loan payoff milestone (e.g., 50%, 75% paid off).",
      },
      {
        text: "Find customers whose engagement score has dropped significantly in the last month.",
        text: "Find customers whose engagement score has dropped significantly in the last month.",
      },
      {
        text: "List clients celebrating their account anniversary in the next 30 days.",
        text: "List clients celebrating their account anniversary in the next 30 days.",
      },
    ],
  },
  {
    name: "🎯 Lead Management & New Customer Onboarding",
    name: "🎯 Lead Management & New Customer Onboarding",
    description:
      "Convert prospects effectively and welcome new clients smoothly.",
      "Convert prospects effectively and welcome new clients smoothly.",
    queries: [
      {
        text: "Show me leads who started a loan application but haven't completed it.",
      },
      {
        text: "List new leads from the 'Online Loan Inquiry Form' in the last 7 days.",
      },
      {
        text: "Identify prospects who requested a callback last week but haven't been contacted.",
        text: "Identify prospects who requested a callback last week but haven't been contacted.",
      },
      {
        text: "Find leads interested in 'Home Loans' but haven't scheduled a consultation.",
        text: "Find leads interested in 'Home Loans' but haven't scheduled a consultation.",
      },
    ],
  },
  {
    name: "💳 Loan & Account Insights",
    name: "💳 Loan & Account Insights",
    description:
      "Manage loans, renewals, and identify cross-sell or upsell opportunities.",
      "Manage loans, renewals, and identify cross-sell or upsell opportunities.",
    queries: [
      {
        text: "Find clients whose loan is expiring or due for renewal in the next 14 days.",
        text: "Find clients whose loan is expiring or due for renewal in the next 14 days.",
      },
      {
        text: "List clients with credit card balances above 80% of their limit.",
        text: "List clients with credit card balances above 80% of their limit.",
      },
      { text: "Show customers whose auto-payment failed this month." },
      { text: "Show customers whose auto-payment failed this month." },
      {
        text: "Identify clients eligible for an upgrade to a premium account or loan product.",
        text: "Identify clients eligible for an upgrade to a premium account or loan product.",
      },
    ],
  },
  {
    name: "📊 Product & Advisor Performance",
    name: "📊 Product & Advisor Performance",
    description:
      "Analyze product uptake, advisor effectiveness, and customer preferences.",
      "Analyze product uptake, advisor effectiveness, and customer preferences.",
    queries: [
      {
        text: "Which advisor has the highest loan origination rate this month?",
      },
      {
        text: "Find clients who opened an account with advisor Alex in the past month.",
        text: "Find clients who opened an account with advisor Alex in the past month.",
      },
      { text: "What were the most popular loan products last quarter?" },
      { text: "What were the most popular loan products last quarter?" },
      {
        text: "Show me products with consistently low uptake for potential review.",
        text: "Show me products with consistently low uptake for potential review.",
      },
      {
        text: "Compare uptake for 'Personal Loans' vs 'Auto Loans' last month.",
        text: "Compare uptake for 'Personal Loans' vs 'Auto Loans' last month.",
      },
    ],
  },
  {
    name: "💡 Operational & Communication Segments",
    description:
      "Create targeted lists for specific actions and communications.",
    queries: [
      {
        text: "Show me clients who missed a payment in the last 30 days.",
        text: "Show me clients who missed a payment in the last 30 days.",
      },
      {
        text: "Generate a list of customers who haven't opened our last three email statements.",
        text: "Generate a list of customers who haven't opened our last three email statements.",
      },
      {
        text: "Find clients who live in the 'Downtown' area and have high credit scores.",
        text: "Find clients who live in the 'Downtown' area and have high credit scores.",
      },
      {
        text: "List all clients who have provided positive feedback via post-service surveys.",
        text: "List all clients who have provided positive feedback via post-service surveys.",
      },
    ],
  },
]

export default function ChatContent() {
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInChatMode, setIsInChatMode] = useState(false);

  const [sideArtifactData, setSideArtifactData] =
    useState<ChatMessageData | null>(null);
  const [currentMessageIdForPanel, setCurrentMessageIdForPanel] = useState<
    string | null
  >(null); // To track which message's data is in panel
  const [isSideArtifactOpen, setIsSideArtifactOpen] = useState(false);
  const [isSideArtifactExpanded, setIsSideArtifactExpanded] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInChatMode && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isInChatMode]);

  // Modified addMessage to return the full message object
  const addMessage = (
    message: Omit<ChatMessage, "id" | "timestamp">,
  ): ChatMessage => {
    const newMessage = { ...message, id: uuidv4(), timestamp: new Date() };
    setChatMessages((prev) => [...prev, newMessage]);
    return newMessage; // Return the full message with ID and timestamp
  };

  const handleOpenSideArtifact = (data: ChatMessageData, messageId: string) => {
    setSideArtifactData(data);
    setCurrentMessageIdForPanel(messageId); // Track which message's data is open
    setIsSideArtifactOpen(true);
    // Ensure it's not expanded when newly opened, unless it was already expanded for this item
    if (sideArtifactData !== data) {
      // Only reset expansion if data is different
      setIsSideArtifactExpanded(false);
    }
  };

  const handleCloseSideArtifact = () => {
    setIsSideArtifactOpen(false);
    setCurrentMessageIdForPanel(null); // Clear tracker when panel is closed
    setIsSideArtifactExpanded(false);
  };

  const handleToggleSideArtifactExpand = () => {
    setIsSideArtifactExpanded((prev) => !prev);
  };

  const handleArtifactViewModeChange = (
    newMode: "table" | "chart" | "actions",
  ) => {
    setSideArtifactData((prevData) =>
      prevData ? { ...prevData, viewMode: newMode } : null,
    );
  };

  const handleSubmit = async (userQuery: string) => {
    if (!userQuery.trim()) return;

    // Debug the incoming query
    console.log("handleSubmit received query:", userQuery);

    if (!isInChatMode) {
      setIsInChatMode(true);
      addMessage({
        role: "assistant",
        content: "Hello! I'm Consuelo. Let's find those clients for you.",
      });
    }

    // Add user message to chat
    setTimeout(() => {
      addMessage({ role: "user", content: userQuery });
    }, 0);
    setInputValue("");
    setIsLoading(true);
    handleCloseSideArtifact(); // Close any existing panel when new query starts

    // Special case for OPEN_OTF_FORM - This needs to be EXACT and case sensitive
    if (userQuery.trim() === "OPEN_OTF_FORM") {
      console.log("SPECIAL COMMAND DETECTED: OPEN_OTF_FORM");
      try {
        // Add a system message
        addMessage({
          role: "system",
          content: `Opening the lead generator tool...`,
        });

        // Create assistant message with leadGenerator viewMode
        const finalAssistantMessage = addMessage({
          role: "assistant",
          content: `I've opened the lead generator tool for you.`,
          data: {
            viewMode: "leadGenerator", // Must match exactly the type in ChatMessageData
            queryContext: "Lead Generator",
          },
        });

        // Debugging the created message
        console.log("Created lead generator message:", finalAssistantMessage);

        // Open the side panel
        if (finalAssistantMessage.data) {
          console.log("Opening side panel with:", finalAssistantMessage.data);
          handleOpenSideArtifact(
            finalAssistantMessage.data,
            finalAssistantMessage.id,
          );
        }
      } catch (err) {
        console.error("Error during lead generator setup:", err);
        const errorMsg =
          err instanceof Error ? err.message : "An unknown error occurred";
        addMessage({ role: "system", content: `Error: ${errorMsg}` });
        addMessage({
          role: "assistant",
          content: "I encountered an issue opening the lead generator.",
          data: { error: errorMsg },
        });
      } finally {
        setIsLoading(false);
      }

      return; // Exit early
    }

    // Check for Research prefix
    if (userQuery.trim().startsWith("Research:")) {
      console.log("RESEARCH PREFIX DETECTED");
      try {
        const actualQuery = userQuery
          .substring(userQuery.indexOf(":") + 1)
          .trim();

        // Add a system message
        addMessage({
          role: "system",
          content: `Opening lead generator for: "${actualQuery}"...`,
        });

        // Create assistant message with leadGenerator viewMode
        const finalAssistantMessage = addMessage({
          role: "assistant",
          content: `I've opened the lead generator for: "${actualQuery}"`,
          data: {
            viewMode: "leadGenerator",
            queryContext: actualQuery,
          },
        });

        // Open the side panel
        if (finalAssistantMessage.data) {
          handleOpenSideArtifact(
            finalAssistantMessage.data,
            finalAssistantMessage.id,
          );
        }
      } catch (err) {
        console.error("Error during research setup:", err);
        const errorMsg =
          err instanceof Error ? err.message : "An unknown error occurred";
        addMessage({ role: "system", content: `Error: ${errorMsg}` });
        addMessage({
          role: "assistant",
          content: "I encountered an issue preparing the lead generator.",
          data: { error: errorMsg },
        });
      } finally {
        setIsLoading(false);
      }

      return; // Exit early
    }

    // If we get here, it's a regular search query
    console.log("Processing as regular search query");
    const tempResponseData: ChatMessageData = { viewMode: "cards" }; // Default to cards

    const handleExampleQuerySelection = (query: string) => {
      const prefixedQuery = `Search: ${query}`;
      setInputValue(prefixedQuery);
      const targetTextareaId = isInChatMode
        ? "#chat-input-form textarea"
        : "#research-textarea";
      // Ensure the element exists before trying to focus
      const targetTextarea =
        document.querySelector<HTMLTextAreaElement>(targetTextareaId);
      targetTextarea?.focus();
    };
    const handleOpenLeadGenerator = () => {
      console.log("Opening lead generator directly");

      // Close any existing side panel
      handleCloseSideArtifact();

      // Create a message specifically for the lead generator
      const message = addMessage({
        role: "assistant",
        content: "Lead generator tool is ready to use.",
        data: {
          viewMode: "leadGenerator",
          queryContext: "Lead Generation",
        },
      });

      // Directly open the side panel
      if (message.data) {
        console.log(
          "Opening side panel with lead generator data:",
          message.data,
        );
        handleOpenSideArtifact(message.data, message.id);
      }
    };
    if (!isInChatMode) {
      return (
        <div className="flex min-h-screen flex-col items-center bg-white px-4 py-10 text-gray-900 sm:py-16">
          <main className="flex w-full max-w-3xl flex-col items-center space-y-10 sm:space-y-12">
            <header className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl lg:text-5xl">
                Who would you like to contact?
              </h1>
              <p className="mt-2 max-w-xl text-base text-gray-600 sm:mt-3 sm:text-lg">
                Describe the client segment, or explore examples below.
              </p>
            </header>
            <div className="w-full">
              {/* Ensure SegmentationForm has an id for its textarea if handleExampleQuerySelection needs to focus it */}
              <SegmentationForm
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>

            {!isLoading && (
              <div className="w-full">
                <ExampleQueries
                  categorizedQueries={EXAMPLE_QUERIES}
                  onSelectQuery={handleExampleQuerySelection}
                />
              </div>
            )}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500"></div>
                <p className="text-lg font-semibold text-gray-700">
                  Processing your first query...
                </p>
              </div>
            )}
          </main>
        </div>
      );
    }

    // Adjusted main chat area width calculation when panel is open and not expanded
    const chatAreaMarginRight =
      isSideArtifactOpen && !isSideArtifactExpanded
        ? "mr-[80vw] sm:mr-[60vw] md:mr-[calc(100vw*7/12)] lg:mr-[50vw] xl:mr-[calc(100vw*5/12)]"
        : "";

    return (
      <div className="relative flex h-screen w-full overflow-hidden">
        {/* Main Chat Area */}
        <div
          className={`flex h-full flex-grow flex-col transition-all duration-300 ease-in-out ${chatAreaMarginRight}`}
        >
          {/* <header className="py-3 px-4 sm:px-6 bg-white border-b border-gray-200 text-center sticky top-0 z-20">
                <h1 className="text-xl font-semibold text-gray-800">Consuelo AI Chat</h1>
            </header> */}
          <div
            ref={chatContainerRef}
            className="flex-grow space-y-4 overflow-y-auto bg-gray-50 p-4 sm:p-6"
          >
            {chatMessages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                // Pass correct handlers to ChatMessageItem
                onViewDetailsRequest={
                  msg.role === "assistant" && msg.data && !msg.data.error
                    ? (data) => handleOpenSideArtifact(data, msg.id)
                    : undefined
                }
                onClosePanelRequest={
                  isSideArtifactOpen && currentMessageIdForPanel === msg.id
                    ? handleCloseSideArtifact
                    : undefined
                }
                isDisplayedInPanel={
                  isSideArtifactOpen && currentMessageIdForPanel === msg.id
                }
              />
            ))}
          </div>
          <div
            id="chat-input-form"
            className="sticky bottom-0 z-20 border-t border-gray-200 bg-white p-3 sm:p-4"
          >
            <SegmentationForm
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>

        {isInChatMode && (
          <div className="fixed bottom-24 right-6 z-30">
            <button
              onClick={handleOpenLeadGenerator}
              className="flex items-center space-x-2 rounded-lg bg-sky-500 px-4 py-2 text-white shadow-lg hover:bg-sky-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Open Lead Generator</span>
            </button>
          </div>
        )}

        {/* Side Artifact Panel */}
        <SideArtifactPanel
          data={sideArtifactData}
          isOpen={isSideArtifactOpen}
          isExpanded={isSideArtifactExpanded}
          onClose={handleCloseSideArtifact}
          onToggleExpand={handleToggleSideArtifactExpand}
          onViewModeChange={handleArtifactViewModeChange}
        />
      </div>
    );
  };
}
