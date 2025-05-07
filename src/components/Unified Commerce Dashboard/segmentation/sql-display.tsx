"use client"

import type { QueryExplanation } from "@/types/otf"
import { Clipboard } from "lucide-react"
import { useState } from "react"

interface SqlDisplayProps {
  sqlQuery: string
  explanations: QueryExplanation[]
  isExplaining: boolean
  onExplain: () => Promise<void>
}

export default function SqlDisplay({ sqlQuery, explanations, isExplaining, onExplain }: SqlDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlQuery)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Generated SQL</h2>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center gap-1"
          >
            <Clipboard size={14} />
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={onExplain}
            disabled={isExplaining}
            className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md"
          >
            {isExplaining ? "Explaining..." : "Explain SQL"}
          </button>
        </div>
      </div>
      <div className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
        <pre className="whitespace-pre-wrap">{sqlQuery}</pre>
      </div>

      {/* SQL Explanation */}
      {explanations.length > 0 && (
        <div className="mt-4 bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">SQL Explanation</h3>
          {explanations.map((exp, i) => (
            <div key={i} className="mb-3">
              <p className="font-medium text-blue-700">{exp.section}</p>
              <p className="text-gray-700">{exp.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
