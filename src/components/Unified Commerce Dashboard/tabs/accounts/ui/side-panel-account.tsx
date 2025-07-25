"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Maximize,
  Mail,
  Phone,
  Linkedin,
  TrendingUp,
  Info,
  X,
  Trash2,
  MessageCircle,
  MoreHorizontal,
  Star,
} from "lucide-react";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  SignalIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  TagIcon,
  PaperClipIcon,
  InformationCircleIcon,
  LightBulbIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon,
  TrashIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  ChartBarIcon,
  CalendarIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Customer } from "@/lib/supabase/customer";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { Skeleton } from "@/components/ui/skeleton";

interface DetailedSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onCustomerUpdate?: (updatedCustomer: Customer) => void;
}

interface AIInsight {
  id: string;
  client_id: string;
  insight_type: string;
  content: string;
  confidence_score: number;
  is_active: boolean;
  created_at: string;
}

interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  subject?: string;
  description: string;
  activity_date: string;
  sentiment?: string;
  user_name?: string;
  metadata?: any;
}

interface Deal {
  id: string;
  client_id: string;
  deal_name: string;
  stage: string;
  amount: number;
  probability: number;
  expected_close_date: string;
  actual_close_date?: string;
  owner: string;
  description?: string;
}

interface Ticket {
  id: string;
  client_id: string;
  ticket_number: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

interface ClientFile {
  id: string;
  client_id: string;
  file_name: string;
  file_type: string;
  file_size: string;
  file_url?: string;
  description?: string;
  uploaded_by?: string;
  tags?: string[];
  created_at: string;
}

// Place this inside DetailedSidePanel.tsx

// This list should be shared with your warming agent to ensure consistency
const CADENCE_OPTIONS = [
  "LeadEngagement",
  "NewClientOnboarding",
  "RenewalPush",
  "StandardNurture",
  "ReEngagement",
];

// Helper to format date for an <input type="date">
const formatDateForInput = (dateString: string | null | undefined) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

interface CadenceInfoProps {
  customer: Customer; // Using the Customer type here
  isEditing: boolean;
  onChange: (field: keyof Customer | "Expiration Date", value: any) => void;
  formatDate: (date: string | null) => string; // Pass formatDate as a prop
}

function CadenceInfo({
  customer,
  isEditing,
  onChange,
  formatDate,
}: CadenceInfoProps) {
  if (isEditing) {
    // --- EDITING VIEW ---
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Cadence</label>
          <Select
            value={customer.current_cadence_name || "None"}
            onValueChange={(value) =>
              onChange("current_cadence_name", value === "None" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None (Stop Cadence)</SelectItem>
              {CADENCE_OPTIONS.map((cadence) => (
                <SelectItem key={cadence} value={cadence}>
                  {cadence}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Next Contact Date</label>
          <Input
            type="date"
            value={formatDateForInput(customer.next_contact_date)}
            onChange={(e) =>
              onChange(
                "next_contact_date",
                e.target.valueAsDate?.toISOString() || null,
              )
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            Contract Expiration Date
          </label>
          <Input
            type="date"
            value={formatDateForInput(customer["Expiration Date"])}
            onChange={(e) =>
              onChange(
                "Expiration Date",
                e.target.valueAsDate?.toISOString() || null,
              )
            }
          />
        </div>
      </div>
    );
  }

  // --- DISPLAY VIEW ---
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-600">Cadence:</span>
        <span className="font-medium">
          {customer.current_cadence_name || "None"}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Last Contact:</span>
        <span className="font-medium">
          {formatDate(customer.last_contact_date)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Next Contact:</span>
        <span className="font-medium">
          {formatDate(customer.next_contact_date)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Expires On:</span>
        <span className="font-medium">
          {formatDate(customer["Expiration Date"])}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Messages Sent:</span>
        <span className="font-medium">
          {customer.total_messages_count || 0}
        </span>
      </div>
    </div>
  );
}

const TABS = [
  { id: "overview", label: "Overview", icon: UserIcon },
  { id: "activity", label: "Activity", icon: ChartBarIcon },
  { id: "emails", label: "Emails", icon: EnvelopeIcon },
  { id: "calls", label: "Calls", icon: PhoneIcon },
  { id: "tasks", label: "Tasks", icon: BriefcaseIcon },
  { id: "notes", label: "Notes", icon: DocumentTextIcon },
  { id: "files", label: "Files", icon: PaperClipIcon },
  { id: "deals", label: "Deals", icon: CurrencyDollarIcon },
  { id: "tickets", label: "Tickets", icon: TagIcon },
];

const ACTIVITY_TYPES = ["Email", "Call", "Meeting", "Task", "Note"];
const SENTIMENTS = ["Positive", "Neutral", "Negative"];
const DEAL_STAGES = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];
const TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];
const TICKET_PRIORITIES = ["Low", "Normal", "High", "Urgent"];

export default function DetailedSidePanel({
  isOpen,
  onClose,
  customer,
  isFullScreen,
  onToggleFullScreen,
  onCustomerUpdate,
}: DetailedSidePanelProps) {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [files, setFiles] = useState<ClientFile[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for adding new items
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showNewInsight, setShowNewInsight] = useState(false);

  const fetchAIInsights = async () => {
    if (!customer) return;
    const { data, error } = await supabase
      .from("client_ai_insights")
      .select("*")
      .eq("client_id", customer.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching AI insights:", error);
    else setAiInsights(data || []);
  };

  const fetchActivities = async () => {
    if (!customer) return;
    const { data, error } = await supabase
      .from("client_activities")
      .select("*")
      .eq("client_id", customer.id)
      .order("activity_date", { ascending: false })
      .limit(50);

    if (error) console.error("Error fetching activities:", error);
    else setActivities(data || []);
  };

  const fetchDeals = async () => {
    if (!customer) return;
    const { data, error } = await supabase
      .from("client_deals")
      .select("*")
      .eq("client_id", customer.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching deals:", error);
    else setDeals(data || []);
  };

  const fetchTickets = async () => {
    if (!customer) return;
    const { data, error } = await supabase
      .from("client_tickets")
      .select("*")
      .eq("client_id", customer.id)
      .order("updated_at", { ascending: false });

    if (error) console.error("Error fetching tickets:", error);
    else setTickets(data || []);
  };

  const fetchFiles = async () => {
    if (!customer) return;
    const { data, error } = await supabase
      .from("client_files")
      .select("*")
      .eq("client_id", customer.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching files:", error);
    else setFiles(data || []);
  };

  const fetchAllData = useCallback(async () => {
    if (!customer) return;

    setIsDataLoading(true);
    try {
      await Promise.all([
        fetchAIInsights(),
        fetchActivities(),
        fetchDeals(),
        fetchTickets(),
        fetchFiles(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load customer data");
    } finally {
      setIsDataLoading(false);
    }
  }, [customer]);

  // Reset data when customer changes and immediately start loading
  useEffect(() => {
    if (customer && isOpen) {
      // Reset all data immediately
      setAiInsights([]);
      setActivities([]);
      setDeals([]);
      setTickets([]);
      setFiles([]);
      setEditedCustomer(customer);

      // Start loading data
      fetchAllData();
    }
  }, [customer, isOpen, fetchAllData]);

  const updateCustomer = async () => {
    if (!editedCustomer || !customer) return;

    setIsSaving(true);
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
          total_assets_under_management:
            editedCustomer.total_assets_under_management,
          product_interests: editedCustomer.product_interests,
        })
        .eq("Client ID", customer.id);

      if (error) throw error;

      toast.success("Customer information updated successfully");
      setIsEditingCustomer(false);
      if (onCustomerUpdate) {
        onCustomerUpdate(editedCustomer);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer information");
    } finally {
      setIsSaving(false);
    }
  };

  const addActivity = async (activityData: Partial<ClientActivity>) => {
    if (!customer) return;

    try {
      const { error } = await supabase.from("client_activities").insert({
        client_id: customer.id,
        ...activityData,
        activity_date: activityData.activity_date || new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Activity added successfully");
      setShowNewActivity(false);
      fetchActivities();
    } catch (error) {
      console.error("Error adding activity:", error);
      toast.error("Failed to add activity");
    }
  };

  const addDeal = async (dealData: Partial<Deal>) => {
    if (!customer) return;

    try {
      const { error } = await supabase.from("client_deals").insert({
        client_id: customer.id,
        ...dealData,
      });

      if (error) throw error;

      toast.success("Deal added successfully");
      setShowNewDeal(false);
      fetchDeals();
    } catch (error) {
      console.error("Error adding deal:", error);
      toast.error("Failed to add deal");
    }
  };

  const addTicket = async (ticketData: Partial<Ticket>) => {
    if (!customer) return;

    try {
      const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("client_tickets").insert({
        client_id: customer.id,
        ticket_number: ticketNumber,
        ...ticketData,
      });

      if (error) throw error;

      toast.success("Ticket created successfully");
      setShowNewTicket(false);
      fetchTickets();
    } catch (error) {
      console.error("Error adding ticket:", error);
      toast.error("Failed to create ticket");
    }
  };

  const addInsight = async (insightData: Partial<AIInsight>) => {
    if (!customer) return;

    try {
      const { error } = await supabase.from("client_ai_insights").insert({
        client_id: customer.id,
        insight_type: "talking_tip",
        confidence_score: 0.85,
        is_active: true,
        ...insightData,
      });

      if (error) throw error;

      toast.success("Insight added successfully");
      setShowNewInsight(false);
      fetchAIInsights();
    } catch (error) {
      console.error("Error adding insight:", error);
      toast.error("Failed to add insight");
    }
  };

  const deleteItem = async (
    table: string,
    id: string,
    fetchFunction: () => void,
  ) => {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;

      toast.success("Item deleted successfully");
      fetchFunction();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case "activity":
        return activities.length;
      case "emails":
        return activities.filter((act) => act.activity_type === "Email").length;
      case "calls":
        return activities.filter((act) => act.activity_type === "Call").length;
      case "tasks":
        return activities.filter((act) => act.activity_type === "Task").length;
      case "notes":
        return activities.filter((act) => act.activity_type === "Note").length;
      case "files":
        return files.length;
      case "deals":
        return deals.length;
      case "tickets":
        return tickets.length;
      default:
        return undefined;
    }
  };

  const getTabLabel = (tab: (typeof TABS)[0]) => {
    const count = getTabCount(tab.id);
    return count !== undefined ? `${tab.label} (${count})` : tab.label;
  };

  if (!customer) return null;

  const SkeletonCompactView = () => (
    <div className="flex h-full flex-col">
      {/* Header - keep this real for immediate feedback */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-neutral-50 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ChevronDoubleRightIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onToggleFullScreen}
            className="h-8 w-8 p-0"
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Client Details</h2>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="default"
            size="sm"
            className="h-8 px-3 text-slate-600 hover:text-slate-900"
          >
            Share
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
          >
            <StarIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Scrollable skeleton content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          {/* Customer Header Skeleton */}
          <div className="flex items-center space-x-4 border-b border-slate-200 pb-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          {/* AI Talking Points Skeleton */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <Skeleton className="mb-3 h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Financial Overview Skeleton */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <Skeleton className="mb-3 h-6 w-40" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4 w-48" />
              ))}
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Skeleton className="mb-3 h-6 w-36" />
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-neutral-50 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ChevronDoubleRightIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onToggleFullScreen}
            className="h-8 w-8 p-0"
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Client Details</h2>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-slate-600 hover:text-slate-900"
          >
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
          >
            <StarIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          {/* Customer Header */}
          <div className="flex flex-col border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="mb-3 flex items-center space-x-4 sm:mb-0">
              <Avatar className="h-16 w-16 ring-2 ring-blue-200">
                <AvatarImage src="/placeholder.svg" alt={customer.name} />
                <AvatarFallback className="bg-blue-100 text-2xl font-medium text-blue-700">
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {customer.name}
                  </h3>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setIsEditingCustomer(true)}
                    className="h-6 w-6 p-0"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-md text-slate-600">
                  {customer.title || "No title"}{" "}
                  {customer.company && `at ${customer.company}`}
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

            <div className="max-w-xs space-y-1 text-sm text-slate-600">
              {customer.email && (
                <a
                  href={`mailto:${customer.email}`}
                  className="group flex items-center hover:text-blue-600"
                  title={customer.email}
                >
                  <EnvelopeIcon className="mr-2 h-3.5 w-3.5 flex-shrink-0 text-slate-400 group-hover:text-blue-500" />
                  <span className="truncate">{customer.email}</span>
                </a>
              )}
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="group flex items-center hover:text-blue-600"
                >
                  <PhoneIcon className="mr-2 h-3.5 w-3.5 flex-shrink-0 text-slate-400 group-hover:text-blue-500" />
                  <span>{customer.phone}</span>
                </a>
              )}
              {customer.linkedin && (
                <a
                  href={`https://${customer.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center hover:text-blue-600"
                >
                  <Linkedin className="mr-2 h-3.5 w-3.5 flex-shrink-0 text-slate-400 group-hover:text-blue-500" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {customer.address && (
                <div className="group flex items-start">
                  <MapPinIcon className="mr-2 mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  <span className="truncate" title={customer.address}>
                    {customer.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AI Talking Points */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center text-lg font-semibold text-gray-800">
                <LightBulbIcon className="mr-2 h-5 w-5 text-neutral-500" />
                Talking Tips
              </h4>
              <Button
                size="sm"
                variant="default"
                onClick={() => setShowNewInsight(true)}
                className="h-7 text-xs"
              >
                <PlusIcon className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
            {isDataLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : aiInsights.filter((i) => i.insight_type === "talking_tip")
                .length > 0 ? (
              <>
                <ul className="space-y-2">
                  {aiInsights
                    .filter((i) => i.insight_type === "talking_tip")
                    .slice(0, 3)
                    .map((insight) => (
                      <li
                        key={insight.id}
                        className="group flex items-start text-sm"
                      >
                        <span className="mr-2 mt-px text-lg font-bold leading-none text-neutral-600">
                          •
                        </span>
                        <span className="flex-1 text-slate-700">
                          {insight.content}
                        </span>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            deleteItem(
                              "client_ai_insights",
                              insight.id,
                              fetchAIInsights,
                            )
                          }
                          className="ml-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                </ul>
                <p className="mt-3 text-xs italic text-slate-400">
                  AI-generated based on recent interactions and profile.
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No talking tips available
              </p>
            )}
          </div>

          {/* Financial Overview */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-3 text-lg font-semibold text-slate-800">
              Client Overview
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              {customer.staff && (
                <li className="flex items-center">
                  <UserIcon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
                  Relationship Mgr:{" "}
                  <span className="ml-1 font-medium">{customer.staff}</span>
                </li>
              )}
              {customer.status && (
                <li className="flex items-center">
                  <InformationCircleIcon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
                  Status:{" "}
                  <span className="ml-1 font-medium">{customer.status}</span>
                </li>
              )}
              {customer.segment && (
                <li className="flex items-center">
                  <TrendingUp className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
                  Segment:{" "}
                  <span className="ml-1 font-medium">{customer.segment}</span>
                </li>
              )}
              {customer.total_assets_under_management && (
                <li className="flex items-center">
                  <CurrencyDollarIcon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
                  AUM:{" "}
                  <span className="ml-1 font-medium">
                    {formatCurrency(customer.total_assets_under_management)}
                  </span>
                </li>
              )}
              {customer.product_interests &&
                customer.product_interests.length > 0 && (
                  <li className="flex items-start">
                    <PaperClipIcon className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500" />
                    Product Interests:{" "}
                    <span className="ml-1">
                      {customer.product_interests.join(", ")}
                    </span>
                  </li>
                )}
              {customer.lastVisit && (
                <li className="flex items-center">
                  <CalendarIcon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-500" />
                  Last Visit:{" "}
                  <span className="ml-1 font-medium">
                    {formatDate(customer.lastVisit)}
                  </span>
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h4 className="mb-3 text-lg font-semibold text-slate-800">
              Cadance Status
            </h4>
            <CadenceInfo
              customer={customer}
              isEditing={false}
              onChange={() => {}} // No-op for display view
              formatDate={formatDate}
            />
          </div>
          {/* Recent Activity */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-800">
                Recent Activity
              </h4>
              <Button
                size="sm"
                variant="default"
                onClick={() => setShowNewActivity(true)}
                className="h-7 text-xs"
              >
                <PlusIcon className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
            {isDataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <ul className="space-y-3 text-sm text-slate-700">
                {activities.slice(0, 3).map((activity) => (
                  <li
                    key={activity.id}
                    className="border-b border-blue-200 pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {activity.activity_type} •{" "}
                        {formatDate(activity.activity_date)}
                      </span>
                      {activity.sentiment && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
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
            ) : (
              <p className="text-sm text-slate-500">No recent activity</p>
            )}
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="mb-3 text-lg font-semibold text-slate-800">
                Internal Notes
              </h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {customer.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFullScreenView = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ChevronDoubleRightIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt={customer.name} />
              <AvatarFallback className="bg-blue-100 text-sm font-medium text-blue-700">
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
        <Button
          variant="default"
          size="sm"
          onClick={onToggleFullScreen}
          className="h-8 w-8 p-0"
        >
          <ArrowsPointingInIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabbed Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex h-full flex-col"
        >
          <TabsList className="m-4 mb-0 grid w-full grid-cols-9 bg-slate-100 p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1 text-xs"
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{getTabLabel(tab)}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Customer Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Customer Information
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setIsEditingCustomer(true)}
                      >
                        <PencilIcon className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-slate-600">
                          Title
                        </label>
                        <p>{customer.title || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">
                          Company
                        </label>
                        <p>{customer.company || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">
                          Phone
                        </label>
                        <p>{customer.phone || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">
                          Priority
                        </label>
                        <p>{customer.priority || "Not specified"}</p>
                      </div>
                    </div>
                    {customer.address && (
                      <div>
                        <label className="font-medium text-slate-600">
                          Address
                        </label>
                        <p className="text-sm">{customer.address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* --- CADENCE & AUTOMATION --- */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Cadence & Automation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* 
        This component dynamically switches between displaying text and showing
        editable form fields based on the `isEditingCustomer` state.
      */}
                    {editedCustomer && (
                      <CadenceInfo
                        customer={editedCustomer}
                        isEditing={isEditingCustomer}
                        onChange={(field, value) => {
                          setEditedCustomer((prev) =>
                            prev ? { ...prev, [field]: value } : null,
                          );
                        }}
                        formatDate={formatDate}
                      />
                    )}
                  </CardContent>
                </Card>
                {/* AI Insights Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <LightBulbIcon className="mr-2 h-5 w-5 text-neutral-500" />
                        AI Insights
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setShowNewInsight(true)}
                      >
                        <PlusIcon className="mr-1 h-3 w-3" />
                        Add
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isDataLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-4 w-full" />
                        ))}
                      </div>
                    ) : aiInsights.length > 0 ? (
                      <ul className="space-y-2">
                        {aiInsights.slice(0, 5).map((insight) => (
                          <li
                            key={insight.id}
                            className="group flex items-start text-sm"
                          >
                            <span className="mr-2 mt-px text-lg font-bold leading-none text-neutral-600">
                              •
                            </span>
                            <span className="flex-1 text-slate-700">
                              {insight.content}
                            </span>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                deleteItem(
                                  "client_ai_insights",
                                  insight.id,
                                  fetchAIInsights,
                                )
                              }
                              className="ml-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No AI insights available
                      </p>
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
                        <label className="font-medium text-slate-600">
                          Status
                        </label>
                        <p>{customer.status || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">
                          Segment
                        </label>
                        <p>{customer.segment || "Not specified"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">
                          Relationship Manager
                        </label>
                        <p>{customer.staff || "Not assigned"}</p>
                      </div>
                      <div>
                        <label className="font-medium text-slate-600">
                          AUM
                        </label>
                        <p>
                          {formatCurrency(
                            customer.total_assets_under_management,
                          )}
                        </p>
                      </div>
                    </div>
                    {customer.product_interests &&
                      customer.product_interests.length > 0 && (
                        <div>
                          <label className="font-medium text-slate-600">
                            Product Interests
                          </label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {customer.product_interests.map(
                              (interest, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {interest}
                                </Badge>
                              ),
                            )}
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
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setActiveTab("activity")}
                      >
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isDataLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-1">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : activities.length > 0 ? (
                      <ul className="space-y-3">
                        {activities.slice(0, 3).map((activity) => (
                          <li
                            key={activity.id}
                            className="border-b border-slate-200 pb-2 last:border-b-0 last:pb-0"
                          >
                            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                              <span>
                                {activity.activity_type} •{" "}
                                {formatDate(activity.activity_date)}
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
                            <p className="text-sm text-slate-600">
                              {activity.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">
                        No recent activity
                      </p>
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
                      <PlusIcon className="mr-2 h-5 w-5" />
                      Add Activity
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {activity.activity_type}
                              </Badge>
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
                              <span className="text-sm text-slate-500">
                                {formatDate(activity.activity_date)}
                              </span>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  deleteItem(
                                    "client_activities",
                                    activity.id,
                                    fetchActivities,
                                  )
                                }
                              >
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {activity.subject && (
                            <h4 className="mb-1 font-medium">
                              {activity.subject}
                            </h4>
                          )}
                          <p className="text-sm text-slate-600">
                            {activity.description}
                          </p>
                          {activity.user_name && (
                            <p className="mt-2 text-xs text-slate-400">
                              By: {activity.user_name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-slate-500">
                      No activities found
                    </p>
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
                  {isDataLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <Skeleton className="mb-2 h-4 w-48" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="mt-2 h-3 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : activities.filter((act) => act.activity_type === "Email")
                      .length > 0 ? (
                    <div className="space-y-4">
                      {activities
                        .filter((act) => act.activity_type === "Email")
                        .map((email) => (
                          <div
                            key={email.id}
                            className="rounded-lg border border-slate-200 p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-medium">
                                {email.subject || "No Subject"}
                              </h4>
                              <span className="text-sm text-slate-500">
                                {formatDate(email.activity_date)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              {email.description}
                            </p>
                            {email.user_name && (
                              <p className="mt-2 text-xs text-slate-400">
                                From: {email.user_name}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-slate-500">
                      No email communications found
                    </p>
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
                  {isDataLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <Skeleton className="mb-2 h-4 w-32" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="mt-2 h-3 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : activities.filter((act) => act.activity_type === "Call")
                      .length > 0 ? (
                    <div className="space-y-4">
                      {activities
                        .filter((act) => act.activity_type === "Call")
                        .map((call) => (
                          <div
                            key={call.id}
                            className="rounded-lg border border-slate-200 p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-medium">
                                {call.subject || "Phone Call"}
                              </h4>
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
                                <span className="text-sm text-slate-500">
                                  {formatDate(call.activity_date)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">
                              {call.description}
                            </p>
                            {call.user_name && (
                              <p className="mt-2 text-xs text-slate-400">
                                By: {call.user_name}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-slate-500">
                      No call history found
                    </p>
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
                  {isDataLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <Skeleton className="mb-2 h-4 w-24" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="mt-2 h-3 w-32" />
                        </div>
                      ))}
                    </div>
                  ) : activities.filter((act) => act.activity_type === "Task")
                      .length > 0 ? (
                    <div className="space-y-4">
                      {activities
                        .filter((act) => act.activity_type === "Task")
                        .map((task) => (
                          <div
                            key={task.id}
                            className="rounded-lg border border-slate-200 p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-medium">
                                {task.subject || "Task"}
                              </h4>
                              <span className="text-sm text-slate-500">
                                {formatDate(task.activity_date)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              {task.description}
                            </p>
                            {task.user_name && (
                              <p className="mt-2 text-xs text-slate-400">
                                Assigned to: {task.user_name}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-slate-500">
                      No tasks found
                    </p>
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
                  {isDataLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <Skeleton className="mb-2 h-4 w-20" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="mt-2 h-3 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : activities.filter((act) => act.activity_type === "Note")
                      .length > 0 ? (
                    <div className="space-y-4">
                      {activities
                        .filter((act) => act.activity_type === "Note")
                        .map((note) => (
                          <div
                            key={note.id}
                            className="rounded-lg border border-slate-200 p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-medium">
                                {note.subject || "Note"}
                              </h4>
                              <span className="text-sm text-slate-500">
                                {formatDate(note.activity_date)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm text-slate-600">
                              {note.description}
                            </p>
                            {note.user_name && (
                              <p className="mt-2 text-xs text-slate-400">
                                By: {note.user_name}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-slate-500">
                      No notes found
                    </p>
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
                      <PlusIcon className="mr-2 h-5 w-5" />
                      Upload File
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <Skeleton className="mb-2 h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      ))}
                    </div>
                  ) : files.length > 0 ? (
                    <div className="space-y-4">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <PaperClipIcon className="h-5 w-5 text-slate-400" />
                              <h4 className="font-medium">{file.file_name}</h4>
                              <Badge variant="outline">{file.file_type}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500">
                                {file.file_size}
                              </span>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  deleteItem(
                                    "client_files",
                                    file.id,
                                    fetchFiles,
                                  )
                                }
                              >
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {file.description && (
                            <p className="mb-2 text-sm text-slate-600">
                              {file.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Uploaded: {formatDate(file.created_at)}</span>
                            {file.uploaded_by && (
                              <span>By: {file.uploaded_by}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-slate-500">
                      No files uploaded
                    </p>
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
                      <PlusIcon className="mr-2 h-5 w-5" />
                      Add Deal
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <Skeleton className="mb-2 h-4 w-32" />
                          <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((j) => (
                              <Skeleton key={j} className="h-3 w-24" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : deals.length > 0 ? (
                    <div className="space-y-4">
                      {deals.map((deal) => (
                        <div
                          key={deal.id}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
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
                              <span className="font-semibold text-green-600">
                                {formatCurrency(deal.amount)}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                            <div>
                              <span className="font-medium">Probability:</span>{" "}
                              {deal.probability}%
                            </div>
                            <div>
                              <span className="font-medium">Owner:</span>{" "}
                              {deal.owner}
                            </div>
                            <div>
                              <span className="font-medium">
                                Expected Close:
                              </span>{" "}
                              {formatDate(deal.expected_close_date)}
                            </div>
                            {deal.actual_close_date && (
                              <div>
                                <span className="font-medium">
                                  Actual Close:
                                </span>{" "}
                                {formatDate(deal.actual_close_date)}
                              </div>
                            )}
                          </div>
                          {deal.description && (
                            <p className="mt-2 text-sm text-slate-600">
                              {deal.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-slate-500">
                      No deals found
                    </p>
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
                      <PlusIcon className="mr-2 h-5 w-5" />
                      Create Ticket
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <Skeleton className="mb-2 h-4 w-48" />
                          <Skeleton className="h-4 w-full" />
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((j) => (
                              <Skeleton key={j} className="h-3 w-20" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : tickets.length > 0 ? (
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{ticket.subject}</h4>
                              <Badge variant="outline">
                                {ticket.ticket_number}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  ticket.priority === "Urgent" ||
                                  ticket.priority === "High"
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
                                  ticket.status === "Resolved" ||
                                  ticket.status === "Closed"
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
                          {ticket.description && (
                            <p className="mb-2 text-sm text-slate-600">
                              {ticket.description}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                            <div>Created: {formatDate(ticket.created_at)}</div>
                            <div>Updated: {formatDate(ticket.updated_at)}</div>
                            {ticket.assigned_to && (
                              <div>Assigned to: {ticket.assigned_to}</div>
                            )}
                            {ticket.resolved_at && (
                              <div>
                                Resolved: {formatDate(ticket.resolved_at)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-slate-500">
                      No support tickets found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onClose}
      direction="right"
     modal={true} // ← Change to true (or remove since true is default)
  dismissible={true}
  
    >
      <Drawer.Portal>
        <Drawer.Content
          className={`fixed right-0 top-0 z-50 h-full overflow-hidden bg-neutral-50 outline-none ${
            isFullScreen ? "w-full" : "w-full max-w-2xl"
          }`}
        >
          {/* Show skeleton only when data is loading, otherwise show the appropriate view */}
          {isDataLoading ? (
            <SkeletonCompactView />
          ) : isFullScreen ? (
            renderFullScreenView()
          ) : (
            renderCompactView()
          )}
        </Drawer.Content>
      </Drawer.Portal>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditingCustomer} onOpenChange={setIsEditingCustomer}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer Information</DialogTitle>
          </DialogHeader>
          {editedCustomer && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editedCustomer.name}
                    onChange={(e) =>
                      setEditedCustomer({
                        ...editedCustomer,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={editedCustomer.email || ""}
                    onChange={(e) =>
                      setEditedCustomer({
                        ...editedCustomer,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={editedCustomer.phone || ""}
                    onChange={(e) =>
                      setEditedCustomer({
                        ...editedCustomer,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editedCustomer.title || ""}
                    onChange={(e) =>
                      setEditedCustomer({
                        ...editedCustomer,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    value={editedCustomer.company || ""}
                    onChange={(e) =>
                      setEditedCustomer({
                        ...editedCustomer,
                        company: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={editedCustomer.priority || ""}
                    onValueChange={(value) =>
                      setEditedCustomer({ ...editedCustomer, priority: value })
                    }
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
                <div className="mt-6 space-y-4 border-t pt-4">
                  <h3 className="text-md font-semibold text-slate-800">
                    Automation Settings
                  </h3>
                  {/*
          Here we reuse the same component, but we tell it we're editing.
          It's already hooked up to the `editedCustomer` state.
        */}
                  <CadenceInfo
                    customer={editedCustomer}
                    isEditing={true}
                    onChange={(field, value) => {
                      setEditedCustomer((prev) =>
                        prev ? { ...prev, [field]: value } : null,
                      );
                    }}
                    formatDate={formatDate}
                  />
                </div>

                <label className="text-sm font-medium">Address</label>
                <Textarea
                  value={editedCustomer.address || ""}
                  onChange={(e) =>
                    setEditedCustomer({
                      ...editedCustomer,
                      address: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">LinkedIn</label>
                <Input
                  value={editedCustomer.linkedin || ""}
                  onChange={(e) =>
                    setEditedCustomer({
                      ...editedCustomer,
                      linkedin: e.target.value,
                    })
                  }
                  placeholder="linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={editedCustomer.notes || ""}
                  onChange={(e) =>
                    setEditedCustomer({
                      ...editedCustomer,
                      notes: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="default"
                  onClick={() => setIsEditingCustomer(false)}
                >
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
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addActivity({
                activity_type: formData.get("type") as string,
                subject: formData.get("subject") as string,
                description: formData.get("description") as string,
                sentiment: formData.get("sentiment") as string,
                user_name: formData.get("user_name") as string,
              });
            }}
            className="mt-4 space-y-4"
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
              <Textarea
                name="description"
                required
                placeholder="Describe the activity..."
                rows={3}
              />
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
              <Button
                type="button"
                variant="default"
                onClick={() => setShowNewActivity(false)}
              >
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
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addDeal({
                deal_name: formData.get("deal_name") as string,
                stage: formData.get("stage") as string,
                amount:
                  Number.parseFloat(formData.get("amount") as string) || 0,
                probability:
                  Number.parseInt(formData.get("probability") as string) || 50,
                expected_close_date: formData.get(
                  "expected_close_date",
                ) as string,
                owner: formData.get("owner") as string,
                description: formData.get("description") as string,
              });
            }}
            className="mt-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Deal Name</label>
                <Input
                  name="deal_name"
                  required
                  placeholder="Enter deal name"
                />
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
                <Input
                  name="probability"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Expected Close Date
                </label>
                <Input name="expected_close_date" type="date" />
              </div>
              <div>
                <label className="text-sm font-medium">Owner</label>
                <Input name="owner" placeholder="Deal owner" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                name="description"
                placeholder="Describe the deal..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => setShowNewDeal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Deal</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addTicket({
                subject: formData.get("subject") as string,
                description: formData.get("description") as string,
                status: formData.get("status") as string,
                priority: formData.get("priority") as string,
                category: formData.get("category") as string,
                assigned_to: formData.get("assigned_to") as string,
              });
            }}
            className="mt-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input name="subject" required placeholder="Ticket subject" />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select name="priority" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select name="status" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Assigned To</label>
                <Input name="assigned_to" placeholder="Assign to team member" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                name="category"
                placeholder="e.g., Technical, Billing, General"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                name="description"
                placeholder="Describe the issue..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => setShowNewTicket(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Ticket</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Insight Dialog */}
      <Dialog open={showNewInsight} onOpenChange={setShowNewInsight}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Talking Tip</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addInsight({
                content: formData.get("content") as string,
              });
            }}
            className="mt-4 space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Talking Tip</label>
              <Textarea
                name="content"
                required
                placeholder="Enter a conversation starter or talking point..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="default"
                onClick={() => setShowNewInsight(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Tip</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Drawer.Root>
  );
}
