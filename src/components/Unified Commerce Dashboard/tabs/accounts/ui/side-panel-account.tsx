"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Maximize,
  Minimize,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Calendar,
  DollarSign,
  User,
  Activity,
  Briefcase,
  FileText,
  Tag,
  Paperclip,
  TrendingUp,
  Info,
  Lightbulb,
  Plus,
  Edit2,
  X,
  Trash2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Customer } from "@/lib/supabase/customer"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Drawer } from "vaul"
import { Skeleton } from "@/components/ui/skeleton"

interface DetailedSidePanelProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  isFullScreen: boolean
  onToggleFullScreen: () => void
  onCustomerUpdate?: (updatedCustomer: Customer) => void
}

interface AIInsight {
  id: string
  client_id: string
  insight_type: string
  content: string
  confidence_score: number
  is_active: boolean
  created_at: string
}

interface ClientActivity {
  id: string
  client_id: string
  activity_type: string
  subject?: string
  description: string
  activity_date: string
  sentiment?: string
  user_name?: string
  metadata?: any
}

interface Deal {
  id: string
  client_id: string
  deal_name: string
  stage: string
  amount: number
  probability: number
  expected_close_date: string
  actual_close_date?: string
  owner: string
  description?: string
}

interface Ticket {
  id: string
  client_id: string
  ticket_number: string
  subject: string
  description?: string
  status: string
  priority: string
  category?: string
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

interface ClientFile {
  id: string
  client_id: string
  file_name: string
  file_type: string
  file_size: string
  file_url?: string
  description?: string
  uploaded_by?: string
  tags?: string[]
  created_at: string
}

const TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "emails", label: "Emails", icon: Mail },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "tasks", label: "Tasks", icon: Briefcase },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "files", label: "Files", icon: Paperclip },
  { id: "deals", label: "Deals", icon: DollarSign },
  { id: "tickets", label: "Tickets", icon: Tag },
]

const ACTIVITY_TYPES = ["Email", "Call", "Meeting", "Task", "Note"]
const SENTIMENTS = ["Positive", "Neutral", "Negative"]
const DEAL_STAGES = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]
const TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Closed"]
const TICKET_PRIORITIES = ["Low", "Normal", "High", "Urgent"]

