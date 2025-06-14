"use client"; // This directive must be at the very top of the file

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  generateQuery,
  runGeneratedSQLQuery,
  generateChartConfig,
  explainQuery,
  generateActionSuggestions,
  // No need to import generateSalesScript here, it's called by SideArtifactPanel
} from "@/components/Unified Commerce Dashboard/lib/actions/prompt_actions";// Assuming this is your server actions file path

import type { ChatMessage, ChatMessageData } from "@/types/chats";

import ChatMessageItem from "./components/chat-message-item";
import SideArtifactPanel from "./components/side.panel"; // Ensure this path is correct
import ExampleQueries from "./example-queries";
import SegmentationForm from "./segmentation-form";

const EXAMPLE_QUERIES = [
  {
    name: "🚀 Customer Engagement & Retention",
    description:
      "Keep your clients active, identify churn risks, and celebrate milestones.",
    name: "🚀 Customer Engagement & Retention",
    description:
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
    description:
      "Convert prospects effectively and welcome new clients smoothly.",
    name: "🎯 Lead Management & New Customer Onboarding",
    description:
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
    description:
      "Manage loans, renewals, and identify cross-sell or upsell opportunities.",
    name: "💳 Loan & Account Insights",
    description:
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
    description:
      "Analyze product uptake, advisor effectiveness, and customer preferences.",
    name: "📊 Product & Advisor Performance",
    description:
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
];

export default function ChatContent() {
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInChatMode, setIsInChatMode] = useState(false);

  const [sideArtifactData, setSideArtifactData] =
    useState<ChatMessageData | null>(null);
  const [currentMessageIdForPanel, setCurrentMessageIdForPanel] = useState<
    string | null
  >(null);
  const [isSideArtifactOpen, setIsSideArtifactOpen] = useState(false);
  const [isSideArtifactExpanded, setIsSideArtifactExpanded] = useState(false);
  const [lastUserQueryForPanel, setLastUserQueryForPanel] =
    useState<string>(""); // Store userQuery for the panel

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInChatMode && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isInChatMode]);

  const addMessage = (
    message: Omit<ChatMessage, "id" | "timestamp">,
  ): ChatMessage => {
    const newMessage = { ...message, id: uuidv4(), timestamp: new Date() };
    setChatMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleOpenSideArtifact = (
    data: ChatMessageData,
    messageId: string,
    userQueryContext: string,
  ) => {
    setSideArtifactData(data);
    setCurrentMessageIdForPanel(messageId);
    setLastUserQueryForPanel(userQueryContext); // Store the user query associated with this panel's data
    setIsSideArtifactOpen(true);
    if (sideArtifactData !== data) {
      setIsSideArtifactExpanded(false);
    }
  };

  const handleCloseSideArtifact = () => {
    setIsSideArtifactOpen(false);
    setCurrentMessageIdForPanel(null);
    setIsSideArtifactExpanded(false);
    // setLastUserQueryForPanel(""); // Optionally clear it
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

    // Debug log to see exactly what query we're processing
    console.log("handleSubmit processing query:", userQuery);

    if (!isInChatMode) {
      setIsInChatMode(true);
      addMessage({
        role: "assistant",
        content: "Hello! I'm Consuelo. Let's find those clients for you.",
      });
    }

    setTimeout(() => {
      addMessage({ role: "user", content: userQuery });
    }, 0);
    setInputValue("");
    setIsLoading(true);
    handleCloseSideArtifact();

    // Check for lead generator triggers:
    // 1. "OPEN_OTF_FORM" special command
    // 2. "Research:" prefixed queries
    if (
      userQuery.trim() === "OPEN_OTF_FORM" ||
      userQuery.trim().startsWith("Research:")
    ) {
      console.log("Lead generator trigger detected:", userQuery);

      try {
        // Extract actual query for Research: prefix
        const actualQuery = userQuery.trim().startsWith("Research:")
          ? userQuery.substring(userQuery.indexOf(":") + 1).trim()
          : "Lead Generator";

        // Add a system message about opening lead generator
        addMessage({
          role: "system",
          content: `Opening Lead Generator tool${actualQuery !== "Lead Generator" ? ` for: "${actualQuery}"` : ""}...`,
        });

        // Create message with leadGenerator viewMode - this is critical!
        const leadGenMessage = addMessage({
          role: "assistant",
          content: `I've opened the Lead Generator tool${actualQuery !== "Lead Generator" ? ` for: "${actualQuery}"` : ""}.`,
          data: {
            viewMode: "leadGenerator", // This is what triggers the lead generator view
            queryContext: actualQuery,
            userQuery: actualQuery, // Store the query for reference
          },
        });

        console.log("Created lead generator message:", leadGenMessage);

        // Open side panel with lead generator data
        if (leadGenMessage.data) {
          handleOpenSideArtifact(
            leadGenMessage.data,
            leadGenMessage.id,
            actualQuery,
          );
        }
      } catch (err) {
        console.error("Error opening lead generator:", err);
        const errorMsg =
          err instanceof Error ? err.message : "An unknown error occurred";
        addMessage({ role: "system", content: `Error: ${errorMsg}` });
        addMessage({
          role: "assistant",
          content: "I encountered an issue opening the Lead Generator tool.",
          data: { error: errorMsg },
        });
      } finally {
        setIsLoading(false);
      }

      return; // Exit early - don't process as regular search
    }

    // If we reach here, it's a regular search query - continue with your existing code
    // Store the userQuery that initiated this process
    const currentQueryContext = userQuery;

    // Initialize tempResponseData with the userQuery
    const tempResponseData: ChatMessageData = {
      viewMode: "cards",
      userQuery: currentQueryContext,
    };

    try {
      addMessage({
        role: "system",
        content: `Thinking about: "${currentQueryContext}"...`,
      });
      tempResponseData.aiThoughts = `To answer "${currentQueryContext}", I'm starting by formulating a precise database query.`;
      addMessage({
        role: "system",
        content: "1. Translating your request into a database query...",
      });
      const generatedSql = await generateQuery(currentQueryContext); // Pass currentQueryContext
      tempResponseData.sqlQuery = generatedSql;
      addMessage({ role: "system", content: "   - SQL Generated." });

      addMessage({
        role: "system",
        content: "2. Running the query against the database...",
      });
      let results = await runGeneratedSQLQuery(generatedSql);
      addMessage({ role: "system", content: "   - Query Executed." });

      if (results && results.length > 0) {
        if (
          typeof results[0] === "string" &&
          (results[0].startsWith("{") || results[0].startsWith("["))
        ) {
          results = results.map((item) => {
            try {
              return JSON.parse(item);
            } catch {
              return item;
            }
          });
        }
        tempResponseData.queryResults = results;
        const firstResult = results[0];
        tempResponseData.columns =
          typeof firstResult === "object" && firstResult !== null
            ? Object.keys(firstResult)
            : ["value"];
        addMessage({
          role: "system",
          content:
            "3. Analyzing results and preparing visualizations/actions...",
        });
        tempResponseData.isLoadingChart = true;
        tempResponseData.isLoadingActions = true;

        try {
          const [chartResult, actionResult, explanationResult] =
            await Promise.allSettled([
              generateChartConfig(results, currentQueryContext), // Pass currentQueryContext
              generateActionSuggestions(results, currentQueryContext), // Pass currentQueryContext
              explainQuery(currentQueryContext, generatedSql), // Pass currentQueryContext
            ]);
          if (chartResult.status === "fulfilled")
            tempResponseData.chartConfig = chartResult.value;
          if (actionResult.status === "fulfilled")
            tempResponseData.actionSuggestions = actionResult.value;
          if (explanationResult.status === "fulfilled")
            tempResponseData.explanations = explanationResult.value;
        } catch (vizError) {
          console.error("Viz/Action/Explanation error:", vizError);
          addMessage({
            role: "system",
            content: "Error during result analysis.",
          });
        } finally {
          tempResponseData.isLoadingChart = false;
          tempResponseData.isLoadingActions = false;
        }
        addMessage({ role: "system", content: "   - Analysis Complete." });
      } else {
        tempResponseData.queryResults = [];
        tempResponseData.columns = [];
        addMessage({
          role: "system",
          content: "No specific data found, but here's the SQL I tried:",
        });
      }

      const finalAssistantMessage = addMessage({
        role: "assistant",
        content: `I've processed your request for "${currentQueryContext}".`,
        data: { ...tempResponseData }, // tempResponseData already includes userQuery
      });

      if (finalAssistantMessage.data && !finalAssistantMessage.data.error) {
        // Pass the currentQueryContext when opening the panel
        handleOpenSideArtifact(
          finalAssistantMessage.data,
          finalAssistantMessage.id,
          currentQueryContext,
        );
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unknown error occurred";
      addMessage({ role: "system", content: `Error: ${errorMsg}` });
      addMessage({
        role: "assistant",
        content: "I encountered an issue processing your request.",
        data: { error: errorMsg, userQuery: currentQueryContext }, // Also include userQuery in error data
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleQuerySelection = (query: string) => {
    // const prefixedQuery = `Search: ${query}`; // If you want a prefix
    setInputValue(query); // Set directly for cleaner input
    const targetTextareaId = isInChatMode
      ? "#chat-input-form textarea"
      : "#research-textarea";
    const targetTextarea =
      document.querySelector<HTMLTextAreaElement>(targetTextareaId);
    targetTextarea?.focus();
  };

  if (!isInChatMode) {
    // Updated initial view with centered chat and visible cards
    return (
      <div className="flex min-h-screen flex-col justify-between overflow-y-auto bg-white text-gray-900">
        {/* Wrapper for content that should be towards the top/middle */}
        <div>
          {/* Top spacer to push content to middle */}
          <div className="h-[20vh] min-h-[120px] flex-shrink-0"></div>

          <main className="mx-auto flex w-full max-w-7xl flex-col items-center space-y-6 px-4">
            {/* Compact header section */}
            <header className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
                How can I help your business?
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-base text-gray-600 sm:text-lg">
                Describe the client segment, or use the research button to find
                leads.
              </p>
            </header>

            {/* Compact input form section */}
            <div className="w-full max-w-4xl [&>*]:focus-within:border-transparent [&>*]:focus-within:ring-0">
              <SegmentationForm
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500"></div>
                <p className="text-lg font-semibold text-gray-700">
                  Processing your first query...
                </p>
              </div>
            )}
          </main>
        </div>{" "}
        {/* End of wrapper for top/middle content */}
        {/* Full-width examples section with more horizontal space - will be pushed lower by justify-between */}
        {!isLoading && (
          <div className="w-full max-w-full px-8 pb-16 pt-8">
            {" "}
            {/* Changed mt-8 to pt-8 */}
            <ExampleQueries
              categorizedQueries={EXAMPLE_QUERIES}
              onSelectQuery={handleExampleQuerySelection}
              onSeeAll={() => console.log("See all clicked")} // Add your desired functionality here
            />
          </div>
        )}
      </div>
    );
  }

  const chatAreaMarginRight =
    isSideArtifactOpen && !isSideArtifactExpanded
      ? "mr-[80vw] sm:mr-[60vw] md:mr-[calc(100vw*7/12)] lg:mr-[50vw] xl:mr-[calc(100vw*5/12)]"
      : "";

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <div
        className={`flex h-full flex-grow flex-col transition-all duration-300 ease-in-out ${chatAreaMarginRight}`}
      >
        <div
          ref={chatContainerRef}
          className="flex-grow space-y-4 overflow-y-auto bg-gray-50 p-4 sm:p-6"
        >
          {chatMessages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onViewDetailsRequest={
                msg.role === "assistant" && msg.data && !msg.data.error
                  ? (data) =>
                      handleOpenSideArtifact(
                        data,
                        msg.id,
                        msg.data?.userQuery || lastUserQueryForPanel || "",
                      )
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
          <div className="[&>*]:focus-within:border-transparent [&>*]:focus-within:ring-0">
            <SegmentationForm
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              // Add an ID to the textarea inside SegmentationForm if not already present for focusing
            />
          </div>
        </div>
      </div>

      <SideArtifactPanel
        data={sideArtifactData}
        userQuery={lastUserQueryForPanel} // Pass the stored userQuery
        isOpen={isSideArtifactOpen}
        isExpanded={isSideArtifactExpanded}
        onClose={handleCloseSideArtifact}
        onToggleExpand={handleToggleSideArtifactExpand}
        onViewModeChange={handleArtifactViewModeChange}
      />
    </div>
  );
}
