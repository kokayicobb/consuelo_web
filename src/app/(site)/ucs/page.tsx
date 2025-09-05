"use client";

import React, { useRef } from 'react';
import { ExpandableChat } from '@/components/ui/expandable-chat';
import ChatBot from '@/components/Unified Commerce Dashboard/components/chatbot';

export default function UCSPage() {
  const chatRef = useRef(null);

  const unitedCapitalSourceConfig = {
    name: "United Capital Source",
    logoUrl: "/chatbot/unitedcap.webp",
    agentAvatars: ["/path/to/agent1.jpg", "/path/to/agent2.jpg"],
  };

  const ucsWelcomeMessage = {
    title: "Hi there",
    subtitle: "How can we help your business grow?",
  };

  const ucsHelpTopics = [
    {
      title: "What types of loans do you offer?",
      question: "What types of business loans do you offer?",
    },
    {
      title: "How long does the process take?",
      question: "How long does it take to get a loan?",
    },
    {
      title: "What documents do I need to apply?",
      question: "What documents do I need to prepare for a loan application?",
    },
    {
      title: "Am I eligible with my credit score?",
      question: "I'm worried about my credit score. Can I still get a loan?",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white">
        <div className="flex items-center space-x-4 sm:space-x-8">
          <img 
            src="/chatbot/unitedcap.webp" 
            alt="United Capital Source Logo" 
            className="h-8 sm:h-10"
          />
          <nav className="hidden lg:flex space-x-8">
            <button className="text-gray-700 hover:text-gray-900">Business Loans</button>
            <button className="text-gray-700 hover:text-gray-900">Industries</button>
            <button className="text-gray-700 hover:text-gray-900">About Us</button>
            <button className="text-gray-700 hover:text-gray-900">Resources</button>
          </nav>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:block text-xs sm:text-sm text-gray-600">
            <span className="text-emerald-500">Se habla</span><br />
            <span>Espanol</span>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-6 py-2 rounded-full text-sm sm:font-medium">
            APPLY NOW
          </button>
          <div className="hidden md:block text-sm text-gray-600">
            <div>Free Consultation</div>
            <div className="font-medium">1 (855) 933-8638</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-80px)] flex items-center">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center lg:justify-between">
          {/* Left Content */}
          <div className="flex-1 max-w-xl text-center lg:text-left mb-8 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-4 sm:mb-6">
              Get your business funded with United Capital Source.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
              Quick & easy access to funds to help you take that next step today.
            </p>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium mb-3 sm:mb-4">
              APPLY NOW
            </button>
            <p className="text-gray-500 text-sm">Free Consultation - No Obligation</p>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8 mt-8 sm:mt-12">
              <div className="flex items-center space-x-2">
                <img 
                  src="/chatbot/company-icon/Google Icon United Capital Source.png" 
                  alt="Google Rating" 
                  className="w-14 h-14 sm:w-16 sm:h-16"
                />
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-700">5 Star Rating</div>
                  <div className="text-xs sm:text-sm text-gray-500">on Google</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <img 
                  src="/chatbot/company-icon/United Capital Source Inc Logo.png" 
                  alt="Inc 5000" 
                  className="h-10 sm:h-12"
                />
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-700">2015 and 2017</div>
                  <div className="text-xs sm:text-sm text-gray-500">Honors</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <img 
                  src="/chatbot/company-icon/United Capital Source Logo 5 Star Rating.png" 
                  alt="BBB Rating" 
                  className="h-10 sm:h-12"
                />
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-700">BBB Accredited</div>
                  <div className="text-xs sm:text-sm text-gray-500">Business</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="flex-1 flex justify-center mt-8 lg:mt-0">
            <img 
              src="/chatbot/company-icon/GoDaddyStudioPage-0.png" 
              alt="Woman with tablet" 
              className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Bottom Stats Section */}
        <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-auto">
          <div className="bg-white rounded-lg p-2 sm:p-3 shadow-lg flex items-center space-x-2 sm:space-x-3 max-w-sm">
            <img 
              src="/chatbot/company-icon/Google Icon United Capital Source.png" 
              alt="Google" 
              className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"
            />
            <div className="flex text-yellow-400">
              <span className="text-sm sm:text-lg">★</span>
              <span className="text-sm sm:text-lg">★</span>
              <span className="text-sm sm:text-lg">★</span>
              <span className="text-sm sm:text-lg">★</span>
              <span className="text-sm sm:text-lg">★</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-medium text-gray-700 truncate">5 Star Rating by Allen C B</div>
              <div className="text-xs sm:text-sm text-gray-500">03/05/25</div>
            </div>
          </div>
        </div>

        {/* Bottom Right Stats
        <div className="absolute bottom-8 right-8">
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-800 mb-2">$1.3 billion funded to small businesses</div>
            <div className="text-xl text-gray-600">through our network</div>
          </div>
        </div> */}

        {/* Chat Component */}
        <div ref={chatRef}>
          <ExpandableChat position="bottom-right" size="lg">
            <ChatBot
              brandConfig={unitedCapitalSourceConfig}
              welcomeMessage={ucsWelcomeMessage}
              helpTopics={ucsHelpTopics}
              model="Qwen/Qwen3-32B"
              maxTokens={1024}
              botName="United Capital Source Advisor"
              botAvatarUrl="/chatbot/uniteccap_icon.webp"
              applicationUrl="https://www.unitedcapitalsource.com/small-business-loans/"
              userMessageClassName={""}
              botMessageClassName={""}
              inputPlaceholder={""}
              sendButtonClassName={""}
            />
          </ExpandableChat>
        </div>
      </div>
    </div>
  );
}