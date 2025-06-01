"use client"

import { useState, useRef, useEffect } from "react"
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Users,
  TrendingUp,
  BarChart3,
  Download,
  Target,
  Lightbulb,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Sample data for cohorts
const cohortData = [
  {
    id: "c1",
    name: "Enterprise Clients (500+ Members)",
    segment: "Q4 2024 Signups",
    conversion: 94,
    trend: "+12%",
    count: 127,
    avgDealSize: "$45,200",
    ltv: "$320,000",
    industry: "Fitness",
    insights: "3x higher conversion rate than average",
    priority: "High",
  },
  {
    id: "c2",
    name: "Premium Banking Clients",
    segment: "High-value accounts",
    conversion: 87,
    trend: "+8%",
    count: 89,
    avgDealSize: "$78,500",
    ltv: "$450,000",
    industry: "Banking",
    insights: "2.5x higher lifetime value",
    priority: "High",
  },
  {
    id: "c3",
    name: "Boutique Fitness Studios",
    segment: "Small-medium gyms",
    conversion: 76,
    trend: "+5%",
    count: 203,
    avgDealSize: "$12,800",
    ltv: "$95,000",
    industry: "Fitness",
    insights: "High volume, lower deal size",
    priority: "Medium",
  },
  {
    id: "c4",
    name: "Regional Credit Unions",
    segment: "Community banks",
    conversion: 71,
    trend: "+3%",
    count: 156,
    avgDealSize: "$28,400",
    ltv: "$210,000",
    industry: "Banking",
    insights: "Steady growth potential",
    priority: "Medium",
  },
  {
    id: "c5",
    name: "Corporate Wellness Programs",
    segment: "Employee fitness benefits",
    conversion: 68,
    trend: "+7%",
    count: 112,
    avgDealSize: "$32,600",
    ltv: "$180,000",
    industry: "Fitness",
    insights: "Growing segment with expansion potential",
    priority: "Medium",
  },
  {
    id: "c6",
    name: "Digital Banking Startups",
    segment: "Fintech innovators",
    conversion: 65,
    trend: "+15%",
    count: 78,
    avgDealSize: "$18,900",
    ltv: "$120,000",
    industry: "Banking",
    insights: "Fastest growing segment",
    priority: "High",
  },
]

// AI insights about cohorts
const aiInsights = [
  {
    title: "Enterprise Focus Opportunity",
    description:
      "Enterprise clients show 3x higher lifetime value. Consider increasing outreach to similar prospects in your pipeline.",
    action: "View Enterprise Prospects",
    priority: "High",
  },
  {
    title: "Cross-Selling Potential",
    description:
      "Premium Banking clients have 45% lower product adoption than similar cohorts. Opportunity for targeted cross-selling.",
    action: "Create Cross-Sell Campaign",
    priority: "Medium",
  },
  {
    title: "Retention Risk",
    description: "Boutique Fitness Studios showing 12% higher churn risk this quarter. Recommend proactive outreach.",
    action: "View At-Risk Clients",
    priority: "High",
  },
  {
    title: "Segment Growth Opportunity",
    description:
      "Digital Banking Startups segment growing 15% faster than other segments. Consider allocating more resources to this vertical.",
    action: "Explore Growth Strategy",
    priority: "Medium",
  },
  {
    title: "Pricing Optimization",
    description:
      "Regional Credit Unions cohort has 18% price sensitivity. Test tiered pricing models to increase conversion.",
    action: "Create Pricing Test",
    priority: "Medium",
  },
]

