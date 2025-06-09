"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import TypingIndicator from "./typing-indicator";
import { sendChatMessage } from "@/lib/actions-chatbot";

// --- Interfaces for a structured component ---
interface HelpTopic {
  title: string;
  question: string;
}

interface BrandConfig {
  name: string;
  logoUrl: string;
  agentAvatars: string[];
}

interface Message {
  role: "user" | "bot";
  content: string;
  suggestions?: HelpTopic[]; // To hold the clickable suggestions
}

interface ChatBotProps {
  // Config for the new UI elements
  brandConfig: BrandConfig;
  welcomeMessage: { title: string; subtitle: string };
  helpTopics: HelpTopic[];

  // Core chat functionality props
  model: string;
  maxTokens: number;
  botName: string;
  botAvatarUrl: string;
  userMessageClassName: string;
  botMessageClassName: string;
  inputPlaceholder: string;
  sendButtonClassName: string;
  applicationUrl?: string;
  
  onError?: (error: any) => void;
  onMessageSent?: (message: string) => void;
}


const ChatBot: React.FC<ChatBotProps> = ({
  brandConfig,
  welcomeMessage,
  helpTopics,
  model,
  maxTokens,
  botName,
  botAvatarUrl,
  userMessageClassName,
  botMessageClassName,
  inputPlaceholder,
  sendButtonClassName,
  applicationUrl,
  onError,
  onMessageSent,
}) => {
  // Initialize state with the welcome message and suggestions
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: welcomeMessage.subtitle,
      suggestions: helpTopics,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const userInputText = (messageText || input).trim();
    if (!userInputText || isLoading) return;

    // Clear suggestions from previous messages before adding a new one
    const historyWithoutSuggestions = messages.map(({ suggestions, ...rest }) => rest);
    const userMessage: Message = { role: "user", content: userInputText };

    setMessages([
      ...historyWithoutSuggestions,
      userMessage,
      { role: "bot", content: "" }, // Placeholder for bot response
    ]);
    
    setInput("");
    setIsLoading(true);
    
    const messagesForApi = [...historyWithoutSuggestions, userMessage].map((msg) => ({
      role: msg.role === "bot" ? ("assistant" as const) : ("user" as const),
      content: msg.content,
    }));

    try {
      let accumulatedBotResponse = "";
      const streamHandler = (chunk: string) => {
        accumulatedBotResponse += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1].content = accumulatedBotResponse;
          }
          return updated;
        });
      };
      
      const fullResponse = await sendChatMessage(messagesForApi, model, maxTokens, streamHandler);
      
      setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1].content = fullResponse;
          }
          return updated;
        });

      onMessageSent?.(userInputText);
    } catch (error) {
      console.error("Failed to send message:", error);
      onError?.(error);
      const errorMsg = error instanceof Error ? error.message : "Error: Failed to get response.";
      setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1].content = errorMsg;
          }
          return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
		<div className="flex flex-col h-full bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden">
		{/* --- Permanent Header --- */}
		<div className="p-4 bg-gradient-to-r from-[#3cb878] to-[#1f3b64] text-white shadow-md z-10">
			<div className="flex justify-between items-center">
				{/* The brand logo, now larger and without the text name */}
				<img src={brandConfig.logoUrl} alt={`${brandConfig.name} Logo`} className="h-10"/>
				
				{/* <div className="flex -space-x-2">
					{brandConfig.agentAvatars.map((avatar, index) => (
						<img key={index} src={avatar} alt={`Agent ${index + 1}`} className="w-8 h-8 rounded-full border-2 border-white/50"/>
					))}
				</div> */}
			</div>
	
        <h1 className="text-2xl font-bold">{welcomeMessage.title} 👋</h1>
      </div>
		

      {/* --- Scrollable Chat Area --- */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow ${
                message.role === 'user'
                  ? userMessageClassName || 'bg-blue-500 text-white'
                  : botMessageClassName || 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
              {message.role === 'bot' && (
                <div className="flex items-center mb-2">
                  <img src={botAvatarUrl} alt={botName} className="w-6 h-6 rounded-full mr-2 object-contain"/>
                  <span className="text-sm font-semibold">{botName}</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

              {/* Render Suggestion Buttons */}
              {message.suggestions && (
                <div className="mt-3 border-t border-gray-300 dark:border-gray-600 pt-3 space-y-2">
                  {message.suggestions.map((topic) => (
                    <button
                      key={topic.title}
                      onClick={() => handleSendMessage(topic.question)}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <TypingIndicator />}
      </div>
      
      {/* --- Permanent Footer with Input --- */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {applicationUrl && (
            <a href={applicationUrl} target="_blank" rel="noopener noreferrer"
               className="w-full flex items-center justify-center px-4 py-2 mb-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
              Start Application
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </a>
        )}
        <div className="flex rounded-md shadow-sm">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={inputPlaceholder || "Type your message..."}
            className="shadow-sm focus:ring-3cb878 focus:border-sky-500 block w-full min-w-0 flex-1 border border-gray-300 dark:border-gray-600 rounded-none rounded-l-md sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white ${sendButtonClassName || "bg-sky-600 hover:bg-sky-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50`}
            disabled={isLoading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;