"use client";

import React, { useState, useRef, useEffect } from "react";

import { XCircle, MinusCircle, ChevronUp } from "lucide-react";

import SegmentationForm from "./segmentation-form";

import RedditSearch from "../apps/app-views/social-search/reddit";

const ChatWithOTFAgent = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hi! I can help you with market research and lead generation for Orange Theory Fitness. What would you like to know?",
    },
  ]);
  const [showOTFForm, setShowOTFForm] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (formInput) => {
    if (!formInput.trim()) return;

    setIsLoading(true);

    // Add user message
    const userMessage = { id: Date.now(), type: "user", content: formInput };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // If the message starts with "Research:", trigger the OTF form
      if (formInput.trim().toLowerCase().startsWith("research:")) {
        setTimeout(() => {
          setShowOTFForm(true);
          setIsChatMinimized(true);

          // Add bot response (simulating sending the form)
          const botResponse = {
            id: Date.now() + 1,
            type: "bot",
            content:
              "I've opened our Orange Theory Fitness lead generation tool for you. Please configure your settings to find potential leads on Reddit.",
          };
          setMessages((prev) => [...prev, botResponse]);
          setInputValue("");
          setIsLoading(false);
        }, 1000); // Simulate API delay
      } else {
        // Handle normal queries (just echo for demo)
        setTimeout(() => {
          const botResponse = {
            id: Date.now() + 1,
            type: "bot",
            content: `I received your message: "${formInput}". For lead generation features, type a query starting with "Research:"`,
          };
          setMessages((prev) => [...prev, botResponse]);
          setInputValue("");
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setIsLoading(false);
    }
  };

  // Close OTF form and restore chat
  const handleCloseOTFForm = () => {
    setShowOTFForm(false);
    setIsChatMinimized(false);

    // Add a message acknowledging the close
    const botResponse = {
      id: Date.now(),
      type: "bot",
      content:
        "Let me know if you need anything else regarding Orange Theory Fitness lead generation.",
    };
    setMessages((prev) => [...prev, botResponse]);
  };

  // Toggle chat minimized state
  const toggleChatMinimize = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Main content area */}
      <div className="relative flex-1 overflow-auto p-4">
        {/* OTF Form (shown when Research is clicked) */}
        {showOTFForm && (
          <div className="relative overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="absolute right-4 top-4 z-10 flex gap-2">
              <button
                onClick={handleCloseOTFForm}
                className="p-1 text-gray-500 transition-colors hover:text-red-500"
              >
                <XCircle size={24} />
              </button>
            </div>
            <RedditSearch />
          </div>
        )}

        {/* Regular chat messages (shown when OTF form is not active) */}
        {!showOTFForm && (
          <div className="mx-auto max-w-3xl space-y-4 pt-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat input area - fixed at bottom when minimized */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isChatMinimized
            ? "fixed bottom-0 left-0 right-0 z-50 shadow-lg"
            : "relative"
        }`}
      >
        {isChatMinimized && (
          <div className="flex items-center justify-between bg-gray-800 p-2 text-white">
            <span className="font-medium">Chat with OTF Agent</span>
            <button
              onClick={toggleChatMinimize}
              className="rounded-full p-1 hover:bg-gray-700"
            >
              <ChevronUp size={20} />
            </button>
          </div>
        )}

        <div className={isChatMinimized && !showOTFForm ? "hidden" : "block"}>
          <SegmentationForm
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatWithOTFAgent;
