"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SendIcon, BarChart2, Globe, Video, PlaneTakeoff, AudioLines, BoxIcon, Camera } from "lucide-react"
import useDebounce from "@/hooks/use-debounce"

// Define the action interface
interface Action {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  short?: string
  end?: string
}

// All available actions
const allActions = [
	{
    id: "1",
    label: "Inventory Insights",
    icon: <BoxIcon className="h-4 w-4 text-blue-500" />,
    description: "Type: Inventory",
    short: "⌘K",
    end: "Agent",
  },
  {
    id: "2",
    label: "Channel Performance",
    icon: <BarChart2 className="h-4 w-4 text-orange-500" />,
    description: "Cross-channel metrics",
    short: "⌘cmd+p",
    end: "Command",
  },
  {
    id: "3",
    label: "Visual Merchandising",
    icon: <Camera className="h-4 w-4 text-purple-500" />,
    description: "Product presentation",
    short: "",
    end: "Application",
  },
  {
    id: "4",
    label: "Fashion Assistant",
    icon: <AudioLines className="h-4 w-4 text-green-500" />,
    description: "Voice-enabled AI advisor",
    short: "",
    end: "Active",
  },
  {
    id: "5",
    label: "Market Intelligence",
    icon: <Globe className="h-4 w-4 text-blue-500" />,
    description: "Trend analysis",
    short: "",
    end: "Command",
  },
]

export function MultimodalInput() {
  const [input, setInput] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [filteredActions, setFilteredActions] = useState<Action[]>([])
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const debouncedQuery = useDebounce(input, 200)

  useEffect(() => {
    if (!isFocused) {
      setFilteredActions([])
      return
    }

    if (!debouncedQuery) {
      setFilteredActions(allActions)
      return
    }

    const normalizedQuery = debouncedQuery.toLowerCase().trim()
    const filtered = allActions.filter((action) => {
      const searchableText = action.label.toLowerCase()
      return searchableText.includes(normalizedQuery)
    })

    setFilteredActions(filtered)
  }, [debouncedQuery, isFocused])

  function handleSubmit() {
    if (input.length > 0) {
      console.log("Sending message:", input)
      if (selectedAction) {
        console.log("Selected action:", selectedAction.label)
      }
    }
    setInput("")
    setSelectedAction(null)
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.4 },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto">
      <div className="relative">
        {/* Input Area */}
        <div className="relative bg-zinc-900 rounded-xl border border-zinc-800">
          <Textarea
            placeholder="What can I do for you today?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => {
              setIsFocused(true)
              setSelectedAction(null)
            }}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
              if (e.key === "Escape") {
                setIsFocused(false)
              }
            }}
            className={cn(
              "w-full px-4 py-3",
              "resize-none",
              "bg-transparent",
              "border-none",
              "text-zinc-100 text-base",
              "focus:outline-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-zinc-500 placeholder:text-base",
              "min-h-[60px]",
            )}
          />
          <div className="flex items-center justify-end p-3">
            <button
              className={cn(
                "px-1.5 py-1.5 h-6 rounded-lg text-sm transition-colors hover:bg-zinc-800 flex items-center justify-between gap-1",
                "text-zinc-800",
                "disabled:opacity-50 disabled:cursor-not-allowed bg-white",
              )}
              disabled={input.length === 0}
              onClick={handleSubmit}
            >
              <SendIcon className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </button>
          </div>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isFocused && filteredActions.length > 0 && !selectedAction && (
            <motion.div
              className="w-full border rounded-md shadow-sm overflow-hidden dark:border-gray-800 bg-black mt-1 absolute z-10"
              variants={container}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.ul>
                {filteredActions.map((action) => (
                  <motion.li
                    key={action.id}
                    className="px-3 py-2 flex items-center justify-between hover:bg-zinc-900 cursor-pointer rounded-md"
                    variants={item}
                    layout
                    onClick={() => {
                      setSelectedAction(action)
                      setInput(`${action.label}: `)
                      // Keep focus on the textarea
                      document.querySelector("textarea")?.focus()
                    }}
                  >
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{action.icon}</span>
                        <span className="text-sm font-medium text-gray-100">{action.label}</span>
                        <span className="text-xs text-gray-400">{action.description}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{action.short}</span>
                      <span className="text-xs text-gray-400 text-right">{action.end}</span>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
              <div className="mt-2 px-3 py-2 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Press ⌘K to open commands</span>
                  <span>ESC to cancel</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-2 w-full">
        {allActions.slice(0, 3).map((item, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              delay: 0.1 * index,
              duration: 0.4,
              ease: "easeOut",
            }}
            key={index}
            className={`${index > 1 ? "hidden sm:block" : "block"} h-full`}
          >
            <button
              type="button"
              className="group w-full h-full text-left rounded-lg p-2.5
                bg-zinc-900 hover:bg-zinc-800
                border border-zinc-800 hover:border-zinc-700
                transition-colors duration-300
                flex flex-col justify-between"
              onClick={() => {
                setSelectedAction(item)
                setInput(`${item.label}: `)
                document.querySelector("textarea")?.focus()
              }}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700">
                  {item.icon}
                </div>
                <div className="text-xs text-zinc-100 font-medium">{item.label}</div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default MultimodalInput