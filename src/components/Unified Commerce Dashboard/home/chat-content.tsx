"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

import {
  generateQuery,
  runGeneratedSQLQuery,
  generateChartConfig,
  explainQuery,
  generateActionSuggestions,
} from "@/lib/actions";

import { ChatMessage, ChatMessageData } from "@/types/chats"; // Using your specified path
import { SegmentationForm, ExampleQueries } from "../segmentation"; // Using your specified path
import ChatMessageItem from "./components/chat-message-item"; // Using your specified path
import SideArtifactPanel from "./components/side.panel"; // Using your specified path


const EXAMPLE_QUERIES = [
  {
    name: "🚀 Member Engagement & Retention",
    description: "Keep your members active, identify churn risks, and celebrate milestones.",
    queries: [
      { text: "Show me clients who haven't attended a class in 30 days but still have an active membership." },
      { text: "Identify members at high risk of churning based on recent activity." },
      { text: "List members with upcoming birthdays this month who we should contact." },
      { text: "Show me clients who are approaching a class milestone (e.g., 50th, 100th class)." },
      { text: "Find members whose engagement score has dropped significantly last month." },
      { text: "List members celebrating a membership anniversary in the next 30 days." }
    ],
  },
  {
    name: "🎯 Lead Management & New Member Onboarding",
    description: "Convert prospects effectively and welcome new members smoothly.",
    queries: [
      { text: "Show me clients who signed up recently but haven't attended a class yet." },
      { text: "List new leads from 'Website Trial Form' in the last 7 days." },
      { text: "Identify trial class attendees from last week who haven't purchased a membership." },
      { text: "Find leads who expressed interest in 'Yoga' but haven't booked a consultation." },
    ],
  },
  {
    name: "💳 Membership & Package Insights",
    description: "Manage memberships, renewals, and identify upsell opportunities.",
    queries: [
      { text: "Find members whose membership is expiring in the next 14 days." },
      { text: "List clients on a '10-Class Pass' with 2 or fewer credits remaining." },
      { text: "Show members whose auto-renewal payment failed this month." },
      { text: "Identify members eligible for an upgrade to a premium membership." }
    ],
  },
  {
    name: "📊 Class & Instructor Performance",
    description: "Analyze attendance, class popularity, and instructor effectiveness.",
    queries: [
      { text: "Which coach has the highest attendance rate this month?" },
      { text: "Find clients who attended class with coach Kokayi in the past month." },
      { text: "What were the most popular class types last quarter?" },
      { text: "Show me classes with consistently low attendance for potential rescheduling." },
      { text: "Compare attendance for 'Morning Yoga' vs 'Evening Yoga' last month."}
    ],
  },
  {
    name: "💡 Operational & Communication Segments",
    description: "Create targeted lists for specific actions and communications.",
    queries: [
      { text: "Show me clients who had late cancellations in the last 30 days." },
      { text: "Generate a list of members who haven't opened our last three newsletters." },
      { text: "Find clients who live in the 'Downtown' area and prefer evening classes." },
      { text: "List all members who have provided positive feedback via post-class surveys."}
    ],
  },
];

