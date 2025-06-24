"use client"

import { createPlatePlugin } from "platejs/react"
import { Card, CardContent } from "@/components/ui/card"
import { Bot } from "lucide-react"

export const AIResponsePlugin = createPlatePlugin({
  key: "ai-response",
  node: {
    isElement: true,
    isVoid: false,
  },
})

export function AIResponseElement({ children, ...props }: any) {
  return (
    <Card className="my-4 bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-800 mb-2">AI Assistant</div>
            <div {...props.attributes}>{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Register the component
AIResponsePlugin.withComponent(AIResponseElement)
