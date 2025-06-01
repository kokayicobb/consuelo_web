"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Target,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react"

// --- NEW IMPORTS FOR CONTACT CARD FUNCTIONALITY ---
// Assuming these components and data are available at these paths
import { SidePanel } from "@/components/Unified Commerce Dashboard/components/contact/side-panel" // Ensure this is the modified SidePanel
import { ContactCard } from "@/components/Unified Commerce Dashboard/components/contact/contact-card"
import { detailedContacts, DetailedContact } from "@/components/Unified Commerce Dashboard/components/contact/detailed-contacts" // Added DetailedContact type import
import { FullScreenContactView } from "@/components/Unified Commerce Dashboard/components/contact/full screen/full-contact-view"

const nextActions = [
  {
    id: 1,
    name: "Sarah Chen",
    company: "TechFlow Solutions",
    priority: "High",
    lastContact: "3 days ago",
    reason: "Follow up on $45K proposal",
    actions: ["call", "email", "meeting"],
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    company: "Global Dynamics",
    priority: "Medium",
    lastContact: "1 week ago",
    reason: "Quarterly check-in due",
    actions: ["call", "email", "message"],
  },
  {
    id: 3,
    name: "Emily Watson",
    company: "StartUp Labs",
    priority: "High",
    lastContact: "2 days ago",
    reason: "Contract renewal discussion",
    actions: ["call", "meeting", "email"],
  },
]

const targetMetrics = [
  {
    name: "Total Sales",
    current: 352924,
    target: 400000,
    percentage: 88,
    daily: { current: 11764, target: 13333, percentage: 88 },
    weekly: { current: 82353, target: 93333, percentage: 88 },
  },
  {
    name: "New Customers",
    current: 842,
    target: 1000,
    percentage: 84,
    daily: { current: 28, target: 33, percentage: 85 },
    weekly: { current: 196, target: 233, percentage: 84 },
  },
  {
    name: "Average Order Value",
    current: 124,
    target: 150,
    percentage: 83,
    daily: { current: 124, target: 150, percentage: 83 },
    weekly: { current: 124, target: 150, percentage: 83 },
  },
]

const aiInsights = [
  {
    type: "Cohort Analysis",
    title: "Focus on Enterprise Accounts",
    description: "Call accounts with 500+ employees - they convert 3x higher this month",
    action: "View 12 enterprise prospects",
    icon: Users,
    priority: "High",
  },
  {
    type: "Timing Optimization",
    title: "Best Call Window",
    description: "Your success rate is 40% higher when calling between 10-11 AM",
    action: "Schedule calls for tomorrow",
    icon: Clock,
    priority: "Medium",
  },
  {
    type: "Pipeline Strategy",
    title: "Warm Lead Follow-up",
    description: "8 leads from last week's demo need follow-up to hit monthly target",
    action: "Review warm leads",
    icon: TrendingUp,
    priority: "High",
  },
]

