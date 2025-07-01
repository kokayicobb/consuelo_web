//src/components/Unified Commerce Dashboard/components/chatbot/index.tsx
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import TypingIndicator from "./typing-indicator";
import SchedulingButtons from "./cal-com/scheduling-buttons";
import { sendChatMessage } from "@/components/Unified Commerce Dashboard/lib/actions/chatbot-actions";
import { MarkdownContent } from "@/components/ui/markdown-content"
import ThinkingBlock from "./thinking-block";

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
  suggestions?: HelpTopic[];
  schedulingData?: {
    availableSlots: Array<{ time: string }>;
    showScheduling: boolean;
  };
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
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true); 
 
  // AROUND LINE 95
const scrollToBottom = () => {
  chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
  });
};

// --- ADD THIS FUNCTION ---
const scrollToTop = () => {
  chatContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
  });
};

  // REPLACE the existing useEffect with this one
  useEffect(() => {
    // Only perform auto-scroll if there's more than one message (i.e., not the initial load)
    if (messages.length > 1 && chatContainerRef.current && isAtBottomRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
}, [messages]);

  // Place this helper function right above your ChatBot component definition
const parseMessageContent = (text: string): React.ReactNode[] => {
  if (!text) return [];
  // Regex to find <think>...</think> blocks non-greedily
  const regex = /<think>(.*?)<\/think>/gs;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // 1. Add the text *before* the <think> block
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // 2. Add the ThinkingBlock component with the content inside the tags
    parts.push(<ThinkingBlock content={match[1].trim()} />);
    
    lastIndex = regex.lastIndex;
  }

  // 3. Add any remaining text *after* the last <think> block
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};

  // Function to fetch available time slots from Cal.com
  
const fetchAvailableSlots = async () => {
  try {
    console.log("Fetching available slots from API...")
    
    const response = await fetch('/api/calcom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_available_times' })
    });

    console.log("API Response status:", response.status)
    
    const data = await response.json();
    console.log("API Response data:", data)
    
    if (data.success) {
      console.log("Available slots received:", data.availableSlots)
      console.log("Total slots:", data.totalSlots || data.availableSlots?.length)
      
      // Log first few slots for debugging
      if (data.availableSlots && data.availableSlots.length > 0) {
        console.log("First slot:", data.availableSlots[0])
        console.log("First slot time value:", data.availableSlots[0].time)
        console.log("Is valid date?", !isNaN(new Date(data.availableSlots[0].time).getTime()))
      }
      
      return data.availableSlots || [];
    } else {
      console.error('Error fetching slots:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return [];
  }
};

  // Function to handle booking meeting button click
  const handleBookMeetingClick = async () => {
    try {
      const slots = await fetchAvailableSlots();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Great! I'd be happy to help you schedule a consultation with one of our funding experts. Here are the available time slots:",
          schedulingData: {
            availableSlots: slots,
            showScheduling: true,
          }
        }
      ]);
    } catch (error) {
      console.error("Error fetching scheduling:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I'm having trouble fetching available time slots right now. Please try again later or contact us directly."
        }
      ]);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const userInputText = (messageText || input).trim();
    if (!userInputText || isLoading) return;
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isScrolledToBottom =
        chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 20;
      isAtBottomRef.current = isScrolledToBottom;
    }
    // --- END BLOCK ---

 

    // Clear suggestions from previous messages before adding a new one
    const historyWithoutSuggestions = messages.map(({ suggestions, schedulingData, ...rest }) => rest);
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

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookingSubmit = async (bookingData: any) => {
    setIsBooking(true);
    try {
      const response = await fetch("/api/calcom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'create_booking',
          ...bookingData
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: `🎉 Perfect! Your consultation has been successfully scheduled. ${result.message} Our funding expert will reach out to you before the scheduled time to confirm all the details and discuss your business financing needs.`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: `I apologize, but there was an issue booking your consultation: ${result.error}. Please try again or contact us directly.`,
          },
        ]);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "I apologize, but there was a technical issue with booking. Please try again or contact us directly.",
        },
      ]);
    } finally {
      setIsBooking(false);
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
           {/* --- NEW REPLACEMENT --- */}
           {message.role === 'bot' ? (
                <div>
                  {parseMessageContent(message.content).map((part, i) => {
                    // If the part is just a string, render it with Markdown
                    if (typeof part === 'string') {
                      return (
                        <div key={i} className="prose prose-sm dark:prose-invert max-w-none">
                          <MarkdownContent content={part} id={`bot-msg-${index}-part-${i}`} />
                        </div>
                      );
                    }
                    // Otherwise, it's our ThinkingBlock component, so just render it
                    return <div key={i}>{part}</div>;
                  })}
                </div>
              ) : (
                // User messages are still plain text
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )}

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

              {/* Render Scheduling Buttons */}
              {message.schedulingData?.showScheduling && (
                <div className="mt-3 border-t border-gray-300 dark:border-gray-600 pt-3">
                  <SchedulingButtons
                    availableSlots={message.schedulingData.availableSlots}
                    onTimeSelect={handleTimeSelect}
                    onBookingSubmit={handleBookingSubmit}
                    selectedTime={selectedTime}
                    isLoading={isBooking}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <TypingIndicator />}
       {/* --- THIS IS THE NEW, UPDATED BLOCK --- */}
{/* Conditionally render the buttons only after the conversation has started */}
{messages.length > 1 && (
    <div className="absolute bottom-[10rem] right-2 md:right-4 z-20 flex flex-col space-y-2">
        {/* Scroll to Top Button (no changes inside) */}
        <button
            onClick={scrollToTop}
            className="flex h-16 w-6 items-center justify-center rounded-full bg-neutral-600/75 text-white shadow-lg transition-colors hover:bg-neutral-700 "
            aria-label="Scroll to top"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v17" />
            </svg>
        </button>
        {/* Scroll to Bottom Button (no changes inside) */}
        <button
            onClick={scrollToBottom}
            className="flex h-16 w-6 items-center justify-center rounded-full bg-neutral-600/75 text-white shadow-lg transition-colors hover:bg-neutral-700 "
            aria-label="Scroll to bottom"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </button>
    </div>
)}
      </div>
      
      {/* --- Permanent Footer with Input --- */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {/* Action Buttons */}
        <div className="flex space-x-2 mb-3">
          {applicationUrl && (
            <a href={applicationUrl} target="_blank" rel="noopener noreferrer"
               className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
              Application
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </a>
          )}
          <button
            onClick={handleBookMeetingClick}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3cb878] hover:bg-[#2ea660] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3cb878] transition-colors">
            Book Meeting
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="relative w-full">
  <textarea
    rows={1}
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyPress={handleKeyPress}
    placeholder={inputPlaceholder || "Type your message..."}
    // Key Changes:
    // 1. Fully rounded corners to contain the button visually.
    // 2. Padding on the right (pr-12) to make space for the button.
    className="block w-full rounded-md border-gray-300 dark:border-gray-600 p-2 pr-12 shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
    disabled={isLoading}
  />
  <button
    onClick={() => handleSendMessage()}
    // Key Changes:
    // 1. 'absolute' positioning to place it inside the textarea's container.
    // 2. 'right-2 top-1/2 -translate-y-1/2' to center it vertically on the right.
    // 3. Smaller size (h-8 w-8) and circular shape (rounded-full).
    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
    disabled={isLoading}
  >
    <span className="sr-only">Send</span>
    {/* The basic right-arrow icon from your example, sized down */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
     
      <path // I've combined the two paths from your example into one SVG
        fillRule="evenodd"
        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;