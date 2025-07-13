"use client"

import { useState, useEffect, useCallback } from "react"
import {
  X,
  Maximize2,
  Minimize2,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Hash,
  AtSign,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  TrendingUp,
  Calendar,
  User,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Star,
  MoreHorizontal,
 
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
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClerkSupabaseClient } from "@/lib/supabase/client"
import { useSession } from "@clerk/nextjs"
import { toast } from "sonner"
import { Drawer } from "vaul"
import { formatDate } from "@/components/Unified Commerce Dashboard/utils/utils"

// Interfaces
interface SocialMediaClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  address: string | null;
  linkedin: string | null;
  twitter_handle: string | null;
  facebook_profile: string | null;
  reddit_username: string | null;
  instagram_handle: string | null;
  priority: string | null;
  status: string | null;
  segment: string | null;
  assigned_to: string | null;
  notes: string | null;
  tags: string[] | null;
  last_contact_date: string | null;
  first_contact_date: string | null;
  total_messages_count: number;
  engagement_score: number;
  current_cadence_name: string | null;
  next_contact_date: string | null;
  "Expiration Date": string | null; // Use quotes if the key has spaces
}

interface Message {
  id: string;
  client_id: string;
  platform: string;
  message_type: string;
  subject: string | null;
  content: string;
  url: string | null;
  author_username: string | null;
  sentiment: string | null;
  engagement_metrics: any;
  is_reply: boolean;
  message_date: string;
  processed: boolean;
}

interface Conversation {
  id: string;
  client_id: string;
  platform: string;
  conversation_title: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  first_message_date: string | null;
  last_message_date: string | null;
  message_count: number;
}

interface AIInsight {
  id: string;
  client_id: string;
  insight_type: string;
  content: string;
  confidence_score: number;
  platform: string | null;
  is_active: boolean;
  created_at: string;
}

interface Activity {
  id: string;
  client_id: string;
  activity_type: string;
  platform: string | null;
  subject: string | null;
  description: string | null;
  activity_date: string;
  user_name: string | null;
}

interface ResponseTemplate {
  id: string;
  name: string;
  platform: string | null;
  category: string | null;
  content: string;
  variables: any;
}

interface SocialMediaSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  client: SocialMediaClient | null;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onClientUpdate?: (updatedClient: SocialMediaClient) => void;
}

// You can create this inside your SocialMediaSidePanel.tsx file or as a separate file.

// This list should ideally come from a shared config or your backend
// to stay in sync with the warming agent's cadences.
const CADENCE_OPTIONS = [
  "LeadEngagement",
  "NewClientOnboarding",
  "RenewalPush",
  "StandardNurture",
  "ReEngagement",
];

// Helper to format date for input type="date"
const formatDateForInput = (dateString: string | null) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

interface CadenceInfoProps {
  client: SocialMediaClient; // Use the updated interface
  isEditing: boolean;
  onChange: (field: keyof SocialMediaClient | "Expiration Date", value: any) => void;
}