export default function AICRMSwipeableCards() {
  
  const [currentCard, setCurrentCard] = useState(0)
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("monthly")

  // --- STATE FOR CONTACT CARD FUNCTIONALITY ---
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  // --- NEW STATE FOR FULL SCREEN TOGGLE ---
  const [isPanelFullScreen, setIsPanelFullScreen] = useState(false);
  // --- END NEW STATE ---

  // --- HANDLERS FOR CONTACT CARD FUNCTIONALITY ---
  const handleContactClick = (contactId: number) => {
    setSelectedContactId(contactId);
    setIsSidePanelOpen(true);
    setIsPanelFullScreen(false); // Optionally reset to non-fullscreen when opening a new contact
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setIsPanelFullScreen(false); // Reset full-screen state when panel closes
    // setTimeout(() => setSelectedContactId(null), 300); // Optional: clear selected contact after close animation
  };

  // --- NEW HANDLER FOR FULL SCREEN TOGGLE ---
  const handleToggleFullScreen = () => {
    setIsPanelFullScreen(prev => !prev);
  };
  // --- END NEW HANDLER ---

  const selectedContact = detailedContacts.find(
    (contact) => contact.id === selectedContactId
  );

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % 3)
  }

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + 3) % 3)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "call":
        return <Phone className="h-3 w-3" />
      case "email":
        return <Mail className="h-3 w-3" />
      case "message":
        return <MessageSquare className="h-3 w-3" />
      case "meeting":
        return <Calendar className="h-3 w-3" />
      default:
        return <Phone className="h-3 w-3" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMetricData = (metric: any) => {
    switch (timeframe) {
      case "daily":
        return metric.daily
      case "weekly":
        return metric.weekly
      case "monthly":
        return { current: metric.current, target: metric.target, percentage: metric.percentage }
      default:
        return { current: metric.current, target: metric.target, percentage: metric.percentage }
    }
  }

  const formatValue = (value: number, metricName: string) => {
    if (metricName === "Average Order Value") {
      return `$${value}`
    }
    return metricName.includes("Sales") ? `$${value.toLocaleString()}` : value.toLocaleString()
  }

  return (
    <>
      <Card className="border-gray-200 bg-white relative overflow-hidden shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {currentCard === 0 && "What Should I Do Next"}
            {currentCard === 1 && `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Target Metrics`}
            {currentCard === 2 && "AI Insights"}
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevCard}
              className="h-6 w-6 p-0 bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${index === currentCard ? "bg-blue-500" : "bg-gray-300"}`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextCard}
              className="h-6 w-6 p-0 bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 min-h-[280px]">
          {currentCard === 0 && (
            <div className="space-y-3">
              {nextActions.map((contact) => (
                <div
                  key={contact.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleContactClick(contact.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{contact.name}</div>
                      <div className="text-xs text-muted-foreground">{contact.company}</div>
                    </div>
                    <Badge className={`pointer-events-none text-xs ${getPriorityColor(contact.priority)}`}>
                      {contact.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{contact.reason}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Last contact: {contact.lastContact}</span>
                    <div className="flex space-x-1">
                      <TooltipProvider delayDuration={0}>
                        {contact.actions.map((action, index) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0 bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {getActionIcon(action)}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="p-0 border-0 bg-transparent shadow-none text-black">
                              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64">
                                <div className="space-y-2">
                                  <div className="font-medium text-sm capitalize">
                                    {action} {contact.name}
                                  </div>
                                  {action === "call" && (
                                    <div className="space-y-2">
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        📞 Call: (555) 123-4567
                                      </button>
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        📝 Create Call Script
                                      </button>
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        💡 View Talking Points
                                      </button>
                                    </div>
                                  )}
                                  {action === "email" && (
                                    <div className="space-y-2">
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        ✉️ Email: {contact.name.toLowerCase().replace(" ", ".")}@
                                        {contact.company.toLowerCase().replace(/\s+/g, "")}.com
                                      </button>
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        📝 Create Email Script
                                      </button>
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        💡 View Talking Points
                                      </button>
                                    </div>
                                  )}
                                  {action === "message" && (
                                    <div className="space-y-2">
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        💬 Send Message
                                      </button>
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        📝 Create Message Script
                                      </button>
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        💡 View Talking Points
                                      </button>
                                    </div>
                                  )}
                                  {action === "meeting" && (
                                    <div className="space-y-2">
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        📅 Schedule Meeting
                                      </button>
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        📝 Create Meeting Agenda
                                      </button>
                                      <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs border border-gray-100">
                                        💡 View Talking Points
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentCard === 1 && (
            <div className="space-y-4">
              <div className="flex justify-center space-x-1">
                {["daily", "weekly", "monthly"].map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe(period as "daily" | "weekly" | "monthly")}
                    className="text-xs h-6 px-2 bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </div>
              {targetMetrics.map((metric, index) => {
                const data = getMetricData(metric)
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">{metric.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatValue(data.current, metric.name)} / {formatValue(data.target, metric.name)}
                      </div>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                  </div>
                )
              })}
              <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Custom Metrics</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
                  >
                    <span className="mr-1">+</span> Add Metric
                  </Button>
                </div>
                <div className="border border-dashed border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center text-center h-[72px]">
                  <span className="text-xs text-muted-foreground">Add your own custom metrics to track</span>
                  <span className="text-xs text-muted-foreground">Click "Add Metric" to get started</span>
                </div>
              </div>
            </div>
          )}

          {currentCard === 2 && (
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start space-x-2 mb-2">
                    <insight.icon className="h-4 w-4 mt-0.5 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">{insight.title}</div>
                        <Badge className={`text-xs pointer-events-none ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{insight.description}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
                      >
                        {insight.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button className="w-full bg-transparent shadow-none text-gray-800 border border-gray-200 hover:bg-gray-100">
            {currentCard === 0 && (
              <>
                <Target className="mr-2 h-4 w-4" />
                View All Actions
              </>
            )}
            {currentCard === 1 && (
              <>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help Me Reach Targets
              </>
            )}
            {currentCard === 2 && (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Get More Insights
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Side Panel with Full Screen Capability */}
      {selectedContact && (
        <SidePanel
          isOpen={isSidePanelOpen}
          onClose={handleCloseSidePanel}
          title={isPanelFullScreen && selectedContact ? `Details: ${selectedContact.name}` : (selectedContact ? selectedContact.name : "Details")}
          isFullScreen={isPanelFullScreen}
          onToggleFullScreen={handleToggleFullScreen} // Pass the handler here
        >
          {/* CONDITIONAL RENDERING OF CHILDREN BASED ON isPanelFullScreen STATE */}
          {isPanelFullScreen ? (
            <FullScreenContactView contact={selectedContact} />
          ) : (
            <ContactCard contact={selectedContact} />
          )}
        </SidePanel>
      )}
    </>
  )
}