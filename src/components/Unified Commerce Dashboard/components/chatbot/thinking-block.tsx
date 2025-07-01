"use client";

import { useState } from "react";
import type React from "react";

interface ThinkingBlockProps {
  content: string;
}

const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ content }) => {
  const lineLimit = 5;
  // Calculate line count based on newline characters
  const lineCount = (content.match(/\n/g) || []).length + 1;
  
  const needsAccordion = lineCount > lineLimit;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // The main container for the thinking block with shared styles
  const containerClasses = "my-2 p-3 border-l-4 border-neutral-400 bg-neutral-50 dark:bg-gray-800 dark:border-neutral-600 rounded-r-md";
  // The text style for the content itself
  const textClasses = "block text-sm italic text-gray-600 dark:text-gray-400 whitespace-pre-wrap";

  if (!needsAccordion) {
    // If it's short, just display it directly
    return (
      <div className={containerClasses}>
        <span className={textClasses}>{content}</span>
      </div>
    );
  }

  // If it's long, render the accordion (dropdown)
  return (
    <div className={containerClasses}>
      <button
        onClick={toggleExpansion}
        className="flex items-center w-full text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
        aria-expanded={isExpanded}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {isExpanded ? "Hide thought process" : "Show thought process..."}
      </button>
      {isExpanded && (
        <div className="mt-2 pl-6">
          <span className={textClasses}>{content}</span>
        </div>
      )}
    </div>
  );
};

export default ThinkingBlock;