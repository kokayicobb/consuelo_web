"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Building,
  User,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  PhoneCall,
  MessageSquare,
  Video,
  Star,
  MapPin,
} from "lucide-react"

interface FollowUp {
  id: string
  name: string
  company: string
  title: string
  avatar?: string
  priority: "high" | "medium" | "low"
  reason: string
  lastContact: string
  nextAction: string
  dealValue: number
  contactMethod: "call" | "email" | "meeting"
  daysOverdue: number
  phone: string
  email: string
  location: string
  notes: string[]
  previousInteractions: {
    date: string
    type: "call" | "email" | "meeting"
    outcome: string
    duration?: string
  }[]
  dealStage: string
  leadScore: number
}

const followUpsData: FollowUp[] = [
  {
    id: "1",
    name: "Sarah Chen",
    company: "TechFlow Solutions",
    title: "VP of Sales",
    priority: "high",
    reason: "Interested in enterprise package",
    lastContact: "3 days ago",
    nextAction: "Send pricing proposal",
    dealValue: 45000,
    contactMethod: "call",
    daysOverdue: 1,
    phone: "+1 (555) 123-4567",
    email: "sarah.chen@techflow.com",
    location: "San Francisco, CA",
    notes: [
      "Mentioned budget approval needed from CFO",
      "Wants demo for technical team next week",
      "Current solution expires in Q2",
    ],
    previousInteractions: [
      {
        date: "2024-01-15",
        type: "call",
        outcome: "Interested, requested proposal",
        duration: "25 min",
      },
      {
        date: "2024-01-10",
        type: "email",
        outcome: "Opened, clicked pricing link",
      },
      {
        date: "2024-01-08",
        type: "meeting",
        outcome: "Initial discovery call",
        duration: "45 min",
      },
    ],
    dealStage: "Proposal",
    leadScore: 85,
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    company: "DataSync Corp",
    title: "CTO",
    priority: "high",
    reason: "Technical evaluation pending",
    lastContact: "5 days ago",
    nextAction: "Schedule technical demo",
    dealValue: 78000,
    contactMethod: "meeting",
    daysOverdue: 2,
    phone: "+1 (555) 987-6543",
    email: "m.rodriguez@datasync.com",
    location: "Austin, TX",
    notes: [
      "Needs integration with existing Salesforce",
      "Security compliance is critical",
      "Decision timeline: end of month",
    ],
    previousInteractions: [
      {
        date: "2024-01-13",
        type: "call",
        outcome: "Technical questions discussed",
        duration: "35 min",
      },
      {
        date: "2024-01-09",
        type: "email",
        outcome: "Sent technical documentation",
      },
    ],
    dealStage: "Technical Review",
    leadScore: 92,
  },
  {
    id: "3",
    name: "Jennifer Walsh",
    company: "Growth Dynamics",
    title: "Head of Operations",
    priority: "medium",
    reason: "Follow up on trial feedback",
    lastContact: "1 week ago",
    nextAction: "Check trial progress",
    dealValue: 23000,
    contactMethod: "call",
    daysOverdue: 0,
    phone: "+1 (555) 456-7890",
    email: "j.walsh@growthdynamics.com",
    location: "Chicago, IL",
    notes: ["Started 14-day trial last week", "Team of 12 users", "Comparing with 2 other solutions"],
    previousInteractions: [
      {
        date: "2024-01-11",
        type: "call",
        outcome: "Trial setup completed",
        duration: "20 min",
      },
      {
        date: "2024-01-05",
        type: "email",
        outcome: "Initial interest expressed",
      },
    ],
    dealStage: "Trial",
    leadScore: 68,
  },
  
]