export default function DetailedSidePanel({
  isOpen,
  onClose,
  customer,
  isFullScreen,
  onToggleFullScreen,
  onCustomerUpdate,
}: DetailedSidePanelProps) {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [activities, setActivities] = useState<ClientActivity[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [files, setFiles] = useState<ClientFile[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditingCustomer, setIsEditingCustomer] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form states for adding new items
  const [showNewActivity, setShowNewActivity] = useState(false)
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [showNewInsight, setShowNewInsight] = useState(false)

 
  const fetchAIInsights = async () => {
    if (!customer) return
    const { data, error } = await supabase
      .from("client_ai_insights")
      .select("*")
      .eq("client_id", customer.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) console.error("Error fetching AI insights:", error)
    else setAiInsights(data || [])
  }

  const fetchActivities = async () => {
    if (!customer) return
    const { data, error } = await supabase
      .from("client_activities")
      .select("*")
      .eq("client_id", customer.id)
      .order("activity_date", { ascending: false })
      .limit(50)

    if (error) console.error("Error fetching activities:", error)
    else setActivities(data || [])
  }

  const fetchDeals = async () => {
    if (!customer) return
    const { data, error } = await supabase
      .from("client_deals")
      .select("*")
      .eq("client_id", customer.id)
      .order("created_at", { ascending: false })

    if (error) console.error("Error fetching deals:", error)
    else setDeals(data || [])
  }

  const fetchTickets = async () => {
    if (!customer) return
    const { data, error } = await supabase
      .from("client_tickets")
      .select("*")
      .eq("client_id", customer.id)
      .order("updated_at", { ascending: false })

    if (error) console.error("Error fetching tickets:", error)
    else setTickets(data || [])
  }

  const fetchFiles = async () => {
    if (!customer) return
    const { data, error } = await supabase
      .from("client_files")
      .select("*")
      .eq("client_id", customer.id)
      .order("created_at", { ascending: false })

    if (error) console.error("Error fetching files:", error)
    else setFiles(data || [])
  }
	
 const fetchAllData = useCallback(async () => {
    if (!customer) return

    setLoading(true)
    try {
      await Promise.all([
        fetchAIInsights(),
        fetchActivities(),
        fetchDeals(),
        fetchTickets(),
        fetchFiles(),
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load customer data")
    } finally {
      setLoading(false)
    }
  }, [customer, fetchAIInsights, fetchActivities, fetchDeals, fetchTickets, fetchFiles])

  const [isInitialLoad, setIsInitialLoad] = useState(true);

// Modify your useEffect
useEffect(() => {
  if (customer && isOpen) {
    // Show skeleton immediately
    setIsInitialLoad(true);
    setEditedCustomer(customer);
    
    // Fetch data in background
    fetchAllData().finally(() => {
      setIsInitialLoad(false);
    });
  }
}, [customer, isOpen, fetchAllData]);
  // Fixed updateCustomer function with correct column names based on your schema
  const updateCustomer = async () => {
    if (!editedCustomer || !customer) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          Client: editedCustomer.name,
          email: editedCustomer.email,
          phone: editedCustomer.phone,
          title: editedCustomer.title,
          company: editedCustomer.company,
          address: editedCustomer.address,
          linkedin: editedCustomer.linkedin,
          priority: editedCustomer.priority,
          status: editedCustomer.status,
          segment: editedCustomer.segment,
          Staff: editedCustomer.staff,
          notes: editedCustomer.notes,
          total_assets_under_management: editedCustomer.total_assets_under_management,
          product_interests: editedCustomer.product_interests,
        })
        .eq("Client ID", customer.id) // Using "Client ID" as per your schema

      if (error) throw error

      toast.success("Customer information updated successfully")
      setIsEditingCustomer(false)
      if (onCustomerUpdate) {
        onCustomerUpdate(editedCustomer)
      }
    } catch (error) {
      console.error("Error updating customer:", error)
      toast.error("Failed to update customer information")
    } finally {
      setIsSaving(false)
    }
  }

  const addActivity = async (activityData: Partial<ClientActivity>) => {
    if (!customer) return

    try {
      const { error } = await supabase.from("client_activities").insert({
        client_id: customer.id,
        ...activityData,
        activity_date: activityData.activity_date || new Date().toISOString(),
      })

      if (error) throw error

      toast.success("Activity added successfully")
      setShowNewActivity(false)
      fetchActivities()
    } catch (error) {
      console.error("Error adding activity:", error)
      toast.error("Failed to add activity")
    }
  }

  const addDeal = async (dealData: Partial<Deal>) => {
    if (!customer) return

    try {
      const { error } = await supabase.from("client_deals").insert({
        client_id: customer.id,
        ...dealData,
      })

      if (error) throw error

      toast.success("Deal added successfully")
      setShowNewDeal(false)
      fetchDeals()
    } catch (error) {
      console.error("Error adding deal:", error)
      toast.error("Failed to add deal")
    }
  }

  const addTicket = async (ticketData: Partial<Ticket>) => {
    if (!customer) return

    try {
      const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`
      const { error } = await supabase.from("client_tickets").insert({
        client_id: customer.id,
        ticket_number: ticketNumber,
        ...ticketData,
      })

      if (error) throw error

      toast.success("Ticket created successfully")
      setShowNewTicket(false)
      fetchTickets()
    } catch (error) {
      console.error("Error adding ticket:", error)
      toast.error("Failed to create ticket")
    }
  }

  const addInsight = async (insightData: Partial<AIInsight>) => {
    if (!customer) return

    try {
      const { error } = await supabase.from("client_ai_insights").insert({
        client_id: customer.id,
        insight_type: "talking_tip",
        confidence_score: 0.85,
        is_active: true,
        ...insightData,
      })

      if (error) throw error

      toast.success("Insight added successfully")
      setShowNewInsight(false)
      fetchAIInsights()
    } catch (error) {
      console.error("Error adding insight:", error)
      toast.error("Failed to add insight")
    }
  }

  const deleteItem = async (table: string, id: string, fetchFunction: () => void) => {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id)

      if (error) throw error

      toast.success("Item deleted successfully")
      fetchFunction()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Failed to delete item")
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "$0"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case "activity":
        return activities.length
      case "emails":
        return activities.filter((act) => act.activity_type === "Email").length
      case "calls":
        return activities.filter((act) => act.activity_type === "Call").length
      case "tasks":
        return activities.filter((act) => act.activity_type === "Task").length
      case "notes":
        return activities.filter((act) => act.activity_type === "Note").length
      case "files":
        return files.length
      case "deals":
        return deals.length
      case "tickets":
        return tickets.length
      default:
        return undefined
    }
  }

  const getTabLabel = (tab: (typeof TABS)[0]) => {
    const count = getTabCount(tab.id)
    return count !== undefined ? `${tab.label} (${count})` : tab.label
  }

  if (!customer) return null

	const SkeletonCompactView = () => (
		<div className="h-full flex flex-col">
			{/* Header - keep this real for immediate feedback */}
			<div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white flex-shrink-0">
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
						<X className="h-4 w-4" />
					</Button>
					<h2 className="text-lg font-semibold">Customer Details</h2>
				</div>
				<Button variant="ghost" size="sm" onClick={onToggleFullScreen} className="h-8 w-8 p-0">
					<Maximize className="h-4 w-4" />
				</Button>
			</div>
	
			{/* Scrollable skeleton content */}
			<div className="flex-1 overflow-y-auto">
				<div className="space-y-6 p-6">
					{/* Customer Header Skeleton */}
					<div className="flex items-center space-x-4 pb-4 border-b border-slate-200">
						<Skeleton className="h-16 w-16 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-5 w-20" />
						</div>
					</div>
	
					{/* AI Talking Points Skeleton */}
					<div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
						<Skeleton className="h-6 w-32 mb-3" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					</div>
	
					{/* Financial Overview Skeleton */}
					<div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
						<Skeleton className="h-6 w-40 mb-3" />
						<div className="space-y-2">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton key={i} className="h-4 w-48" />
							))}
						</div>
					</div>
	
					{/* Recent Activity Skeleton */}
					<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
						<Skeleton className="h-6 w-36 mb-3" />
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div key={i} className="space-y-1">
									<Skeleton className="h-3 w-32" />
									<Skeleton className="h-4 w-full" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);

  const renderCompactView = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Customer Details</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleFullScreen} className="h-8 w-8 p-0">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          {/* Customer Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-4 mb-3 sm:mb-0">
              <Avatar className="h-16 w-16 ring-2 ring-blue-200">
                <AvatarImage src="/placeholder.svg" alt={customer.name} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-medium">
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">{customer.name}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingCustomer(true)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-md text-slate-600">
                  {customer.title || "No title"} {customer.company && `at ${customer.company}`}
                </p>
                <div className="mt-1">
                  {customer.priority && (
                    <Badge
                      className={`text-xs font-semibold ${
                        customer.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : customer.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {customer.priority} Priority
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="text-sm text-slate-600 space-y-1 max-w-xs">
              {customer.email && (
                <a
                  href={`mailto:${customer.email}`}
                  className="flex items-center group hover:text-blue-600"
                  title={customer.email}
                >
                  <Mail className="h-3.5 w-3.5 mr-2 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </a>
              )}
              {customer.phone && (
                <a href={`tel:${customer.phone}`} className="flex items-center group hover:text-blue-600">
                  <Phone className="h-3.5 w-3.5 mr-2 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                  <span>{customer.phone}</span>
                </a>
              )}
              {customer.linkedin && (
                <a
                  href={`https://${customer.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center group hover:text-blue-600"
                >
                  <Linkedin className="h-3.5 w-3.5 mr-2 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {customer.address && (
                <div className="flex items-start group">
                  <MapPin className="h-3.5 w-3.5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="truncate" title={customer.address}>
                    {customer.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AI Talking Points */}
          {aiInsights.filter((i) => i.insight_type === "talking_tip").length > 0 && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                  Talking Tips
                </h4>
                <Button size="sm" variant="ghost" onClick={() => setShowNewInsight(true)} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <ul className="space-y-2">
                {aiInsights
                  .filter((i) => i.insight_type === "talking_tip")
                  .slice(0, 3)
                  .map((insight) => (
                    <li key={insight.id} className="flex items-start text-sm group">
                      <span className="text-amber-600 font-bold mr-2 text-lg leading-none mt-px">•</span>
                      <span className="text-slate-700 flex-1">{insight.content}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteItem("client_ai_insights", insight.id, fetchAIInsights)}
                        className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 ml-2"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
              </ul>
              <p className="text-xs text-slate-400 mt-3 italic">AI-generated based on recent interactions and profile.</p>
            </div>
          )}

          {/* Financial Overview */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-lg mb-3 text-slate-800">Financial Overview</h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {customer.staff && (
                <li className="flex items-center">
                  <User className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" />
                  Relationship Mgr: <span className="font-medium ml-1">{customer.staff}</span>
                </li>
              )}
              {customer.status && (
                <li className="flex items-center">
                  <Info className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" />
                  Status: <span className="font-medium ml-1">{customer.status}</span>
                </li>
              )}
              {customer.segment && (
                <li className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" />
                  Segment: <span className="font-medium ml-1">{customer.segment}</span>
                </li>
              )}
              {customer.total_assets_under_management && (
                <li className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" />
                  AUM: <span className="font-medium ml-1">{formatCurrency(customer.total_assets_under_management)}</span>
                </li>
              )}
              {customer.product_interests && customer.product_interests.length > 0 && (
                <li className="flex items-start">
                  <Paperclip className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0 mt-0.5" />
                  Product Interests: <span className="ml-1">{customer.product_interests.join(", ")}</span>
                </li>
              )}
              {customer.lastVisit && (
                <li className="flex items-center">
                  <Calendar className="h-4 w-4 mr-3 text-slate-500 flex-shrink-0" />
                  Last Visit: <span className="font-medium ml-1">{formatDate(customer.lastVisit)}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Recent Activity */}
          {activities.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg text-slate-800">Recent Activity</h4>
                <Button size="sm" variant="ghost" onClick={() => setShowNewActivity(true)} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                {activities.slice(0, 3).map((activity) => (
                  <li key={activity.id} className="border-b border-blue-200 last:border-b-0 pb-2 last:pb-0">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>
                        {activity.activity_type} • {formatDate(activity.activity_date)}
                      </span>
                      {activity.sentiment && (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                            activity.sentiment === "Positive"
                              ? "bg-green-100 text-green-700"
                              : activity.sentiment === "Negative"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {activity.sentiment}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">{activity.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-lg mb-3 text-slate-800">Internal Notes</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderFullScreenView = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt={customer.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{customer.name}</h2>
              <p className="text-sm text-slate-600">{customer.email}</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleFullScreen} className="h-8 w-8 p-0">
          <Minimize className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabbed Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-9 bg-slate-100 p-1 m-4 mb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 text-xs">
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{getTabLabel(tab)}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Customer Information
                      <Button size="sm" variant="outline" onClick={() => setIsEditingCustomer(true)}>
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-slate-600">Title</label>
                        <p>{customer.title || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">Company</label>
                        <p>{customer.company || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">Phone</label>
                        <p>{customer.phone || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">Priority</label>
                        <p>{customer.priority || "Not specified"}</p>
                      </div>
                    </div>
                    {customer.address && (
                      <div>
                        <label className="font-medium text-slate-600">Address</label>
                        <p className="text-sm">{customer.address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Insights Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                        AI Insights
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setShowNewInsight(true)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aiInsights.length > 0 ? (
                      <ul className="space-y-2">
                        {aiInsights.slice(0, 5).map((insight) => (
                          <li key={insight.id} className="flex items-start text-sm group">
                            <span className="text-amber-600 font-bold mr-2 text-lg leading-none mt-px">•</span>
                            <span className="text-slate-700 flex-1">{insight.content}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteItem("client_ai_insights", insight.id, fetchAIInsights)}
                              className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No AI insights available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Financial Overview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-slate-600">Status</label>
                        <p>{customer.status || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">Segment</label>
                        <p>{customer.segment || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">Relationship Manager</label>
                        <p>{customer.staff || "Not assigned"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">AUM</label>
                        <p>{formatCurrency(customer.total_assets_under_management)}</p>
                      </div>
                    </div>
                    {customer.product_interests && customer.product_interests.length > 0 && (
                      <div>
                        <label className="font-medium text-slate-600">Product Interests</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {customer.product_interests.map((interest, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Activity
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("activity")}>
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activities.length > 0 ? (
                      <ul className="space-y-3">
                        {activities.slice(0, 3).map((activity) => (
                          <li key={activity.id} className="border-b border-slate-200 last:border-b-0 pb-2 last:pb-0">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                              <span>
                                {activity.activity_type} • {formatDate(activity.activity_date)}
                              </span>
                              {activity.sentiment && (
                                <Badge
                                  variant={
                                    activity.sentiment === "Positive"
                                      ? "default"
                                      : activity.sentiment === "Negative"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {activity.sentiment}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{activity.description}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    All Activities
                    <Button onClick={() => setShowNewActivity(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{activity.activity_type}</Badge>
                              {activity.sentiment && (
                                <Badge
                                  variant={
                                    activity.sentiment === "Positive"
                                      ? "default"
                                      : activity.sentiment === "Negative"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {activity.sentiment}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500">{formatDate(activity.activity_date)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteItem("client_activities", activity.id, fetchActivities)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {activity.subject && <h4 className="font-medium mb-1">{activity.subject}</h4>}
                          <p className="text-sm text-slate-600">{activity.description}</p>
                          {activity.user_name && (
                            <p className="text-xs text-slate-400 mt-2">By: {activity.user_name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No activities found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emails" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Email Communications</CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.filter((act) => act.activity_type === "Email").length > 0 ? (
                    <div className="space-y-4">
                      {activities
                        .filter((act) => act.activity_type === "Email")
                        .map((email) => (
                          <div key={email.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{email.subject || "No Subject"}</h4>
                              <span className="text-sm text-slate-500">{formatDate(email.activity_date)}</span>
                            </div>
                            <p className="text-sm text-slate-600">{email.description}</p>
                            {email.user_name && <p className="text-xs text-slate-400 mt-2">From: {email.user_name}</p>}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No email communications found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calls" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Call History</CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.filter((act) => act.activity_type === "Call").length > 0 ? (
                    <div className="space-y-4">
                      {activities
                        .filter((act) => act.activity_type === "Call")
                        .map((call) => (
                          <div key={call.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{call.subject || "Phone Call"}</h4>
                              <div className="flex items-center gap-2">
                                {call.sentiment && (
                                  <Badge
                                    variant={
                                      call.sentiment === "Positive"
                                        ? "default"
                                        : call.sentiment === "Negative"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                  >
                                    {call.sentiment}
                                  </Badge>
                                )}
                                <span className="text-sm text-slate-500">{formatDate(call.activity_date)}</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">{call.description}</p>
                            {call.user_name && <p className="text-xs text-slate-400 mt-2">By: {call.user_name}</p>}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No call history found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.filter((act) => act.activity_type === "Task").length > 0 ? (
                    <div className="space-y-4">
                      {activities
                        .filter((act) => act.activity_type === "Task")
                        .map((task) => (
                          <div key={task.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{task.subject || "Task"}</h4>
                              <span className="text-sm text-slate-500">{formatDate(task.activity_date)}</span>
                            </div>
                            <p className="text-sm text-slate-600">{task.description}</p>
                            {task.user_name && <p className="text-xs text-slate-400 mt-2">Assigned to: {task.user_name}</p>}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No tasks found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.filter((act) => act.activity_type === "Note").length > 0 ? (
                    <div className="space-y-4">
                      {activities
                        .filter((act) => act.activity_type === "Note")
                        .map((note) => (
                          <div key={note.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{note.subject || "Note"}</h4>
                              <span className="text-sm text-slate-500">{formatDate(note.activity_date)}</span>
                            </div>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{note.description}</p>
                            {note.user_name && <p className="text-xs text-slate-400 mt-2">By: {note.user_name}</p>}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No notes found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Files & Documents
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {files.length > 0 ? (
                    <div className="space-y-4">
                      {files.map((file) => (
                        <div key={file.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4 text-slate-400" />
                              <h4 className="font-medium">{file.file_name}</h4>
                              <Badge variant="outline">{file.file_type}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500">{file.file_size}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteItem("client_files", file.id, fetchFiles)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {file.description && <p className="text-sm text-slate-600 mb-2">{file.description}</p>}
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Uploaded: {formatDate(file.created_at)}</span>
                            {file.uploaded_by && <span>By: {file.uploaded_by}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No files uploaded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deals" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Deals & Opportunities
                    <Button onClick={() => setShowNewDeal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Deal
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deals.length > 0 ? (
                    <div className="space-y-4">
                      {deals.map((deal) => (
                        <div key={deal.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{deal.deal_name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  deal.stage === "Closed Won"
                                    ? "default"
                                    : deal.stage === "Closed Lost"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {deal.stage}
                              </Badge>
                              <span className="font-semibold text-green-600">{formatCurrency(deal.amount)}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                            <div>
                              <span className="font-medium">Probability:</span> {deal.probability}%
                            </div>
                            <div>
                              <span className="font-medium">Owner:</span> {deal.owner}
                            </div>
                            <div>
                              <span className="font-medium">Expected Close:</span> {formatDate(deal.expected_close_date)}
                            </div>
                            {deal.actual_close_date && (
                              <div>
                                <span className="font-medium">Actual Close:</span> {formatDate(deal.actual_close_date)}
                              </div>
                            )}
                          </div>
                          {deal.description && <p className="text-sm text-slate-600 mt-2">{deal.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No deals found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Support Tickets
                    <Button onClick={() => setShowNewTicket(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ticket
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tickets.length > 0 ? (
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{ticket.subject}</h4>
                              <Badge variant="outline">{ticket.ticket_number}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  ticket.priority === "Urgent" || ticket.priority === "High"
                                    ? "destructive"
                                    : ticket.priority === "Normal"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {ticket.priority}
                              </Badge>
                              <Badge
                                variant={
                                  ticket.status === "Resolved" || ticket.status === "Closed"
                                    ? "default"
                                    : ticket.status === "In Progress"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {ticket.status}
                              </Badge>
                            </div>
                          </div>
                          {ticket.description && <p className="text-sm text-slate-600 mb-2">{ticket.description}</p>}
                          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                            <div>Created: {formatDate(ticket.created_at)}</div>
                            <div>Updated: {formatDate(ticket.updated_at)}</div>
                            {ticket.assigned_to && <div>Assigned to: {ticket.assigned_to}</div>}
                            {ticket.resolved_at && <div>Resolved: {formatDate(ticket.resolved_at)}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">No support tickets found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose} direction="right">
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
    <Drawer.Content
      className={`bg-white h-full fixed top-0 right-0 z-50 outline-none overflow-hidden ${
        isFullScreen ? "w-full" : "w-full max-w-2xl"
      }`}
    >
      {isFullScreen ? renderFullScreenView() : renderCompactView()}
    </Drawer.Content>
  </Drawer.Portal>

  {/* Edit Customer Dialog */}
  <Dialog open={isEditingCustomer} onOpenChange={setIsEditingCustomer}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Customer Information</DialogTitle>
      </DialogHeader>
      {editedCustomer && (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editedCustomer.name}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editedCustomer.email || ""}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={editedCustomer.phone || ""}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editedCustomer.title || ""}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <Input
                value={editedCustomer.company || ""}
                onChange={(e) => setEditedCustomer({ ...editedCustomer, company: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={editedCustomer.priority || ""}
                onValueChange={(value) => setEditedCustomer({ ...editedCustomer, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <Textarea
              value={editedCustomer.address || ""}
              onChange={(e) => setEditedCustomer({ ...editedCustomer, address: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium">LinkedIn</label>
            <Input
              value={editedCustomer.linkedin || ""}
              onChange={(e) => setEditedCustomer({ ...editedCustomer, linkedin: e.target.value })}
              placeholder="linkedin.com/in/username"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={editedCustomer.notes || ""}
              onChange={(e) => setEditedCustomer({ ...editedCustomer, notes: e.target.value })}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditingCustomer(false)}>
              Cancel
            </Button>
            <Button onClick={updateCustomer} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>

  {/* Add Activity Dialog */}
  <Dialog open={showNewActivity} onOpenChange={setShowNewActivity}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Activity</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          addActivity({
            activity_type: formData.get("type") as string,
            subject: formData.get("subject") as string,
            description: formData.get("description") as string,
            sentiment: formData.get("sentiment") as string,
            user_name: formData.get("user_name") as string,
          })
        }}
        className="space-y-4 mt-4"
      >
        <div>
          <label className="text-sm font-medium">Type</label>
          <Select name="type" required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Subject</label>
          <Input name="subject" placeholder="Activity subject" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea name="description" required placeholder="Describe the activity..." rows={3} />
        </div>
        <div>
          <label className="text-sm font-medium">Sentiment</label>
          <Select name="sentiment">
            <SelectTrigger>
              <SelectValue placeholder="Select sentiment" />
            </SelectTrigger>
            <SelectContent>
              {SENTIMENTS.map((sentiment) => (
                <SelectItem key={sentiment} value={sentiment}>
                  {sentiment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Your Name</label>
          <Input name="user_name" placeholder="Enter your name" />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowNewActivity(false)}>
            Cancel
          </Button>
          <Button type="submit">Add Activity</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>

  {/* Add Deal Dialog */}
  <Dialog open={showNewDeal} onOpenChange={setShowNewDeal}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Deal</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          addDeal({
            deal_name: formData.get("deal_name") as string,
            stage: formData.get("stage") as string,
            amount: Number.parseFloat(formData.get("amount") as string) || 0,
            probability: Number.parseInt(formData.get("probability") as string) || 50,
            expected_close_date: formData.get("expected_close_date") as string,
            owner: formData.get("owner") as string,
            description: formData.get("description") as string,
          })
        }}
        className="space-y-4 mt-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Deal Name</label>
            <Input name="deal_name" required placeholder="Enter deal name" />
          </div>
          <div>
            <label className="text-sm font-medium">Stage</label>
            <Select name="stage" required>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {DEAL_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Amount ($)</label>
            <Input name="amount" type="number" placeholder="0" />
          </div>
          <div>
            <label className="text-sm font-medium">Probability (%)</label>
            <Input name="probability" type="number" min="0" max="100" placeholder="50" />
          </div>
          <div>
            <label className="text-sm font-medium">Expected Close Date</label>
            <Input name="expected_close_date" type="date" />
          </div>
          <div>
            <label className="text-sm font-medium">Owner</label>
            <Input name="owner" placeholder="Deal owner" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea name="description" placeholder="Describe the deal..." rows={3} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setShowNewDeal(false)}>
            Cancel
          </Button>
          <Button type="submit">Add Deal</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</Drawer.Root>
	)}