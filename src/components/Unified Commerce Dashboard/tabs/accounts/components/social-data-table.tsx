"use client";

import { useState, useMemo, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  MoreHorizontal,
  Search,
  User,
  Phone,
  Plus,
  RefreshCw,
  MessageCircle,
  Globe,
  Hash,
  AtSign,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { useSession } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import SocialMediaSidePanel from "./social-side-panel";
import { Checkbox } from "@/components/Playground/components/ui/checkbox";

// Social Media Client interface
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
  created_at: string;
  updated_at: string;
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

// Get social media platforms for a client
const getClientPlatforms = (client: SocialMediaClient) => {
  const platforms = [];
  if (client.reddit_username) platforms.push('reddit');
  if (client.facebook_profile) platforms.push('facebook');
  if (client.twitter_handle) platforms.push('twitter');
  if (client.instagram_handle) platforms.push('instagram');
  if (client.linkedin) platforms.push('linkedin');
  return platforms;
};

export default function SocialMediaClientTable() {
  const { session } = useSession();
  const [clients, setClients] = useState<SocialMediaClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("last_contact_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<SocialMediaClient | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isSidePanelFullScreen, setIsSidePanelFullScreen] = useState(false);

  // Fetch clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = await session?.getToken();
      const supabaseClient = createClerkSupabaseClient(token);
      
      const { data, error } = await supabaseClient
        .from('social_media_clients')
        .select('*')
        .order('last_contact_date', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchClients();
    }
  }, [session]);

  // Get unique values for filters
  const uniqueSegments = useMemo(() => {
    const segments = new Set(clients.map(c => c.segment).filter(Boolean));
    return Array.from(segments).sort();
  }, [clients]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(clients.map(c => c.status).filter(Boolean));
    return Array.from(statuses).sort();
  }, [clients]);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client => {
      // Search filter
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.reddit_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.twitter_handle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.facebook_profile?.toLowerCase().includes(searchTerm.toLowerCase());

      // Platform filter
      const matchesPlatform = platformFilter === "all" || 
        (platformFilter === "reddit" && client.reddit_username) ||
        (platformFilter === "facebook" && client.facebook_profile) ||
        (platformFilter === "twitter" && client.twitter_handle) ||
        (platformFilter === "instagram" && client.instagram_handle) ||
        (platformFilter === "linkedin" && client.linkedin);

      // Status filter
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      
      // Segment filter
      const matchesSegment = segmentFilter === "all" || client.segment === segmentFilter;

      return matchesSearch && matchesPlatform && matchesStatus && matchesSegment;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof SocialMediaClient];
      let bValue = b[sortField as keyof SocialMediaClient];

      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sortDirection === "asc" ? 1 : -1;
      if (bValue === null) return sortDirection === "asc" ? -1 : 1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, searchTerm, platformFilter, statusFilter, segmentFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedClients.length / pageSize);
  const paginatedClients = filteredAndSortedClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(paginatedClients.map(client => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    }
  };

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

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return "bg-red-100 text-red-700 border-red-200";
      case 'medium':
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 'low':
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return "bg-green-100 text-green-700";
      case 'pending':
        return "bg-yellow-100 text-yellow-700";
      case 'inactive':
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Social Media Clients</CardTitle>
              <CardDescription>
                Manage client interactions from Reddit, Facebook, Twitter, and other platforms
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchClients}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, company, or social handles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Segments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Segments</SelectItem>
                  {uniqueSegments.map(segment => (
                    <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedClients.length === paginatedClients.length && paginatedClients.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      Client
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Platforms</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("total_messages_count")}>
                    <div className="flex items-center gap-1">
                      Messages
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("engagement_score")}>
                    <div className="flex items-center gap-1">
                      Engagement
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("last_contact_date")}>
                    <div className="flex items-center gap-1">
                      Last Contact
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading clients...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-12 text-center text-gray-500">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedClients.includes(client.id) ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        setSelectedClientForDetails(client);
                        setIsSidePanelOpen(true);
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={(checked) => handleSelectClient(client.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg" alt={client.name} />
                            <AvatarFallback className="bg-gray-100 text-gray-600">
                              {client.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            {client.company && (
                              <div className="text-sm text-gray-500">{client.company}</div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {client.email && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Mail className="h-3 w-3" />
                                  {client.email}
                                </div>
                              )}
                              {client.phone && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Phone className="h-3 w-3" />
                                  {client.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getClientPlatforms(client).map(platform => (
                            <div
                              key={platform}
                              className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                              title={platform}
                            >
                              <PlatformIcon platform={platform} className="h-3.5 w-3.5" />
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{client.total_messages_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(client.engagement_score || 0)}`}>
                          <span>{client.engagement_score || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(client.last_contact_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(client.priority)}>
                          {client.priority || "Normal"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(client.status)}>
                          {client.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {client.assigned_to || "Unassigned"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedClientForDetails(client);
                              setIsSidePanelOpen(true);
                            }}>
                              <User className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {client.email && (
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Edit Client</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredAndSortedClients.length)} of {filteredAndSortedClients.length} clients
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
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
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side Panel */}
      <SocialMediaSidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        client={selectedClientForDetails}
        isFullScreen={isSidePanelFullScreen}
        onToggleFullScreen={() => setIsSidePanelFullScreen(!isSidePanelFullScreen)}
        onClientUpdate={(updatedClient) => {
          // setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
        }}
      />
    </div>
  );
}