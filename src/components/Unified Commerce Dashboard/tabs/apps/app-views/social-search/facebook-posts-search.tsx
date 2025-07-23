import React, { useState } from "react";
import {
  Search,
  Users,
  MessageSquare,
  Calendar,
  AlertCircle,
  Info,
  Filter,
  Loader2,
  Download,
  ChevronRight,
  ChevronLeft,
  Eye,
  Facebook,
  Hash,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  X,
  Plus,
  Settings,
  Database,
  TrendingUp,
  Target,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const FacebookLeadDashboard = () => {
  const [activeTab, setActiveTab] = useState("groups");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalLeads: 0,
    messagesScheduled: 0,
    responseRate: 0,
    activeGroups: 0,
  });

  // Search posts globally
  const searchPosts = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch("/api/facebook/search-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.posts);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Facebook className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Facebook Lead Generation</h1>
              <p className="text-sm text-slate-600">Find and connect with potential customers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Leads</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalLeads}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Messages Scheduled</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.messagesScheduled}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Response Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.responseRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Groups</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeGroups}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="groups">Groups Search</TabsTrigger>
            <TabsTrigger value="global">Global Search</TabsTrigger>
            <TabsTrigger value="leads">Lead Manager</TabsTrigger>
          </TabsList>
          
          <TabsContent value="groups" className="flex-1 mt-4">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Search Facebook Groups</h2>
                  <p className="text-sm text-slate-600">Find business opportunities in specific groups</p>
                </div>
                {/* The existing FacebookGroupsSearch component would be embedded here */}
                <div className="text-center py-12 text-slate-500">
                  <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                  <p>Group search functionality will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="global" className="flex-1 mt-4">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">Global Post Search</h2>
                  <p className="text-sm text-slate-600 mb-4">Search all public Facebook posts</p>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for business keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchPosts()}
                      className="flex-1"
                    />
                    <Button onClick={searchPosts} disabled={isSearching}>
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((post, idx) => (
                      <Card key={idx} className="border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-slate-900">{post.author.name}</h4>
                              <p className="text-xs text-slate-500">{new Date(post.timestamp).toLocaleString()}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="mr-1 h-3 w-3" />
                              Message
                            </Button>
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-3">{post.text}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Search className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <p>Search for posts to find potential leads</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="leads" className="flex-1 mt-4">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Lead Manager</h2>
                  <p className="text-sm text-slate-600">Manage and track your Facebook leads</p>
                </div>
                
                <div className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      <strong>Pro Tip:</strong> Use the group search to find targeted leads, then manage them here.
                      You can schedule messages, track responses, and export data.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-slate-200">
                      <CardContent className="p-4">
                        <h3 className="font-medium text-slate-900 mb-2">Recent Leads</h3>
                        <p className="text-sm text-slate-600">No leads yet. Start searching!</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-slate-200">
                      <CardContent className="p-4">
                        <h3 className="font-medium text-slate-900 mb-2">Scheduled Messages</h3>
                        <p className="text-sm text-slate-600">No messages scheduled</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FacebookLeadDashboard;