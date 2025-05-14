"use client";

import type React from "react";
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  GlobeAltIcon,
  PaperClipIcon,
  MicrophoneIcon,
  ChevronUpIcon as ChevronUpIconSolid
} from '@heroicons/react/24/solid';

interface SegmentationFormProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent | string) => void;
  isLoading: boolean;
}

export default function SegmentationForm({
  inputValue,
  setInputValue,
  handleSubmit,
  isLoading,
}: SegmentationFormProps) {

  const internalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && inputValue.trim()) {
      handleSubmit(inputValue); 
    }
  };

  // Placeholder actions for the icon buttons
  const handleGlobeClick = () => console.log("Globe clicked - for future source selection");
  const handlePaperclipClick = () => console.log("Paperclip clicked - for future file attachment");
  const handleMicrophoneClick = () => console.log("Microphone clicked - for future voice input");

  // Enhanced search button functionality
  const handleSearchPrefix = () => {
    setInputValue(`Search: ${inputValue.startsWith("Search: ") || inputValue.startsWith("Research: ") ? inputValue.substring(inputValue.indexOf(":") + 2) : inputValue}`);
  };

  // Enhanced OTF Lead Generator button functionality
  // Directly opens the OTF form without requiring any input
  const handleResearchPrefix = () => {
    // Special trigger value to directly open the OTF form
    handleSubmit("OPEN_OTF_FORM");
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <form onSubmit={internalFormSubmit}>
        <textarea
          id="research-textarea"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What would you like to know about Orange Theory leads?"
          className="
            w-full p-4 text-base sm:text-lg text-gray-800 placeholder-gray-500 
            bg-transparent border-none focus:ring-0 resize-none 
            transition-colors duration-150 ease-in-out
          "
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isLoading && inputValue.trim()) {
                handleSubmit(inputValue);
              }
            }
          }}
          disabled={isLoading}
          aria-label="Describe what you'd like to know about Orange Theory leads"
        />
        
        <div className="flex justify-between items-center px-3 py-2.5 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSearchPrefix}
              disabled={isLoading}
              className="
                flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 
                rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500
                disabled:opacity-60 disabled:cursor-not-allowed transition-colors
              "
            >
              <MagnifyingGlassIcon className="w-4 h-4 mr-1.5" />
              Search
            </button>
            <button
              type="button"
              onClick={handleResearchPrefix}
              disabled={isLoading}
              className="
                flex items-center px-3 py-1.5 text-sm font-medium text-orange-700 bg-white
                border border-orange-500 rounded-lg hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500
                disabled:opacity-60 disabled:cursor-not-allowed transition-colors
              "
            >
              <SparklesIcon className="w-4 h-4 mr-1.5" />
              Lead Generator
            </button>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {[
              { icon: GlobeAltIcon, action: handleGlobeClick, label: "Select Source" },
              { icon: PaperClipIcon, action: handlePaperclipClick, label: "Attach File" },
              { icon: MicrophoneIcon, action: handleMicrophoneClick, label: "Voice Input" },
            ].map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={item.action}
                disabled={isLoading}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50 transition-colors"
                aria-label={item.label}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="
                p-2 bg-orange-500 text-white rounded-lg 
                hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1
                disabled:opacity-60 disabled:cursor-not-allowed transition-colors group
              "
              aria-label="Submit query"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ChevronUpIconSolid className="w-5 h-5 transform transition-transform" /> 
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}