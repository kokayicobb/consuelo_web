"use client";

import React, { useState, useRef, useEffect } from 'react';

import { XCircle, MinusCircle, ChevronUp } from 'lucide-react';
import OrangeSalesAgent from '../research';
import SegmentationForm from './segmentation-form';

const ChatWithOTFAgent = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: 'Hi! I can help you with market research and lead generation for Orange Theory Fitness. What would you like to know?' }
  ]);
  const [showOTFForm, setShowOTFForm] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (formInput) => {
    if (!formInput.trim()) return;
    
    setIsLoading(true);
    
    // Add user message
    const userMessage = { id: Date.now(), type: 'user', content: formInput };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // If the message starts with "Research:", trigger the OTF form
      if (formInput.trim().toLowerCase().startsWith('research:')) {
        setTimeout(() => {
          setShowOTFForm(true);
          setIsChatMinimized(true);
          
          // Add bot response (simulating sending the form)
          const botResponse = { 
            id: Date.now() + 1, 
            type: 'bot', 
            content: 'I\'ve opened our Orange Theory Fitness lead generation tool for you. Please configure your settings to find potential leads on Reddit.'
          };
          setMessages(prev => [...prev, botResponse]);
          setInputValue('');
          setIsLoading(false);
        }, 1000); // Simulate API delay
      } else {
        // Handle normal queries (just echo for demo)
        setTimeout(() => {
          const botResponse = { 
            id: Date.now() + 1, 
            type: 'bot', 
            content: `I received your message: "${formInput}". For lead generation features, type a query starting with "Research:"`
          };
          setMessages(prev => [...prev, botResponse]);
          setInputValue('');
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
      type: 'bot', 
      content: 'Let me know if you need anything else regarding Orange Theory Fitness lead generation.'
    };
    setMessages(prev => [...prev, botResponse]);
  };

  // Toggle chat minimized state
  const toggleChatMinimize = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Main content area */}
      <div className="flex-1 p-4 overflow-auto relative">
        {/* OTF Form (shown when Research is clicked) */}
        {showOTFForm && (
          <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button 
                onClick={handleCloseOTFForm} 
                className="p-1 text-gray-500 hover:text-red-500 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <OrangeSalesAgent />
          </div>
        )}
        
        {/* Regular chat messages (shown when OTF form is not active) */}
        {!showOTFForm && (
          <div className="max-w-3xl mx-auto space-y-4 pt-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
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
            ? 'fixed bottom-0 left-0 right-0 z-50 shadow-lg' 
            : 'relative'
        }`}
      >
        {isChatMinimized && (
          <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
            <span className="font-medium">Chat with OTF Agent</span>
            <button 
              onClick={toggleChatMinimize}
              className="p-1 hover:bg-gray-700 rounded-full"
            >
              <ChevronUp size={20} />
            </button>
          </div>
        )}
        
        <div className={isChatMinimized && !showOTFForm ? 'hidden' : 'block'}>
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