"use client"

import { CheckCircle, Clock, Mail, Phone, Calendar, Users, AlertTriangle } from "lucide-react"

interface ActionSuggestionsProps {
  actions: {
    title: string
    description: string
    priority: "high" | "medium" | "low"
    icon?: string
    clientCount?: number
  }[]
  summary: string
}

export default function ActionSuggestions({ actions, summary }: ActionSuggestionsProps) {
  // Map icon strings to Lucide icons
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "mail":
        return <Mail className="h-5 w-5" />
      case "phone":
        return <Phone className="h-5 w-5" />
      case "calendar":
        return <Calendar className="h-5 w-5" />
      case "users":
        return <Users className="h-5 w-5" />
      case "alert":
        return <AlertTriangle className="h-5 w-5" />
      case "clock":
        return <Clock className="h-5 w-5" />
      default:
        return <CheckCircle className="h-5 w-5" />
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {summary && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2">Summary</h3>
          <p className="text-gray-700">{summary}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full">{getIcon(action.icon)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(action.priority)}`}>
                    {action.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{action.description}</p>
                {action.clientCount && (
                  <p className="text-sm text-gray-500 mt-2">
                    Affects {action.clientCount} {action.clientCount === 1 ? "client" : "clients"}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ActionSuggestionsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
      <p className="text-gray-600">Generating action suggestions...</p>
    </div>
  )
}