export default function ChatContent() {
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInChatMode, setIsInChatMode] = useState(false);

  const [sideArtifactData, setSideArtifactData] = useState<ChatMessageData | null>(null);
  const [currentMessageIdForPanel, setCurrentMessageIdForPanel] = useState<string | null>(null); // To track which message's data is in panel
  const [isSideArtifactOpen, setIsSideArtifactOpen] = useState(false);
  const [isSideArtifactExpanded, setIsSideArtifactExpanded] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInChatMode && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isInChatMode]);

  // Modified addMessage to return the full message object
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const newMessage = { ...message, id: uuidv4(), timestamp: new Date() };
    setChatMessages(prev => [...prev, newMessage]);
    return newMessage; // Return the full message with ID and timestamp
  };

  const handleOpenSideArtifact = (data: ChatMessageData, messageId: string) => {
    setSideArtifactData(data);
    setCurrentMessageIdForPanel(messageId); // Track which message's data is open
    setIsSideArtifactOpen(true);
     // Ensure it's not expanded when newly opened, unless it was already expanded for this item
    if (sideArtifactData !== data) { // Only reset expansion if data is different
        setIsSideArtifactExpanded(false);
    }
  };

  const handleCloseSideArtifact = () => {
    setIsSideArtifactOpen(false);
    setCurrentMessageIdForPanel(null); // Clear tracker when panel is closed
    setIsSideArtifactExpanded(false); 
  };

  const handleToggleSideArtifactExpand = () => {
    setIsSideArtifactExpanded(prev => !prev);
  };
  
  const handleArtifactViewModeChange = (newMode: "table" | "chart" | "actions") => {
    setSideArtifactData(prevData => prevData ? { ...prevData, viewMode: newMode } : null);
  };

  const handleSubmit = async (userQuery: string) => {
    if (!userQuery.trim()) return;

    if (!isInChatMode) {
      setIsInChatMode(true);
      addMessage({ role: 'assistant', content: "Hello! I'm Consuelo. Let's find those clients for you." });
    }
    
    setTimeout(() => { addMessage({ role: 'user', content: userQuery }); }, 0);
    setInputValue(""); 
    setIsLoading(true);
    handleCloseSideArtifact(); // Close any existing panel when new query starts
    const tempResponseData: ChatMessageData = { viewMode: "cards" }; // Default to cards

    try {
      addMessage({ role: 'system', content: `Thinking about: "${userQuery}"...` });
      addMessage({ role: 'system', content: "1. Translating your request into a database query..."});
      tempResponseData.aiThoughts = `To answer "${userQuery}", I'm starting by formulating a precise database query.`;
      const generatedSql = await generateQuery(userQuery);
      tempResponseData.sqlQuery = generatedSql;
      addMessage({ role: 'system', content: "   - SQL Generated." });
      
      addMessage({ role: 'system', content: "2. Running the query against the database..."});
      let results = await runGeneratedSQLQuery(generatedSql);
      addMessage({ role: 'system', content: "   - Query Executed." });

      if (results && results.length > 0) {
        if (typeof results[0] === "string" && (results[0].startsWith("{") || results[0].startsWith("["))) {
          results = results.map((item) => { try { return JSON.parse(item); } catch { return item; } });
        }
        tempResponseData.queryResults = results;
        const firstResult = results[0];
        tempResponseData.columns = typeof firstResult === "object" && firstResult !== null ? Object.keys(firstResult) : ["value"];
        addMessage({ role: 'system', content: "3. Analyzing results and preparing visualizations/actions..."});
        tempResponseData.isLoadingChart = true; tempResponseData.isLoadingActions = true;

        try {
          const [chartResult, actionResult, explanationResult] = await Promise.allSettled([
            generateChartConfig(results, userQuery),
            generateActionSuggestions(results, userQuery),
            explainQuery(userQuery, generatedSql)
          ]);
          if (chartResult.status === "fulfilled") tempResponseData.chartConfig = chartResult.value;
          if (actionResult.status === "fulfilled") tempResponseData.actionSuggestions = actionResult.value;
          if (explanationResult.status === "fulfilled") tempResponseData.explanations = explanationResult.value;
        } catch (vizError) { 
          console.error("Viz/Action/Explanation error:", vizError);
          addMessage({role: 'system', content: "Error during result analysis."});
        } finally {
          tempResponseData.isLoadingChart = false; tempResponseData.isLoadingActions = false;
        }
        addMessage({ role: 'system', content: "   - Analysis Complete." });
      } else {
        tempResponseData.queryResults = []; tempResponseData.columns = [];
        addMessage({role: 'system', content: "No specific data found, but here's the SQL I tried:"});
      }
      
      // Capture the full message object returned by addMessage
      const finalAssistantMessage = addMessage({
        role: 'assistant',
        content: `I've processed your request for "${userQuery}".`,
        data: { ...tempResponseData } 
      });

      // Automatically open side panel for this new assistant message
      if (finalAssistantMessage.data && !finalAssistantMessage.data.error) {
        handleOpenSideArtifact(finalAssistantMessage.data, finalAssistantMessage.id); // Pass message ID
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred";
      addMessage({ role: 'system', content: `Error: ${errorMsg}`});
      addMessage({
        role: 'assistant',
        content: "I encountered an issue processing your request.",
        data: { error: errorMsg }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleQuerySelection = (query: string) => {
    const prefixedQuery = `Search: ${query}`;
    setInputValue(prefixedQuery);
    const targetTextareaId = isInChatMode ? '#chat-input-form textarea' : '#research-textarea';
    // Ensure the element exists before trying to focus
    const targetTextarea = document.querySelector<HTMLTextAreaElement>(targetTextareaId);
    targetTextarea?.focus();
  };

  if (!isInChatMode) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-white text-gray-900 px-4 py-10 sm:py-16">
        <main className="w-full max-w-3xl flex flex-col items-center space-y-10 sm:space-y-12">
          <header className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
              Who would you like to contact?
            </h1>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg text-gray-600 max-w-xl">
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
              <div className="mb-4 w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-500 animate-spin"></div>
              <p className="text-gray-700 font-semibold text-lg">Processing your first query...</p>
            </div>
          )}
        </main>
      </div>
    );
  }
  
  // Adjusted main chat area width calculation when panel is open and not expanded
  const chatAreaMarginRight = isSideArtifactOpen && !isSideArtifactExpanded 
    ? 'mr-[80vw] sm:mr-[60vw] md:mr-[calc(100vw*7/12)] lg:mr-[50vw] xl:mr-[calc(100vw*5/12)]' 
    : '';

  return (
    <div className="relative flex w-full h-screen overflow-hidden">
        {/* Main Chat Area */}
        <div className={`flex flex-col flex-grow h-full transition-all duration-300 ease-in-out ${chatAreaMarginRight}`}>
            {/* <header className="py-3 px-4 sm:px-6 bg-white border-b border-gray-200 text-center sticky top-0 z-20">
                <h1 className="text-xl font-semibold text-gray-800">Consuelo AI Chat</h1>
            </header> */}
            <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50">
                {chatMessages.map((msg) => (
                <ChatMessageItem 
                    key={msg.id} 
                    message={msg}
                    // Pass correct handlers to ChatMessageItem
                    onViewDetailsRequest={msg.role === 'assistant' && msg.data && !msg.data.error ? (data) => handleOpenSideArtifact(data, msg.id) : undefined}
                    onClosePanelRequest={isSideArtifactOpen && currentMessageIdForPanel === msg.id ? handleCloseSideArtifact : undefined}
                    isDisplayedInPanel={isSideArtifactOpen && currentMessageIdForPanel === msg.id}
                />
                ))}
            </div>
            <div id="chat-input-form" className="sticky bottom-0 bg-white border-t border-gray-200 p-3 sm:p-4 z-20">
                <SegmentationForm
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
                />
            </div>
        </div>

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
}
