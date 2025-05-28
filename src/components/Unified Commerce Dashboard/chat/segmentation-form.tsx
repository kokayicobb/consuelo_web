"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  GlobeAltIcon,
  PaperClipIcon,
  MicrophoneIcon,
  ChevronUpIcon as ChevronUpIconSolid,
} from "@heroicons/react/24/solid";

import { cn } from "@/lib/utils"; // Make sure this path is correct for your project

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationState, setAnimationState] = useState<"idle" | "animating">(
    "idle",
  );
  const [isFocused, setIsFocused] = useState(false);

  const placeholders = [
    "What would you like to know about Orange Theory leads?",
    "Show me clients who haven't attended a class in 30 days...",
    "Identify members at high risk of churning...",
    "List new leads from 'Website Trial Form'...",
    "Which coach has the highest attendance rate this month?",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (animationState === "idle" && !inputValue && !isFocused) {
        setAnimationState("animating");
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % placeholders.length);
          setAnimationState("idle");
        }, 1000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [animationState, placeholders.length, inputValue, isFocused]);

  const internalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && inputValue.trim()) {
      handleSubmit(inputValue);
    }
  };

  const handleGlobeClick = () =>
    console.log("Globe clicked - for future source selection");
  const handlePaperclipClick = () =>
    console.log("Paperclip clicked - for future file attachment");
  const handleMicrophoneClick = () =>
    console.log("Microphone clicked - for future voice input");

  const handleSearchPrefix = () => {
    setInputValue(
      `Search: ${inputValue.startsWith("Search: ") || inputValue.startsWith("Research: ") ? inputValue.substring(inputValue.indexOf(":") + 2) : inputValue}`,
    );
  };

  const handleResearchPrefix = () => {
    handleSubmit("OPEN_OTF_FORM");
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white",
        "shadow-[0_0_15px_rgba(0,0,0,0.05)]",
        isFocused
          ? "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
          : "hover:shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_8px_rgba(0,0,0,0.05)]",
      )}
    >
      <form onSubmit={internalFormSubmit}>
        <div className="relative min-h-[80px] w-full px-4 py-4">
          <textarea
            id="research-textarea"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            // --- CRITICAL CHANGE HERE ---
            // Provide a native placeholder attribute to the textarea
            placeholder={inputValue ? "" : placeholders[currentIndex]}
            // Remove 'placeholder-transparent' if you want the native placeholder to be visible
            // If you want the animation to fully control visibility, keep 'placeholder-transparent'
            // and rely on the extension detecting the *presence* of the attribute.
            className="
              // // Consider removing this if
              you want native placeholder to show min-h-[80px] w-full resize-none bg-transparent text-gray-800 placeholder-transparent outline-none
              transition-colors duration-150 ease-in-out
            "
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && inputValue.trim()) {
                  handleSubmit(inputValue);
                }
              }
            }}
            disabled={isLoading}
            aria-label="Describe what you'd like to know about Orange Theory leads"
          />

          {/* Placeholder Animation - Now only renders if inputValue is empty AND textarea is not focused */}
          {!inputValue &&
            !isFocused && ( // Added !isFocused to prevent animation during user input
              <div className="pointer-events-none absolute inset-0 px-4 py-4 text-gray-500">
                <div className="relative h-full">
                  <motion.div
                    key={`current-${currentIndex}`}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{
                      y: animationState === "animating" ? -20 : 0,
                      opacity: animationState === "animating" ? 0 : 1,
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    {placeholders[currentIndex]}
                  </motion.div>

                  <motion.div
                    key={`next-${currentIndex}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: animationState === "animating" ? 0 : 20,
                      opacity: animationState === "animating" ? 1 : 0,
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    {placeholders[(currentIndex + 1) % placeholders.length]}
                  </motion.div>
                </div>
              </div>
            )}

          {/* Buttons at the bottom right of the textarea area */}
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={handlePaperclipClick}
              disabled={isLoading}
              className="
                      rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100
                      hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50
                  "
              aria-label="Attach File"
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleMicrophoneClick}
              disabled={isLoading}
              className="
                      rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100
                      hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50
                  "
              aria-label="Voice Input"
            >
              <MicrophoneIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleGlobeClick}
              disabled={isLoading}
              className="
                      rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100
                      hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50
                  "
              aria-label="Select Source"
            >
              <GlobeAltIcon className="h-5 w-5" />
            </button>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="
   rounded-lg bg-sky-500 p-2 text-white transition-colors hover:bg-sky-600 focus:outline-none
    focus:ring-2
    focus:ring-sky-500
    focus:ring-offset-1
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
              aria-label="Submit query"
            >
              {isLoading ? (
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                // The ChevronUpIconSolid component automatically inherits 'currentColor'
                // from its parent, which is 'text-white' on the button.
                <ChevronUpIconSolid className="h-5 w-5 transform transition-transform" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2.5">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSearchPrefix}
              disabled={isLoading}
              className="
                  flex items-center rounded-lg border border-gray-300 bg-white
                  px-3 py-1.5
                  text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500
                  disabled:cursor-not-allowed disabled:opacity-60
                "
            >
              <MagnifyingGlassIcon className="mr-1.5 h-4 w-4" />
              Search
            </button>
            <button
              type="button"
              onClick={handleResearchPrefix}
              disabled={isLoading}
              className="
                  flex items-center rounded-lg border border-sky-500 bg-sky-500
                  px-3 py-1.5
                  text-sm font-medium text-white transition-colors hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500
                  disabled:cursor-not-allowed disabled:opacity-60
                "
            >
              <SparklesIcon className="mr-1.5 h-4 w-4" />
              Lead Generator
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

