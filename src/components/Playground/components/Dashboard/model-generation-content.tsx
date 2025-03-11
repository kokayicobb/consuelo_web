"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function ModelGenerationContent() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const modelTemplates = [
    "/placeholder.svg?height=400&width=300",
    "/placeholder.svg?height=400&width=300",
    "/placeholder.svg?height=400&width=300",
    "/placeholder.svg?height=400&width=300",
    "/placeholder.svg?height=400&width=300",
    "/placeholder.svg?height=400&width=300",
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-500">
          MODEL TEMPLATES
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {modelTemplates.map((src, index) => (
            <div
              key={index}
              className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                src={src || "/placeholder.svg"}
                alt={`Model template ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-500">PROMPT</h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your AI model's appearance (e.g., clothing, pose, background)."
          className="h-32 w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className={`mt-4 flex w-full items-center justify-center rounded-lg py-3 font-medium ${
            !prompt.trim() || isGenerating
              ? "cursor-not-allowed bg-gray-200 text-gray-500"
              : "bg-yellow-400 text-black hover:bg-yellow-500"
          }`}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {isGenerating ? "Generating AI Model..." : "Generate AI Model (~5s)"}
        </button>
      </div>
    </div>
  );
}
