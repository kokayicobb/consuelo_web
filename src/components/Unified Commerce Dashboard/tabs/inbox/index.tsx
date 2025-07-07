import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Send,
  Paperclip,
  X,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Settings,
  Plus,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Mail,
  Eye,
  MousePointer,
  Users,
  MessageSquare,
  Linkedin,
  Globe,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import EmailComposer from "./email/email-composer";

// Types
interface Message {
  id: string;
  client_id?: string;
  source: "email" | "linkedin" | "reddit" | "internal";
  from_address: string;
  from_name?: string;
  to_addresses: string[];
  subject?: string;
  body_text?: string;
  body_html?: string;
  preview_text?: string;
  sent_at?: string;
  received_at: string;
  read: boolean;
  starred: boolean;
  status:
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "replied"
    | "bounced"
    | "failed";
  campaign_name?: string;
  campaign_id?: string;
  tags?: string[];
  source_emoji?: string;
  display_name?: string;
  bounce_type?: "permanent" | "transient" | "undetermined";
  bounce_subtype?: string;
  opens?: number;
  clicks?: number;
  last_opened_at?: string;
  last_clicked_at?: string;
  thread_id?: string;
  is_automated?: boolean;
}

interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
}

interface Campaign {
  id: string;
  name: string;
  status: "draft" | "scheduled" | "active" | "completed" | "paused";
  created_at: string;
  scheduled_for?: string;
  completed_at?: string;
  total_recipients: number;
  stats: EmailStats;
}

