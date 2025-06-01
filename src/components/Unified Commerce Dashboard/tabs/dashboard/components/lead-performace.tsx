"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Phone,
  Mail,
  Users,
  Globe,
  Calendar,
  Handshake,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Clock,
  Star,
} from "lucide-react"

interface LeadChannel {
  id: string
  channel: string
  leads: number
  percentage: number
  conversionRate: number
  costPerLead: number
  qualityScore: number
  trend: "up" | "down" | "stable"
  icon: React.ReactNode
}

interface ChannelDetails {
  id: string
  channel: string
  totalLeads: number
  qualifiedLeads: number
  conversionRate: number
  costPerLead: number
  avgDealSize: number
  qualityScore: number
  recentActivity: {
    period: string
    leads: number
    change: number
  }[]
  topSources: {
    source: string
    leads: number
    percentage: number
  }[]
  performance: {
    metric: string
    value: string
    change: number
    trend: "up" | "down" | "stable"
  }[]
}

const leadChannelData: LeadChannel[] = [
  {
    id: "cold-calls",
    channel: "Cold Calls",
    leads: 1247,
    percentage: 35,
    conversionRate: 12.5,
    costPerLead: 45,
    qualityScore: 8.2,
    trend: "up",
    icon: <Phone className="h-4 w-4" />,
  },
  {
    id: "email-campaigns",
    channel: "Email Campaigns",
    leads: 892,
    percentage: 25,
    conversionRate: 8.7,
    costPerLead: 22,
    qualityScore: 7.1,
    trend: "up",
    icon: <Mail className="h-4 w-4" />,
  },
  {
    id: "social-media",
    channel: "Social Media",
    leads: 623,
    percentage: 17.5,
    conversionRate: 15.2,
    costPerLead: 38,
    qualityScore: 8.8,
    trend: "stable",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "inbound-web",
    channel: "Inbound/Website",
    leads: 445,
    percentage: 12.5,
    conversionRate: 22.1,
    costPerLead: 18,
    qualityScore: 9.1,
    trend: "up",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    id: "events",
    channel: "Events & Webinars",
    leads: 267,
    percentage: 7.5,
    conversionRate: 28.3,
    costPerLead: 85,
    qualityScore: 9.4,
    trend: "down",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    id: "referrals",
    channel: "Referrals",
    leads: 89,
    percentage: 2.5,
    conversionRate: 45.2,
    costPerLead: 12,
    qualityScore: 9.7,
    trend: "stable",
    icon: <Handshake className="h-4 w-4" />,
  },
]

const getChannelDetails = (channelId: string): ChannelDetails => {
  const baseData = leadChannelData.find((c) => c.id === channelId)!

  const detailsMap: Record<string, Partial<ChannelDetails>> = {
    "cold-calls": {
      totalLeads: 1247,
      qualifiedLeads: 156,
      avgDealSize: 12500,
      recentActivity: [
        { period: "This Week", leads: 89, change: 12 },
        { period: "Last Week", leads: 76, change: -5 },
        { period: "2 Weeks Ago", leads: 82, change: 8 },
        { period: "3 Weeks Ago", leads: 71, change: -2 },
      ],
      topSources: [
        { source: "Sales Navigator", leads: 445, percentage: 35.7 },
        { source: "Purchased Lists", leads: 312, percentage: 25.0 },
        { source: "Company Database", leads: 267, percentage: 21.4 },
        { source: "Industry Events", leads: 223, percentage: 17.9 },
      ],
      performance: [
        { metric: "Call Connect Rate", value: "23.5%", change: 2.1, trend: "up" },
        { metric: "Avg Call Duration", value: "4.2 min", change: 0.3, trend: "up" },
        { metric: "Follow-up Rate", value: "67%", change: -1.2, trend: "down" },
        { metric: "Meeting Booked", value: "8.9%", change: 1.5, trend: "up" },
      ],
    },
    "email-campaigns": {
      totalLeads: 892,
      qualifiedLeads: 78,
      avgDealSize: 8900,
      recentActivity: [
        { period: "This Week", leads: 67, change: 8 },
        { period: "Last Week", leads: 59, change: 15 },
        { period: "2 Weeks Ago", leads: 44, change: -3 },
        { period: "3 Weeks Ago", leads: 51, change: 7 },
      ],
      topSources: [
        { source: "Newsletter Signup", leads: 334, percentage: 37.4 },
        { source: "Content Downloads", leads: 223, percentage: 25.0 },
        { source: "Webinar Attendees", leads: 178, percentage: 20.0 },
        { source: "Cold Outreach", leads: 157, percentage: 17.6 },
      ],
      performance: [
        { metric: "Open Rate", value: "24.8%", change: 1.2, trend: "up" },
        { metric: "Click Rate", value: "3.4%", change: 0.2, trend: "up" },
        { metric: "Reply Rate", value: "1.8%", change: -0.1, trend: "down" },
        { metric: "Unsubscribe Rate", value: "0.3%", change: 0.0, trend: "stable" },
      ],
    },
    "social-media": {
      totalLeads: 623,
      qualifiedLeads: 95,
      avgDealSize: 15200,
      recentActivity: [
        { period: "This Week", leads: 45, change: 5 },
        { period: "Last Week", leads: 40, change: 12 },
        { period: "2 Weeks Ago", leads: 28, change: -8 },
        { period: "3 Weeks Ago", leads: 36, change: 3 },
      ],
      topSources: [
        { source: "LinkedIn", leads: 387, percentage: 62.1 },
        { source: "Twitter", leads: 124, percentage: 19.9 },
        { source: "Facebook", leads: 78, percentage: 12.5 },
        { source: "Instagram", leads: 34, percentage: 5.5 },
      ],
      performance: [
        { metric: "Engagement Rate", value: "4.7%", change: 0.8, trend: "up" },
        { metric: "Profile Views", value: "2.3K", change: 156, trend: "up" },
        { metric: "Connection Rate", value: "31%", change: -2.1, trend: "down" },
        { metric: "Message Response", value: "18%", change: 3.2, trend: "up" },
      ],
    },
  }

  return {
    id: channelId,
    channel: baseData.channel,
    totalLeads: baseData.leads,
    qualifiedLeads: Math.round(baseData.leads * (baseData.conversionRate / 100)),
    conversionRate: baseData.conversionRate,
    costPerLead: baseData.costPerLead,
    avgDealSize: 10000,
    qualityScore: baseData.qualityScore,
    recentActivity: [],
    topSources: [],
    performance: [],
    ...detailsMap[channelId],
  }
}

