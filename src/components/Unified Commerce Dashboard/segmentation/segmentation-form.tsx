"use client"

import type React from "react"

import { Search } from "lucide-react"

interface SegmentationFormProps {
  inputValue: string
  setInputValue: (value: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  isLoading: boolean
}

export default function SegmentationForm({
  inputValue,
  setInputValue,
  handleSubmit,
  isLoading,
}: SegmentationFormProps) {
  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., Show me clients who haven't attended class in 30 days but still have active memberships"
            className="flex-1 p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md disabled:opacity-50 font-medium transition-colors"
        >
          {isLoading ? "Processing..." : "Segment"}
        </button>
      </div>
    </form>
  )
}