export default function FollowUpsTracker() {
  const [selectedFollowUp, setSelectedFollowUp] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFollowUpClick = (followUpId: string) => {
    setSelectedFollowUp(followUpId)
    setIsModalOpen(true)
  }

  const selectedFollowUpDetails = selectedFollowUp ? followUpsData.find((f) => f.id === selectedFollowUp) : null

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getContactMethodIcon = (method: "call" | "email" | "meeting") => {
    switch (method) {
      case "call":
        return <Phone className="h-3 w-3" />
      case "email":
        return <Mail className="h-3 w-3" />
      case "meeting":
        return <Video className="h-3 w-3" />
    }
  }

  const getInteractionIcon = (type: "call" | "email" | "meeting") => {
    switch (type) {
      case "call":
        return <PhoneCall className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <Video className="h-4 w-4" />
    }
  }

  const overdueCount = followUpsData.filter((f) => f.daysOverdue > 0).length
  const highPriorityCount = followUpsData.filter((f) => f.priority === "high").length

  return (
    <>
      <Card className="border-gray-200 bg-white h-auto shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PhoneCall className="h-4 w-4" />
              Follow-Ups Required
            </CardTitle>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-muted-foreground">
                {overdueCount} overdue • {highPriorityCount} high priority
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-transparent shadow-none">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark all as contacted</DropdownMenuItem>
              <DropdownMenuItem>Export follow-up list</DropdownMenuItem>
              <DropdownMenuItem>Follow-up settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-2 p-0">
          {followUpsData.map((followUp) => (
            <div
              key={followUp.id}
              className="flex items-start border-b px-6 py-3 last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleFollowUpClick(followUp.id)}
            >
              <Avatar className="h-8 w-8 mr-3 mt-1">
                <AvatarImage src={followUp.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {followUp.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{followUp.name}</p>
                    <Badge className={`text-xs px-1.5 py-0.5 ${getPriorityColor(followUp.priority)}`}>
                      {followUp.priority}
                    </Badge>
                    {followUp.daysOverdue > 0 && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        {followUp.daysOverdue}d overdue
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {getContactMethodIcon(followUp.contactMethod)}
                    <span className="text-xs text-muted-foreground">${followUp.dealValue.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {followUp.company} • {followUp.title}
                </p>
                <p className="text-xs text-foreground">{followUp.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last contact: {followUp.lastContact} • Next: {followUp.nextAction}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t p-0">
          <Button variant="ghost" className="h-10 w-full rounded-none bg-transparent shadow-none text-gray-800 hover:bg-gray-100">
            View All Follow-Ups
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedFollowUpDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedFollowUpDetails.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {selectedFollowUpDetails.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      {selectedFollowUpDetails.name}
                      <Badge className={`${getPriorityColor(selectedFollowUpDetails.priority)}`}>
                        {selectedFollowUpDetails.priority} priority
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selectedFollowUpDetails.title} at {selectedFollowUpDetails.company}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Complete contact details and interaction history for this follow-up
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Deal Value</span>
                    </div>
                    <div className="text-2xl font-bold">${selectedFollowUpDetails.dealValue.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{selectedFollowUpDetails.dealStage}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Lead Score</span>
                    </div>
                    <div className="text-2xl font-bold">{selectedFollowUpDetails.leadScore}/100</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedFollowUpDetails.leadScore >= 80
                        ? "Hot"
                        : selectedFollowUpDetails.leadScore >= 60
                          ? "Warm"
                          : "Cold"}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Last Contact</span>
                    </div>
                    <div className="text-lg font-bold">{selectedFollowUpDetails.lastContact}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedFollowUpDetails.daysOverdue > 0
                        ? `${selectedFollowUpDetails.daysOverdue} days overdue`
                        : "On track"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedFollowUpDetails.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedFollowUpDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedFollowUpDetails.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedFollowUpDetails.location}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Interactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Recent Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedFollowUpDetails.previousInteractions.slice(0, 3).map((interaction, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="mt-1">{getInteractionIcon(interaction.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium capitalize">{interaction.type}</span>
                              <span className="text-xs text-muted-foreground">{interaction.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{interaction.outcome}</p>
                            {interaction.duration && (
                              <p className="text-xs text-muted-foreground">Duration: {interaction.duration}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Important Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedFollowUpDetails.notes.map((note, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <span className="text-sm">{note}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-transparent shadow-none">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="bg-transparent shadow-none">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Meeting
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-transparent shadow-none"
                  >
                    Close
                  </Button>
                  <Button className="bg-transparent shadow-none border border-green-600 text-green-600 hover:bg-green-50">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Contacted
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
