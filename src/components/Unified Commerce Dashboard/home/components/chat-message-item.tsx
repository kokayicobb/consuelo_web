"use client"

import type React from "react"
import { UserCircleIcon, SparklesIcon, Cog6ToothIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import type { ChatMessage, ChatMessageData } from "@/types/chats"
import { cn } from "@/lib/utils"

interface ChatMessageItemProps {
  message: ChatMessage
  onViewDetailsRequest?: (data: ChatMessageData) => void
  onClosePanelRequest?: () => void
  isDisplayedInPanel?: boolean
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onViewDetailsRequest,
  onClosePanelRequest,
  isDisplayedInPanel,
}) => {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"
  const canHaveDetails = message.role === "assistant" && message.data && !message.data.error

  const getIcon = () => {
    if (isUser) return <UserCircleIcon className="w-6 h-6 text-gray-500" />
    if (isSystem) return <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
    return <SparklesIcon className="w-5 h-5 text-gray-500" />
  }

  const handleDetailsButtonClick = () => {
    if (isDisplayedInPanel && onClosePanelRequest) {
      onClosePanelRequest()
    } else if (canHaveDetails && message.data && onViewDetailsRequest) {
      onViewDetailsRequest(message.data)
    }
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full my-4`}>
      <div
        className={cn("flex items-start gap-3 max-w-xl lg:max-w-2xl xl:max-w-3xl", isUser ? "flex-row-reverse" : "")}
      >
        <div className={cn("flex-shrink-0 mt-1 flex items-center justify-center", isUser ? "ml-3" : "mr-3")}>
          {getIcon()}
        </div>

        <div
          className={cn(
            "px-4 py-3 rounded-2xl transition-all",
            isUser
              ? "bg-blue-50 text-gray-800 rounded-br-md"
              : isSystem
                ? "bg-gray-50 text-gray-600 text-sm italic  "
                : "bg-gray-50 text-gray-800 rounded-bl-md",
          )}
        >
          {typeof message.content === "string" ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : (
            message.content
          )}

          {canHaveDetails && (onViewDetailsRequest || onClosePanelRequest) && (
            <button
              onClick={handleDetailsButtonClick}
              className="mt-3 flex items-center text-xs text-gray-500 hover:text-gray-700 font-medium group transition-colors"
            >
              {isDisplayedInPanel ? (
                <EyeSlashIcon className="w-3.5 h-3.5 mr-1.5 group-hover:text-gray-700" />
              ) : (
                <EyeIcon className="w-3.5 h-3.5 mr-1.5 group-hover:text-gray-700" />
              )}
              {isDisplayedInPanel ? "Hide Details" : "View Details"}
            </button>
          )}

          {message.data?.error && message.role === "assistant" && (
            <p className="mt-2 text-xs text-red-500">Details: {message.data.error}</p>
          )}

          <p
            className={cn(
              "text-[11px] mt-2 opacity-70",
              isUser ? "text-gray-500" : "text-gray-500",
              isSystem ? "text-gray-400" : "",
            )}
          >
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatMessageItem
