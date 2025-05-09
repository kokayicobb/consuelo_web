// src/app/chat/segmentation/action-suggestions.tsx
"use client"

import {
  CheckCircle, Clock, Mail, Phone, Calendar, Users, AlertTriangle,
  ListPlus, // Icon for creating a segment
  Send, // Icon for sending email
  PhoneCall, // Icon for generating call list
  Search, // Icon for analysis/insight
  // FileText, // Example: if you wanted a specific "document" icon for scripts
} from "lucide-react"

// Make sure 'export' keyword is directly before 'interface'
export interface SuggestedAction {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon?: string; // Keep icon string for flexible mapping
  // Added generate_call_script and generate_email_script to the type union
  type: "create_segment" | "email_campaign" | "generate_call_list" | "generate_call_script" | "generate_email_script" | "view_segment" | "analysis_insight" | string;
  clientCount?: number;
  payload?: any; // Data needed to execute the action (e.g., segment criteria, email template ID, client ID)
}

// This interface can remain unexported if only used internally within this file,
// or exported if needed elsewhere. For now, keeping it internal.
interface ActionSuggestionsProps {
  actions: SuggestedAction[];
  summary: string;
  onInitiateAction: (action: SuggestedAction) => void;
}

export default function ActionSuggestions({ actions, summary, onInitiateAction }: ActionSuggestionsProps) {
  const getIcon = (iconName?: string, actionType?: string) => {
    switch (actionType) {
        case "create_segment": return <ListPlus className="h-5 w-5" />;
        case "email_campaign": return <Send className="h-5 w-5" />;
        case "generate_call_list": return <PhoneCall className="h-5 w-5" />;
        // New cases for script generation actions
        case "generate_call_script": return <Phone className="h-5 w-5" />; // Using Phone icon for call script
        case "generate_email_script": return <Mail className="h-5 w-5" />;   // Using Mail icon for email script
        case "view_segment": return <Users className="h-5 w-5" />;
        case "analysis_insight": return <Search className="h-5 w-5" />;
        // Fallback to iconName if type doesn't have a specific icon mapping
        default:
             switch (iconName) {
                case "mail": return <Mail className="h-5 w-5" />;
                case "phone": return <Phone className="h-5 w-5" />;
                case "calendar": return <Calendar className="h-5 w-5" />;
                case "users": return <Users className="h-5 w-5" />;
                case "alert": return <AlertTriangle className="h-5 w-5" />;
                case "clock": return <Clock className="h-5 w-5" />;
                default: return <CheckCircle className="h-5 w-5" />; // Default generic icon
            }
    }
  }

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

   const getButtonText = (actionType: string) => {
        switch (actionType) {
            case "create_segment": return "Create Segment";
            case "email_campaign": return "Initiate Email Campaign";
            case "generate_call_list": return "Generate Call List";
            // New button texts for script generation actions
            case "generate_call_script": return "Generate Call Script";
            case "generate_email_script": return "Generate Email Script";
            case "view_segment": return "View Segment";
            case "analysis_insight": return "Explore Insight";
            default: return "Take Action";
        }
    }

     const getButtonClass = (priority: string) => {
        switch (priority) {
            case "high": return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
            case "medium": return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
            case "low": return "bg-green-600 hover:bg-green-700 focus:ring-green-500";
            default: return "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500";
        }
     }


  return (
    <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Suggested Actions</h3>
      {summary && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2">Summary</h4>
          <p className="text-gray-700 text-sm">{summary}</p>
        </div>
      )}

      {actions.length === 0 && !summary && (
         <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-gray-500">No action suggestions available for this message.</p>
          </div>
      )}

      {actions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {actions.map((action, index) => (
            <div
              key={index} // Using index as key for now, assuming action list order is stable and no reordering/filtering happens on the client side that would break this. Consider a more stable ID if available.
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-start gap-3 flex-grow">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-full flex-shrink-0">
                  {getIcon(action.icon, action.type)}
                  </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 pr-2">{action.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(action.priority)} flex-shrink-0`}>
                      {action.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{action.description}</p>
                  {action.clientCount !== undefined && (
                    <p className="text-sm text-gray-500 mt-2">
                      Affects {action.clientCount} {action.clientCount === 1 ? "client" : "clients"}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onInitiateAction(action)}
                  className={`w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonClass(action.priority)}`}
                >
                  {getButtonText(action.type)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ActionSuggestionsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
      <p className="text-gray-600 text-sm">Generating action suggestions...</p>
    </div>
  )
}