// Tab Component
const TabButton = ({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`
      relative px-4 py-2 text-sm font-medium transition-all
      ${
        active
          ? "border-b-2 border-gray-900 text-gray-900"
          : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
      }
    `}
  >
    <span className="flex items-center gap-2">
      {children}
      {count !== undefined && (
        <span
          className={`
          rounded-full px-1.5 py-0.5 text-xs
          ${active ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"}
        `}
        >
          {count}
        </span>
      )}
    </span>
  </button>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: Message["status"] }) => {
  const styles = {
    sent: "bg-blue-50 text-blue-700 border-blue-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    opened: "bg-purple-50 text-purple-700 border-purple-200",
    clicked: "bg-indigo-50 text-indigo-700 border-indigo-200",
    replied: "bg-teal-50 text-teal-700 border-teal-200",
    bounced: "bg-red-50 text-red-700 border-red-200",
    failed: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const icons = {
    sent: <Send className="h-3 w-3" />,
    delivered: <CheckCircle className="h-3 w-3" />,
    opened: <Eye className="h-3 w-3" />,
    clicked: <MousePointer className="h-3 w-3" />,
    replied: <Reply className="h-3 w-3" />,
    bounced: <XCircle className="h-3 w-3" />,
    failed: <AlertCircle className="h-3 w-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${styles[status]}`}
    >
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Analytics Card Component
const AnalyticsCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        {change !== undefined && (
          <p
            className={`mt-1 flex items-center gap-1 text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            <TrendingUp className="h-3 w-3" />
            {change >= 0 ? "+" : ""}
            {change}%
          </p>
        )}
      </div>
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default function UnifiedInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "inbox" | "sent" | "campaigns"
  >("all");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("received_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: "1",
        source: "email",
        from_address: "james@vincenzo.com",
        from_name: "James J Vincenzo",
        to_addresses: ["sales@yourcompany.com"],
        subject: "Re: Business Funding Inquiry",
        preview_text:
          "Hi Eyal, Thanks for reaching out, but I'm not interested.",
        body_text: "Hi Eyal, Thanks for reaching out, but I'm not interested.",
        received_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        starred: false,
        status: "replied",
        source_emoji: "✉️",
        display_name: "James J Vincenzo",
        opens: 3,
        clicks: 1,
        campaign_id: "1",
        campaign_name: "Q4 Outreach",
      },
      {
        id: "2",
        source: "email",
        from_address: "scott@elevateaccessnow.com",
        from_name: "Scott Ready (CODA)",
        to_addresses: ["sales@yourcompany.com"],
        subject: "Partnership Opportunity",
        preview_text:
          "Yes, I would be the POC. Let's discuss how we might partner.",
        body_text:
          "Yes, I would be the POC. Let's discuss how we might partner. My email is scott@elevateaccessnow.com",
        received_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        read: false,
        starred: true,
        status: "opened",
        tags: ["hot-lead"],
        source_emoji: "✉️",
        display_name: "Scott Ready (CODA)",
        opens: 5,
        clicks: 2,
        last_opened_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        source: "linkedin",
        from_address: "devan.p@example.com",
        from_name: "Devan P",
        to_addresses: ["sales@yourcompany.com"],
        subject: "VC/PE Firm Funding",
        preview_text:
          "Hi Eyal, thanks for the note. Not unless you're a VC or PE firm ready to invest:)",
        body_text:
          "Hi Eyal, thanks for the note. Not unless you're a VC or PE firm ready to invest:). How are you scaling your business?",
        received_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: true,
        starred: false,
        status: "delivered",
        source_emoji: "💼",
        display_name: "Devan P",
      },
      {
        id: "4",
        source: "email",
        from_address: "noreply@bounce.example.com",
        from_name: "Mail Delivery System",
        to_addresses: ["sales@yourcompany.com"],
        subject: "Delivery Status Notification (Failure)",
        preview_text:
          "The following message to sarah@oldcompany.com was undeliverable.",
        body_text:
          "The following message to sarah@oldcompany.com was undeliverable. Reason: Mailbox does not exist.",
        received_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: true,
        starred: false,
        status: "bounced",
        bounce_type: "permanent",
        bounce_subtype: "NoEmail",
        source_emoji: "⚠️",
        display_name: "System",
      },
    ];

    const mockCampaigns: Campaign[] = [
      {
        id: "1",
        name: "Q4 Outreach",
        status: "active",
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        total_recipients: 1500,
        stats: {
          sent: 1500,
          delivered: 1485,
          opened: 645,
          clicked: 234,
          replied: 45,
          bounced: 15,
          failed: 0,
          deliveryRate: 99,
          openRate: 43.4,
          clickRate: 15.8,
          replyRate: 3.0,
        },
      },
      {
        id: "2",
        name: "Holiday Promo",
        status: "scheduled",
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        scheduled_for: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        total_recipients: 3200,
        stats: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
          bounced: 0,
          failed: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
          replyRate: 0,
        },
      },
    ];

    setMessages(mockMessages);
    setCampaigns(mockCampaigns);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const sentMessages = messages.filter((m) => m.sent_at);
    return {
      total: messages.length,
      unread: messages.filter((m) => !m.read).length,
      starred: messages.filter((m) => m.starred).length,
      sent: sentMessages.length,
      delivered: sentMessages.filter(
        (m) =>
          m.status === "delivered" ||
          m.status === "opened" ||
          m.status === "clicked" ||
          m.status === "replied",
      ).length,
      opened: sentMessages.filter((m) => m.opens && m.opens > 0).length,
      clicked: sentMessages.filter((m) => m.clicks && m.clicks > 0).length,
      bounced: sentMessages.filter((m) => m.status === "bounced").length,
    };
  }, [messages]);

  // Filter and sort messages
  const filteredMessages = useMemo(() => {
    let filtered = messages;

    // Tab filtering
    if (activeTab === "inbox") {
      filtered = filtered.filter((m) => !m.sent_at);
    } else if (activeTab === "sent") {
      filtered = filtered.filter((m) => m.sent_at);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.display_name?.toLowerCase().includes(query) ||
          m.subject?.toLowerCase().includes(query) ||
          m.preview_text?.toLowerCase().includes(query) ||
          m.from_address.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (filter !== "all") {
      filtered = filtered.filter((m) => m.status === filter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField as keyof Message];
      let bVal = b[sortField as keyof Message];

      if (!aVal) return sortDirection === "asc" ? 1 : -1;
      if (!bVal) return sortDirection === "asc" ? -1 : 1;

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [messages, activeTab, searchQuery, filter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedMessages.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedMessages.map((m) => m.id));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleStar = (msgId: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === msgId ? { ...msg, starred: !msg.starred } : msg,
      ),
    );
  };

  const markAsRead = (msgId: string) => {
    setMessages(
      messages.map((msg) => (msg.id === msgId ? { ...msg, read: true } : msg)),
    );
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Communications Hub
            </h1>
            <button
              onClick={() => setShowCompose(true)}
              className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Compose
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between border-t px-6">
          <div className="-mb-px flex items-center">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              count={stats.total}
            >
              All Messages
            </TabButton>
            <TabButton
              active={activeTab === "inbox"}
              onClick={() => setActiveTab("inbox")}
              count={stats.unread}
            >
              Inbox
            </TabButton>
            <TabButton
              active={activeTab === "sent"}
              onClick={() => setActiveTab("sent")}
              count={stats.sent}
            >
              Sent
            </TabButton>
            <TabButton
              active={activeTab === "campaigns"}
              onClick={() => setActiveTab("campaigns")}
            >
              Campaigns
            </TabButton>
          </div>

          {/* View Options */}
          <div className="flex items-center gap-2 py-2">
            <button className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <Download className="h-4 w-4" />
            </button>
            <button className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          {/* Toolbar */}
          <div className="border-b bg-white px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80 rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="ml-2 rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>

                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Status</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="opened">Opened</option>
                    <option value="clicked">Clicked</option>
                    <option value="replied">Replied</option>
                    <option value="bounced">Bounced</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedRows.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedRows.length} selected
                  </span>
                  <button className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    <Archive className="h-4 w-4" />
                  </button>
                  <button className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          {activeTab === "campaigns" ? (
            // Campaigns View
            <div className="flex-1 overflow-auto p-6">
              {/* Analytics Overview */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                  title="Total Sent"
                  value="15.2K"
                  change={12}
                  icon={Send}
                  color="bg-blue-500"
                />
                <AnalyticsCard
                  title="Open Rate"
                  value="43.4%"
                  change={-2}
                  icon={Eye}
                  color="bg-purple-500"
                />
                <AnalyticsCard
                  title="Click Rate"
                  value="15.8%"
                  change={5}
                  icon={MousePointer}
                  color="bg-indigo-500"
                />
                <AnalyticsCard
                  title="Reply Rate"
                  value="3.2%"
                  change={8}
                  icon={MessageSquare}
                  color="bg-teal-500"
                />
              </div>

              {/* Campaigns Table */}
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="border-b px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Active Campaigns
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Campaign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Recipients
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Delivered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Opened
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Clicked
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {campaign.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Created{" "}
                                {formatDistanceToNow(
                                  new Date(campaign.created_at),
                                )}{" "}
                                ago
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`
                              inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                              ${campaign.status === "active" ? "bg-green-100 text-green-800" : ""}
                              ${campaign.status === "scheduled" ? "bg-blue-100 text-blue-800" : ""}
                              ${campaign.status === "completed" ? "bg-gray-100 text-gray-800" : ""}
                              ${campaign.status === "paused" ? "bg-yellow-100 text-yellow-800" : ""}
                            `}
                            >
                              {campaign.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {campaign.total_recipients.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {campaign.stats.deliveryRate}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {campaign.stats.delivered.toLocaleString()}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {campaign.stats.openRate}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {campaign.stats.opened.toLocaleString()}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {campaign.stats.clickRate}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {campaign.stats.clicked.toLocaleString()}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                            <button className="text-gray-600 hover:text-gray-900">
                              <BarChart3 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // Messages View
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="w-12 px-6 py-3">
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.length === paginatedMessages.length &&
                          paginatedMessages.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("starred")}
                        className="text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("from_name")}
                        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                      >
                        Subject
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("status")}
                        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                      >
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("received_at")}
                        className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                      >
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right">
                      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedMessages.map((message) => (
                    <tr
                      key={message.id}
                      className={`cursor-pointer hover:bg-gray-50 ${!message.read ? "bg-blue-50" : ""}`}
                      onClick={() => {
                        setSelectedMessage(message);
                        markAsRead(message.id);
                      }}
                    >
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(message.id)}
                          onChange={() => handleSelectRow(message.id)}
                          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                      </td>
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleStar(message.id)}
                          className="text-gray-400 hover:text-yellow-500"
                        >
                          <Star
                            className={`h-4 w-4 ${message.starred ? "fill-yellow-500 text-yellow-500" : ""}`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                              <span className="text-lg">
                                {message.source_emoji || "👤"}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div
                              className={`text-sm ${!message.read ? "font-semibold" : "font-medium"} text-gray-900`}
                            >
                              {message.display_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {message.from_address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div
                            className={`text-sm ${!message.read ? "font-semibold" : ""} max-w-md truncate text-gray-900`}
                          >
                            {message.subject}
                          </div>
                          <div className="max-w-md truncate text-sm text-gray-500">
                            {message.preview_text}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={message.status} />
                        {message.bounce_type && (
                          <div className="mt-1 text-xs text-red-600">
                            {message.bounce_type} bounce
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <div>
                          {formatDistanceToNow(new Date(message.received_at))}{" "}
                          ago
                        </div>
                        {message.opens && (
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {message.opens}
                            </span>
                            {message.clicks && (
                              <span className="flex items-center gap-1">
                                <MousePointer className="h-3 w-3" />
                                {message.clicks}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {paginatedMessages.length === 0 && (
                <div className="py-12 text-center">
                  <Mail className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No messages
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery
                      ? "Try adjusting your search or filters"
                      : "Get started by composing a new message"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t bg-white px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredMessages.length,
                    )}{" "}
                    of {filteredMessages.length} results
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="ml-2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-md px-3 py-2 text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-gray-900 text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Detail Panel */}
        {selectedMessage && (
          <div className="flex w-1/3 flex-col border-l bg-white">
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Message Details
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-4">
                {/* Header Info */}
                <div className="mb-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-xl">
                          {selectedMessage.source_emoji || "👤"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {selectedMessage.display_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedMessage.from_address}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={selectedMessage.status} />
                  </div>

                  <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    {selectedMessage.subject}
                  </h2>

                  <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {format(new Date(selectedMessage.received_at), "PPp")}
                    </span>
                    {selectedMessage.campaign_name && (
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                        {selectedMessage.campaign_name}
                      </span>
                    )}
                  </div>

                  {/* Email Metrics */}
                  {selectedMessage.sent_at && (
                    <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                      <div>
                        <div className="text-xs text-gray-500">Opens</div>
                        <div className="text-lg font-semibold">
                          {selectedMessage.opens || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Clicks</div>
                        <div className="text-lg font-semibold">
                          {selectedMessage.clicks || 0}
                        </div>
                      </div>
                      {selectedMessage.last_opened_at && (
                        <div className="col-span-2">
                          <div className="text-xs text-gray-500">
                            Last opened
                          </div>
                          <div className="text-sm">
                            {formatDistanceToNow(
                              new Date(selectedMessage.last_opened_at),
                            )}{" "}
                            ago
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bounce Details */}
                  {selectedMessage.bounce_type && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4">
                      <div className="flex items-start">
                        <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-red-800">
                            {selectedMessage.bounce_type === "permanent"
                              ? "Hard Bounce"
                              : "Soft Bounce"}
                          </div>
                          <div className="mt-1 text-sm text-red-700">
                            {selectedMessage.bounce_subtype === "NoEmail" &&
                              "The email address does not exist"}
                            {selectedMessage.bounce_subtype === "MailboxFull" &&
                              "The recipient's mailbox is full"}
                            {/* Add more bounce reasons as needed */}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-gray-700">
                    {selectedMessage.body_text}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t px-6 py-4">
              <div className="flex gap-2">
                <button className="inline-flex flex-1 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                  <Reply className="mr-2 h-4 w-4" />
                  Reply
                </button>
                <button className="rounded-md border border-gray-300 p-2 hover:bg-gray-50">
                  <Forward className="h-4 w-4" />
                </button>
                <button className="rounded-md border border-gray-300 p-2 hover:bg-gray-50">
                  <Archive className="h-4 w-4" />
                </button>
                <button className="rounded-md border border-gray-300 p-2 text-red-600 hover:bg-gray-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
       {showCompose && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-4xl h-[90vh] max-h-[800px]">
          <EmailComposer
            // This function will be called when the user clicks Cancel or the 'X'
            onCancel={() => setShowCompose(false)}
            // This function will be called on a successful send
            onSuccess={() => {
              console.log("Email sent successfully!");
              setShowCompose(false); // Close the composer after sending
            }}
          />
        </div>
      </div>
    )} 
      </div>
    </div>
  );
}