export default function LeadChannelPerformance() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleChannelClick = (channelId: string) => {
    setSelectedChannel(channelId)
    setIsModalOpen(true)
  }

  const selectedChannelDetails = selectedChannel ? getChannelDetails(selectedChannel) : null

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-400" />
    }
  }

  const totalLeads = leadChannelData.reduce((sum, channel) => sum + channel.leads, 0)

  return (
    <>
      <Card className="border-gray-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lead Channel Performance Breakdown
          </CardTitle>
          <CardDescription>Track lead generation performance across all your sales channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-muted-foreground">
            Total Leads: <span className="font-semibold text-foreground">{totalLeads.toLocaleString()}</span>
          </div>
          <div className="space-y-4">
            {leadChannelData.map((channel) => (
              <div
                key={channel.id}
                className="cursor-pointer rounded-lg border border-transparent p-3 transition-all hover:border-gray-200 hover:bg-gray-50"
                onClick={() => handleChannelClick(channel.id)}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {channel.icon}
                    <span className="text-sm font-medium">{channel.channel}</span>
                    {getTrendIcon(channel.trend)}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {channel.conversionRate}% conv.
                    </Badge>
                    <div className="text-sm text-muted-foreground">{channel.leads.toLocaleString()} leads</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={channel.percentage} className="h-2 flex-1" />
                  <div className="w-12 text-xs text-muted-foreground text-right">{channel.percentage}%</div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />${channel.costPerLead}/lead
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {channel.qualityScore}/10 quality
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            View Historical Data
          </Button>
          <Button>
            Optimize Channels
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedChannelDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {leadChannelData.find((c) => c.id === selectedChannel)?.icon}
                  {selectedChannelDetails.channel} - Detailed Analytics
                </DialogTitle>
                <DialogDescription>
                  Comprehensive performance breakdown and insights for this lead channel
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{selectedChannelDetails.totalLeads.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Leads</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{selectedChannelDetails.qualifiedLeads}</div>
                    <div className="text-sm text-muted-foreground">Qualified Leads</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{selectedChannelDetails.conversionRate}%</div>
                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">${selectedChannelDetails.avgDealSize.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Avg Deal Size</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedChannelDetails.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{activity.period}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{activity.leads} leads</span>
                            <div
                              className={`flex items-center text-xs ${
                                activity.change > 0
                                  ? "text-green-600"
                                  : activity.change < 0
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {activity.change > 0 ? "+" : ""}
                              {activity.change}
                              {activity.change > 0 ? (
                                <TrendingUp className="h-3 w-3 ml-1" />
                              ) : activity.change < 0 ? (
                                <TrendingDown className="h-3 w-3 ml-1" />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedChannelDetails.topSources.map((source, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{source.source}</span>
                            <span className="text-sm text-muted-foreground">{source.leads} leads</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={source.percentage} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-12 text-right">{source.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Key Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedChannelDetails.performance.map((metric, index) => (
                        <div key={index} className="text-center">
                          <div className="text-lg font-bold">{metric.value}</div>
                          <div className="text-sm text-muted-foreground mb-1">{metric.metric}</div>
                          <div
                            className={`flex items-center justify-center text-xs ${
                              metric.trend === "up"
                                ? "text-green-600"
                                : metric.trend === "down"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {metric.change > 0 ? "+" : ""}
                            {metric.change}
                            {getTrendIcon(metric.trend)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button>
                  Optimize This Channel
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