export function TopPerformingCohortCard() {
  const [filter, setFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("conversion")
  const [contentHeight, setContentHeight] = useState<number>(0)
  const [activeView, setActiveView] = useState<string>("cohorts")

  const cohortContentRef = useRef<HTMLDivElement>(null)
  const insightsContentRef = useRef<HTMLDivElement>(null)

  // Filter and sort cohorts based on current selections
  const filteredCohorts = cohortData
    .filter((cohort) => filter === "all" || cohort.industry.toLowerCase() === filter.toLowerCase())
    .sort((a, b) => {
      if (sortBy === "conversion") return b.conversion - a.conversion
      if (sortBy === "deal")
        return (
          Number.parseInt(b.avgDealSize.replace(/[^0-9]/g, "")) - Number.parseInt(a.avgDealSize.replace(/[^0-9]/g, ""))
        )
      if (sortBy === "count") return b.count - a.count
      return 0
    })
    .slice(0, 4) // Show top 4 cohorts

  // Calculate and set the maximum height between the two views
  useEffect(() => {
    const updateHeight = () => {
      const cohortHeight = cohortContentRef.current?.scrollHeight || 0
      const insightsHeight = insightsContentRef.current?.scrollHeight || 0
      setContentHeight(Math.max(cohortHeight, insightsHeight))
    }

    updateHeight()
    // Add a small delay to ensure content is fully rendered
    const timer = setTimeout(updateHeight, 100)

    return () => clearTimeout(timer)
  }, [filter, sortBy])

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

  const getConversionColor = (conversion: number) => {
    if (conversion >= 85) return "text-green-600"
    if (conversion >= 70) return "text-blue-600"
    return "text-yellow-600"
  }

  return (
    <Card className="border-gray-200 bg-white shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 h-auto bg-transparent text-gray-800 hover:bg-transparent hover:opacity-80 shadow-none"
                >
                  <div className="flex items-center">
                    {activeView === "cohorts" ? (
                      <CardTitle className="flex items-center text-gray-800 ">
                        Top Performing Cohorts
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </CardTitle>
                    ) : (
                      <CardTitle className="flex items-center text-gray-800">
                       
                        AI Cohort Insights
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </CardTitle>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white">
                <DropdownMenuItem
                  onClick={() => setActiveView("cohorts")}
                  className="text-gray-800 hover:bg-gray-100 focus:bg-gray-300"
                >
                  Top Performing Cohorts
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setActiveView("insights")}
                  className="text-gray-800 hover:bg-gray-100 focus:bg-gray-300"
                >
                 
                  AI Cohort Insights
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="text-gray-500">
                  More options coming soon...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {activeView === "cohorts" && (
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
                  >
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    {filter === "all" ? "All Industries" : filter}
                    <ChevronDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilter("all")}>All Industries</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("fitness")}>Fitness</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("banking")}>Banking</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
                  >
                    <TrendingUp className="mr-2 h-3.5 w-3.5" />
                    Sort By
                    <ChevronDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("conversion")}>Conversion Rate</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("deal")}>Deal Size</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("count")}>Client Count</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {activeView === "insights" && (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">5 New Insights</Badge>
          )}
        </div>
        <CardDescription>
          {activeView === "cohorts"
            ? "Client segments driving the highest conversion rates"
            : "AI-generated insights to optimize your sales strategy"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div style={{ minHeight: `${contentHeight}px` }} className="transition-all duration-300">
          {/* Cohort Performance View */}
          <div ref={cohortContentRef} className={`space-y-3 ${activeView === "cohorts" ? "block" : "hidden"}`}>
            {filteredCohorts.map((cohort) => (
              <div key={cohort.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm">{cohort.name}</div>
                    <div className="text-xs text-muted-foreground">{cohort.segment}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getConversionColor(cohort.conversion)}`}>
                      {cohort.conversion}% Conversion <span className="text-xs text-green-600">{cohort.trend}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{cohort.count} clients</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-muted-foreground">Avg. Deal: {cohort.avgDealSize}</div>
                    <div className="text-xs text-muted-foreground">LTV: {cohort.ltv}</div>
                    <TooltipProvider delayDuration={50}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className={`text-xs pointer-events-none ${getPriorityColor(cohort.priority)}`}>
                            {cohort.priority}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{cohort.insights}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
                    >
                      <Users className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
                    >
                      <Target className="mr-1 h-3 w-3" />
                      Target
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights View */}
          <div ref={insightsContentRef} className={`space-y-3 ${activeView === "insights" ? "block" : "hidden"}`}>
            {aiInsights.map((insight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 bg-blue-50/30">
                <div className="flex items-start justify-between mb-1">
                  <div className="text-sm text-blue-800 font-medium">💡 {insight.title}</div>
                  <Badge className={`text-xs pointer-events-none ${getPriorityColor(insight.priority)}`}>
                    {insight.priority}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{insight.description}</div>
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs bg-transparent shadow-none text-blue-600 border border-blue-200 hover:bg-blue-50"
                  >
                    {insight.action}
                  </Button>

                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
                    >
                      <Target className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0 bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {activeView === "cohorts" ? (
          <>
            <Button
              variant="outline"
              className="bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analyze All Cohorts
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button className="bg-transparent shadow-none text-gray-800 border border-gray-200 hover:bg-gray-100">
                Create New Cohort
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate More Insights
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="bg-transparent shadow-none text-gray-600 border border-gray-200 hover:bg-gray-100"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Insights
              </Button>
              <Button className="bg-transparent shadow-none text-gray-800 border border-gray-200 hover:bg-gray-100">
                Apply All Recommendations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