function CadenceInfo({ client, isEditing, onChange }: CadenceInfoProps) {
  if (isEditing) {
    // --- EDITING VIEW ---
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select
            value={client.status || ""}
            onValueChange={(value) => onChange("status", value)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Current Cadence</label>
          <Select
            value={client.current_cadence_name || "None"}
            onValueChange={(value) => onChange("current_cadence_name", value === "None" ? null : value)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="None">None (Stop Cadence)</SelectItem>
              {CADENCE_OPTIONS.map(cadence => (
                <SelectItem key={cadence} value={cadence}>{cadence}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Next Contact Date</label>
          <Input
            type="date"
            value={formatDateForInput(client.next_contact_date)}
            onChange={(e) => onChange("next_contact_date", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Contract Expiration Date</label>
          <Input
            type="date"
            value={formatDateForInput(client["Expiration Date"])}
            onChange={(e) => onChange("Expiration Date", e.target.value)}
          />
        </div>
      </div>
    );
  }

  // --- DISPLAY VIEW ---
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Status:</span>
        <span className="font-medium">{client.status || "N/A"}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Current Cadence:</span>
        <span className="font-medium">{client.current_cadence_name || "None"}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Last Contact:</span>
        <span className="font-medium">{formatDate(client.last_contact_date)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Next Contact:</span>
        <span className="font-medium">{formatDate(client.next_contact_date)}</span>
      </div>
       <div className="flex justify-between">
        <span className="text-gray-600">Expires On:</span>
        <span className="font-medium">{formatDate(client["Expiration Date"])}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Messages Sent:</span>
        <span className="font-medium">{client.total_messages_count || 0}</span>
      </div>
    </div>
  );
}

// Platform icon component
const PlatformIcon = ({ platform, className = "h-4 w-4" }: { platform: string; className?: string }) => {
  switch (platform?.toLowerCase()) {
    case 'reddit':
      return <Hash className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'twitter':
      return <Twitter className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    default:
      return <Globe className={className} />;
  }
};

const TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "conversations", label: "Conversations", icon: Hash },
  { id: "insights", label: "AI Insights", icon: TrendingUp },
  { id: "activity", label: "Activity", icon: Calendar },
  { id: "templates", label: "Templates", icon: Send },
]

export default function SocialMediaSidePanel({
  isOpen,
  onClose,
  client,
  isFullScreen,
  onToggleFullScreen,
  onClientUpdate,
}: SocialMediaSidePanelProps) {
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editedClient, setEditedClient] = useState<SocialMediaClient | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!client || !session) return;

    setIsDataLoading(true);
    try {
      const token = await session.getToken();
      const supabaseClient = createClerkSupabaseClient(token);

      // Fetch messages
      const { data: messagesData } = await supabaseClient
        .from('social_media_messages')
        .select('*')
        .eq('client_id', client.id)
        .order('message_date', { ascending: false });
      
      // Fetch conversations
      const { data: conversationsData } = await supabaseClient
        .from('social_media_conversations')
        .select('*')
        .eq('client_id', client.id)
        .order('last_message_date', { ascending: false });

      // Fetch AI insights
      const { data: insightsData } = await supabaseClient
        .from('social_media_ai_insights')
        .select('*')
        .eq('client_id', client.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Fetch activities
      const { data: activitiesData } = await supabaseClient
        .from('social_media_activities')
        .select('*')
        .eq('client_id', client.id)
        .order('activity_date', { ascending: false })
        .limit(50);

      // Fetch response templates
      const { data: templatesData } = await supabaseClient
        .from('response_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      setMessages(messagesData || []);
      setConversations(conversationsData || []);
      setInsights(insightsData || []);
      setActivities(activitiesData || []);
      setTemplates(templatesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load client data');
    } finally {
      setIsDataLoading(false);
    }
  }, [client, session]);

  useEffect(() => {
    if (client && isOpen) {
      setEditedClient(client);
      fetchAllData();
    }
  }, [client, isOpen, fetchAllData]);

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return "bg-green-100 text-green-700";
      case 'pending':
        return "bg-yellow-100 text-yellow-700";
      case 'resolved':
        return "bg-blue-100 text-blue-700";
      case 'archived':
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleSendReply = async () => {
    if (!client || !replyContent.trim() || !session) return;

    try {
      const token = await session.getToken();
      const supabaseClient = createClerkSupabaseClient(token);

      // Create activity record
      await supabaseClient
        .from('social_media_activities')
        .insert({
          client_id: client.id,
          activity_type: 'message_sent',
          subject: 'Reply sent',
          description: replyContent,
          activity_date: new Date().toISOString(),
          user_name: session.user?.firstName || 'Agent',
        });

      toast.success('Reply sent successfully');
      setReplyContent('');
      fetchAllData();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const updateClient = async () => {
    if (!editedClient || !client || !session) return;

    try {
      const token = await session.getToken();
      const supabaseClient = createClerkSupabaseClient(token);

      const { error } = await supabaseClient
        .from('social_media_clients')
        .update({
          name: editedClient.name,
          email: editedClient.email,
          phone: editedClient.phone,
          company: editedClient.company,
          title: editedClient.title,
          address: editedClient.address,
          linkedin: editedClient.linkedin,
          twitter_handle: editedClient.twitter_handle,
          facebook_profile: editedClient.facebook_profile,
          reddit_username: editedClient.reddit_username,
          instagram_handle: editedClient.instagram_handle,
          priority: editedClient.priority,
          status: editedClient.status,
          segment: editedClient.segment,
          assigned_to: editedClient.assigned_to,
          notes: editedClient.notes,
          tags: editedClient.tags,
          current_cadence_name: editedClient.current_cadence_name,
          next_contact_date: editedClient.next_contact_date,
          "Expiration Date": editedClient["Expiration Date"],
        })
        .eq('id', client.id);

      if (error) throw error;

      toast.success('Client updated successfully');
      setIsEditingClient(false);
      if (onClientUpdate) {
        onClientUpdate(editedClient);
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    }
  };

  const applyTemplate = (template: ResponseTemplate) => {
    let content = template.content;
    
    // Replace variables
    if (client && template.variables) {
      content = content.replace(/{{customer_name}}/g, client.name);
      content = content.replace(/{{company}}/g, client.company || '');
    }
    
    setReplyContent(content);
    setSelectedTemplate(template.id);
  };

  if (!client) return null;

  const SkeletonLoader = () => (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  const renderCompactView = () => (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-neutral-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleFullScreen} className="h-8 w-8 p-0">
            <Maximize2 className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Client Details</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setIsEditingClient(true)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Client Header */}
          <div className="flex items-start gap-4 pb-6 border-b">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" alt={client.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {client.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{client.name}</h3>
              {client.title && client.company && (
                <p className="text-gray-600">{client.title} at {client.company}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {client.priority && (
                  <Badge variant={client.priority === 'high' ? 'destructive' : 'secondary'}>
                    {client.priority} priority
                  </Badge>
                )}
                {client.status && (
                  <Badge variant="outline">{client.status}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Contact Information</h4>
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm hover:text-blue-600">
                <Mail className="h-4 w-4 text-gray-400" />
                {client.email}
              </a>
            )}
            {client.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-2 text-sm hover:text-blue-600">
                <Phone className="h-4 w-4 text-gray-400" />
                {client.phone}
              </a>
            )}
            {client.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                {client.address}
              </div>
            )}
          </div>

          {/* Social Media Profiles */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Social Media</h4>
            <div className="grid grid-cols-2 gap-3">
              {client.reddit_username && (
                <a
                  href={`https://reddit.com/u/${client.reddit_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  <Hash className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">u/{client.reddit_username}</span>
                </a>
              )}
              {client.twitter_handle && (
                <a
                  href={`https://twitter.com/${client.twitter_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <Twitter className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{client.twitter_handle}</span>
                </a>
              )}
              {client.facebook_profile && (
                <a
                  href={`https://facebook.com/${client.facebook_profile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <Facebook className="h-4 w-4 text-blue-700" />
                  <span className="text-sm font-medium truncate">{client.facebook_profile}</span>
                </a>
              )}
              {client.linkedin && (
                <a
                  href={`https://${client.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <Linkedin className="h-4 w-4 text-blue-800" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Automation Status</h4>
            <Card className="p-4">
              {/* Note: We pass isEditingClient=false here because this view is for display only. */}
              {/* Editing happens in the main dialog. */}
              <CadenceInfo client={client} isEditing={false} onChange={() => {}} />
            </Card>
          </div>
          {/* Engagement Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{client.total_messages_count || 0}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{client.engagement_score || 0}%</div>
                <div className="text-sm text-gray-600">Engagement Score</div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          {isDataLoading ? (
            <SkeletonLoader />
          ) : insights.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">AI Insights</h4>
              <div className="space-y-2">
                {insights.slice(0, 3).map((insight) => (
                  <Card key={insight.id} className="p-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <Badge variant="outline" className="text-xs mb-1">
                          {insight.insight_type}
                        </Badge>
                        <p className="text-sm text-gray-700">{insight.content}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Messages */}
          {isDataLoading ? (
            <SkeletonLoader />
          ) : messages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Recent Messages</h4>
              <div className="space-y-2">
                {messages.slice(0, 3).map((message) => (
                  <Card key={message.id} className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={message.platform} className="h-4 w-4" />
                        <span className="text-xs text-gray-500">{formatDate(message.message_date)}</span>
                      </div>
                      {getSentimentIcon(message.sentiment)}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{message.content}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Notes</h4>
              <Card className="p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderFullScreenView = () => (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt={client.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {client.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{client.name}</h2>
              <p className="text-sm text-gray-600">{client.email}</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleFullScreen}>
          <Minimize2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-6 px-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Client Information
                      <Button size="sm" variant="ghost" onClick={() => setIsEditingClient(true)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="font-medium">{client.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Company</label>
                        <p className="font-medium">{client.company || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Title</label>
                        <p className="font-medium">{client.title || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Segment</label>
                        <p className="font-medium">{client.segment || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        Cadence & Automation
        {/* The main edit button controls this whole section */}
        <Button size="sm" variant="ghost" onClick={() => setIsEditingClient(true)}>
          <Edit2 className="h-4 w-4" />
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {/* 
        This is the magic part. The component will show inputs when `isEditingClient` is true,
        and plain text when it's false.
      */}
      {editedClient && (
         <CadenceInfo
            client={editedClient}
            isEditing={isEditingClient}
            onChange={(field, value) => {
              setEditedClient(prev => prev ? { ...prev, [field]: value } : null);
            }}
          />
      )}
    </CardContent>
  </Card>
                {/* Social Media Presence */}
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Presence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {client.reddit_username && (
                        <a
                          href={`https://reddit.com/u/${client.reddit_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <Hash className="h-5 w-5 text-orange-600" />
                            <span className="font-medium">u/{client.reddit_username}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </a>
                      )}
                      {client.twitter_handle && (
                        <a
                          href={`https://twitter.com/${client.twitter_handle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <Twitter className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">{client.twitter_handle}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </a>
                      )}
                      {client.facebook_profile && (
                        <a
                          href={`https://facebook.com/${client.facebook_profile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <Facebook className="h-5 w-5 text-blue-700" />
                            <span className="font-medium">{client.facebook_profile}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Engagement Score</span>
                          <span className="text-2xl font-bold">{client.engagement_score || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${client.engagement_score || 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{client.total_messages_count || 0}</div>
                          <div className="text-sm text-gray-600">Total Messages</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{conversations.length}</div>
                          <div className="text-sm text-gray-600">Conversations</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {client.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Message History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <SkeletonLoader />
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <PlatformIcon platform={message.platform} />
                              <Badge variant="outline">{message.message_type}</Badge>
                              <span className="text-sm text-gray-500">
                                {formatDate(message.message_date)}
                              </span>
                            </div>
                            {getSentimentIcon(message.sentiment)}
                          </div>
                          {message.subject && (
                            <h4 className="font-medium mb-1">{message.subject}</h4>
                          )}
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
                          {message.url && (
                            <a
                              href={message.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                            >
                              View original →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No messages found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversations" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <SkeletonLoader />
                  ) : conversations.length > 0 ? (
                    <div className="space-y-4">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedConversation(conversation.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{conversation.conversation_title || 'Untitled'}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <PlatformIcon platform={conversation.platform} className="h-3 w-3" />
                                <span className="text-sm text-gray-500">{conversation.platform}</span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-500">
                                  {conversation.message_count} messages
                                </span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(conversation.status)}>
                              {conversation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Last message: {formatDate(conversation.last_message_date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No conversations found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>AI Insights & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <SkeletonLoader />
                  ) : insights.length > 0 ? (
                    <div className="space-y-4">
                      {insights.map((insight) => (
                        <div key={insight.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline">{insight.insight_type}</Badge>
                            <span className="text-sm text-gray-500">
                              {Math.round(insight.confidence_score * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{insight.content}</p>
                          {insight.platform && (
                            <div className="flex items-center gap-2 mt-2">
                              <PlatformIcon platform={insight.platform} className="h-3 w-3" />
                              <span className="text-xs text-gray-500">{insight.platform}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No insights available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDataLoading ? (
                    <SkeletonLoader />
                  ) : activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4">
                          <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{activity.activity_type}</span>
                              {activity.platform && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <PlatformIcon platform={activity.platform} className="h-3 w-3" />
                                  <span className="text-sm text-gray-500">{activity.platform}</span>
                                </>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>{formatDate(activity.activity_date)}</span>
                              {activity.user_name && (
                                <>
                                  <span>•</span>
                                  <span>by {activity.user_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No activity recorded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Response Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700">Quick Reply</label>
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your message..."
                        rows={4}
                      />
                      <div className="flex justify-between items-center">
                        <Select value={selectedTemplate || ""} onValueChange={setSelectedTemplate}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Choose template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleSendReply} disabled={!replyContent.trim()}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <h4 className="font-medium text-sm text-gray-700">Available Templates</h4>
                    {templates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{template.name}</h5>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyTemplate(template)}
                          >
                            Use Template
                          </Button>
                        </div>
                        {template.category && (
                          <Badge variant="secondary" className="mb-2">{template.category}</Badge>
                        )}
                        <p className="text-sm text-gray-600">{template.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );

  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={onClose} 
      direction="right"
      modal={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          className={`bg-white h-full fixed top-0 right-0 z-50 outline-none overflow-hidden shadow-xl ${
            isFullScreen ? "w-full" : "w-full max-w-2xl"
          }`}
        >
          {isFullScreen ? renderFullScreenView() : renderCompactView()}
        </Drawer.Content>
      </Drawer.Portal>

      {/* Edit Client Dialog */}
      <Dialog open={isEditingClient} onOpenChange={setIsEditingClient}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client Information</DialogTitle>
          </DialogHeader>
          {editedClient && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editedClient.name}
                    onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={editedClient.email || ""}
                    onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={editedClient.phone || ""}
                    onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    value={editedClient.company || ""}
                    onChange={(e) => setEditedClient({ ...editedClient, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editedClient.title || ""}
                    onChange={(e) => setEditedClient({ ...editedClient, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={editedClient.priority || ""}
                    onValueChange={(value) => setEditedClient({ ...editedClient, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={editedClient.status || ""}
                    onValueChange={(value) => setEditedClient({ ...editedClient, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Segment</label>
                  <Input
                    value={editedClient.segment || ""}
                    onChange={(e) => setEditedClient({ ...editedClient, segment: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Social Media Profiles</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Reddit Username</label>
                    <Input
                      value={editedClient.reddit_username || ""}
                      onChange={(e) => setEditedClient({ ...editedClient, reddit_username: e.target.value })}
                      placeholder="u/username"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Twitter Handle</label>
                    <Input
                      value={editedClient.twitter_handle || ""}
                      onChange={(e) => setEditedClient({ ...editedClient, twitter_handle: e.target.value })}
                      placeholder="@handle"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Facebook Profile</label>
                    <Input
                      value={editedClient.facebook_profile || ""}
                      onChange={(e) => setEditedClient({ ...editedClient, facebook_profile: e.target.value })}
                      placeholder="facebook.com/profile"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">LinkedIn URL</label>
                    <Input
                      value={editedClient.linkedin || ""}
                      onChange={(e) => setEditedClient({ ...editedClient, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/profile"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Instagram Handle</label>
                    <Input
                      value={editedClient.instagram_handle || ""}
                      onChange={(e) => setEditedClient({ ...editedClient, instagram_handle: e.target.value })}
                      placeholder="@handle"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <Textarea
                  value={editedClient.address || ""}
                  onChange={(e) => setEditedClient({ ...editedClient, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={editedClient.notes || ""}
                  onChange={(e) => setEditedClient({ ...editedClient, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditingClient(false)}>
                  Cancel
                </Button>
                <Button onClick={updateClient}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Drawer.Root>
  );
}