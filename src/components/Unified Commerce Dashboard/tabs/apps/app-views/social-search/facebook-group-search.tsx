import React, { useState } from "react";
import {
  Search,
  Users,
  Calendar,
  AlertCircle,
  Info,
  Filter,
  Loader2,
  Download,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Facebook,
  Hash,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  MessageSquare, // <-- Added this import
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

// Types
interface FacebookPost {
  id: string;
  text: string;
  author: {
    id?: string;
    name: string;
    profile_url?: string;
    avatar_url?: string;
  };
  timestamp: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  group: {
    id: string;
    name: string;
  };
  images?: string[];
  link?: string;
  type: string;
  raw_data?: any;
}

interface ApiResponse {
  posts: FacebookPost[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
  meta?: {
    days_searched: number;
    date_range: {
      from: string;
      to: string;
    };
    total_groups_searched: number;
    keywords_used: string[];
    errors?: Array<{
      group: string;
      error: string;
    }>;
  };
}

const FacebookGroupsSearch = () => {
  // Form state with some examples
  const [groups, setGroups] = useState<Array<{id: string, name: string}>>([
    { id: "214402382697712", name: "NO CREDIT CHECK-SAMEDAY 50K BUSINESS LOANS" }
  ]);
  const [keywords, setKeywords] = useState<string[]>(['loan', 'destiny', 'business']);
  const [keywordInput, setKeywordInput] = useState("");
  const [sortingOrder, setSortingOrder] = useState<'CHRONOLOGICAL' | 'RANKED'>('CHRONOLOGICAL');
  const [daysBack, setDaysBack] = useState<number>(30);
  
  // Results state
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const perPage = 10;
  
  // UI state
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [showDebug, setShowDebug] = useState(false);

  // --- FORM MANAGEMENT FUNCTIONS ---
  const addGroup = () => setGroups([...groups, { id: "", name: "" }]);
  const removeGroup = (index: number) => setGroups(groups.filter((_, i) => i !== index));
  const updateGroup = (index: number, field: 'id' | 'name', value: string) => {
    const newGroups = [...groups]; newGroups[index][field] = value; setGroups(newGroups);
  };
  const addKeyword = () => { if (keywordInput.trim()) { setKeywords([...keywords, keywordInput.trim()]); setKeywordInput(""); } };
  const removeKeyword = (keyword: string) => setKeywords(keywords.filter(k => k !== keyword));

  // --- CORE API & DATA FUNCTIONS ---
  const searchGroups = async (page: number = 1) => {
    const validGroups = groups.filter(g => g.id && g.name);
    if (validGroups.length === 0) { setError("Please add at least one group ID and name."); return; }
    if (keywords.length === 0) { setError("Please add at least one keyword."); return; }

    setIsLoading(true); setError(null); setHasSearched(true);
    
    try {
      const response = await fetch("/api/facebook/search-groups", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups: validGroups, keywords, sorting_order: sortingOrder, days_back: daysBack, page, per_page: perPage }),
      });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || "An unknown error occurred"); }
      const data: ApiResponse = await response.json();
      setPosts(data.posts); setCurrentPage(data.pagination.page); setTotalPages(data.pagination.total_pages); setTotalResults(data.pagination.total_entries);
      
      if (page === 1) { setExpandedPosts(new Set()); setSelectedPosts(new Set()); }
    } catch (err: any) { setError(err.message); setPosts([]); setTotalPages(0); setTotalResults(0);
    } finally { setIsLoading(false); }
  };

  // --- ACTION HANDLERS ---
  const handleSearch = () => searchGroups(1);
  const handlePageChange = (newPage: number) => { if (newPage >= 1 && newPage <= totalPages) { searchGroups(newPage); document.querySelector('.results-container')?.scrollTo(0, 0); }};
  
  const handleMessageSingle = (post: FacebookPost) => {
    if (!post.author.id) { alert("Cannot message this user: Author ID not found."); return; }
    const messengerUrl = `https://www.messenger.com/t/${post.author.id}/`;
    window.open(messengerUrl, '_blank', 'noopener,noreferrer');
  };

  const handleMessageSelected = () => {
    const messageablePosts = posts.filter(p => selectedPosts.has(p.id) && p.author.id);
    if (messageablePosts.length === 0) { alert("None of the selected posts have a messageable author. The author ID may be missing."); return; }
    
    // Warn the user about pop-up blockers
    if (messageablePosts.length > 1) { alert(`This will attempt to open ${messageablePosts.length} Messenger tabs. Please allow pop-ups for this site.`); }
    
    messageablePosts.forEach(post => {
      const messengerUrl = `https://www.messenger.com/t/${post.author.id}/`;
      window.open(messengerUrl, '_blank', 'noopener,noreferrer');
    });
  };

  // --- UI & HELPER FUNCTIONS ---
  const togglePostExpansion = (postId: string) => setExpandedPosts(prev => { const newSet = new Set(prev); if (newSet.has(postId)) newSet.delete(postId); else newSet.add(postId); return newSet; });
  const togglePostSelection = (postId: string) => setSelectedPosts(prev => { const newSet = new Set(prev); if (newSet.has(postId)) newSet.delete(postId); else newSet.add(postId); return newSet; });
  
  const getPostPermalink = (post: FacebookPost): string | null => {
    if (post.link && post.link.includes('facebook.com')) return post.link;
    if (post.id && post.id.includes('_')) {
      const postIdPart = post.id.split('_')[1];
      if (postIdPart) return `https://www.facebook.com/groups/${post.group.id}/posts/${postIdPart}/`;
    }
    return null;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp); const now = new Date(); const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      if (diffHours < 1) return `${Math.floor(diffMs / 60000)}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
      return date.toLocaleDateString();
    } catch { return "Invalid date"; }
  };
const exportPosts = () => {
    if (posts.length === 0) return;

    const csvData = posts.map((post) => ({
      "Group Name": post.group.name,
      Author: post.author.name,
      "Post Text": post.text,
      Date: new Date(post.timestamp).toLocaleDateString(),
      Time: new Date(post.timestamp).toLocaleTimeString(),
      Likes: post.likes_count,
      Comments: post.comments_count,
      Shares: post.shares_count,
      "Profile URL": post.author.profile_url || "",
      "Post Link": post.link || "",
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map(
            (header) =>
              `"${(row[header as keyof typeof row] || "").toString().replace(/"/g, '""')}"`,
          )
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facebook_groups_${keywords.join("-")}_page_${currentPage}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Fixed Header and Search Controls */}
      <div className="flex-shrink-0 space-y-4 bg-white p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Facebook className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Facebook Groups Business Scraper
            </h1>
          </div>
        </div>

        {/* Search Form */}
        <Card className="border-slate-200 bg-white shadow-none">
          <CardContent className="space-y-4 p-4">
            {/* Groups Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700">Facebook Groups</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addGroup}
                  className="border-slate-300"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Group
                </Button>
              </div>

              {groups.map((group, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Group ID (e.g., 1439220986320043)"
                    value={group.id}
                    onChange={(e) => updateGroup(index, "id", e.target.value)}
                    className="flex-1 border-slate-300"
                  />
                  <Input
                    placeholder="Group Name"
                    value={group.name}
                    onChange={(e) => updateGroup(index, "name", e.target.value)}
                    className="flex-1 border-slate-300"
                  />
                  {groups.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(index)}
                      className="px-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Keywords Section */}
            <div className="space-y-3">
              <Label className="text-slate-700">Search Keywords</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter business keywords (e.g., loan officer, insurance)"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                  className="flex-1 border-slate-300"
                />
                <Button
                  variant="outline"
                  onClick={addKeyword}
                  className="border-slate-300"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <div
                      key={keyword}
                      className="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-700"
                    >
                      <Hash className="h-3 w-3" />
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sorting Option */}
            <div className="space-y-2">
              <Label className="text-slate-700">Sort By</Label>
              <Select
                value={sortingOrder}
                onValueChange={(v) =>
                  setSortingOrder(v as "CHRONOLOGICAL" | "RANKED")
                }
              >
                <SelectTrigger className="w-full border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHRONOLOGICAL">Most Recent</SelectItem>
                  <SelectItem value="RANKED">Most Relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Range Option */}
            <div className="space-y-2">
              <Label className="text-slate-700">Search History</Label>
              <Select
                value={daysBack.toString()}
                onValueChange={(v) => setDaysBack(parseInt(v))}
              >
                <SelectTrigger className="w-full border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="180">Last 180 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="pt-2">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search Groups
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scrollable Results Area */}
      <div className="results-container min-h-0 flex-1 space-y-4 overflow-y-auto border-t border-slate-200 bg-slate-50 p-4">
        {/* Status Messages */}
        <div className="space-y-2">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasSearched && totalResults > 0 && (
            <>
              <Alert className="border-slate-200 bg-white">
                <Info className="h-4 w-4 text-slate-600" />
                <AlertDescription className="text-slate-700">
                  Found {totalResults} posts matching your keywords across{" "}
                  {groups.filter((g) => g.id).length} groups
                </AlertDescription>
              </Alert>

              {totalResults === 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    <strong>Note:</strong> The Facebook API may have limitations
                    on historical data access. Try using broader keywords or
                    checking if the group has recent posts containing your
                    keywords.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        {/* Results */}
        {hasSearched && (
        <div className="space-y-4">
        {posts.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Search Results</h2>
              <div className="flex items-center gap-2">
                {selectedPosts.size > 0 && (
                  <Button variant="default" size="sm" onClick={handleMessageSelected}>
                    <MessageCircle className="mr-2 h-4 w-4" /> Message {selectedPosts.size} Selected
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={exportPosts} className="border-slate-300">
                  <Download className="mr-2 h-4 w-4" /> Export Page
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {posts.map((post) => {
                const isExpanded = expandedPosts.has(post.id);
                const isSelected = selectedPosts.has(post.id);
                const permalink = getPostPermalink(post);
                const canMessage = !!post.author.id;

                return (
                  <Card key={post.id} className={`border-slate-200 bg-white transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Selection and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={isSelected} onChange={() => togglePostSelection(post.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                            <span className="text-xs text-slate-500">Select</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline" size="sm" onClick={() => handleMessageSingle(post)}
                              disabled={!canMessage}
                              title={canMessage ? "Message on Facebook" : "Author ID not found, cannot message"}
                              className="border-slate-300 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <MessageCircle className="mr-1 h-3 w-3" /> Message
                            </Button>
                          </div>
                        </div>

                        {/* Post Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <a href={post.author.profile_url || '#'} target="_blank" rel="noopener noreferrer">
                              <img src={post.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`} alt={post.author.name} className="h-10 w-10 rounded-full object-cover"/>
                            </a>
                            <div>
                              <a href={post.author.profile_url || '#'} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 hover:underline">
                                {post.author.name}
                              </a>
                              <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <a href={`https://www.facebook.com/groups/${post.group.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {post.group.name}
                                  </a>
                                </div>
                                <span className="hidden sm:inline">•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {permalink ? (
                                    <a href={permalink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                      {formatTimestamp(post.timestamp)}
                                    </a>
                                  ) : (
                                    <span>{formatTimestamp(post.timestamp)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="text-sm text-slate-700">
                          <p className={`whitespace-pre-wrap ${!isExpanded && post.text.length > 300 ? 'line-clamp-3' : ''}`}>{post.text}</p>
                          {post.text.length > 300 && (
                            <button onClick={() => togglePostExpansion(post.id)} className="mt-1 text-xs font-medium text-blue-600 hover:underline">
                              {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </div>

                            {/* Post Images */}
                            {post.images && post.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2">
                                {post.images.slice(0, 4).map((image, idx) => (
                                  <img
                                    key={idx}
                                    src={image}
                                    alt={`Post image ${idx + 1}`}
                                    className="h-32 w-full rounded-lg object-cover"
                                  />
                                ))}
                              </div>
                            )}

                            {/* Post Stats */}
                            <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                <span>{post.likes_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.comments_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Share2 className="h-4 w-4" />
                                <span>{post.shares_count}</span>
                              </div>
                              {permalink && (
                                <a
                                  href={permalink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-auto flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                  <ExternalLink className="h-4 w-4" /> View Post
                                </a>
                              )}
                            </div>

                            {/* Debug Info */}
                            {showDebug && post.raw_data && (
                              <div className="mt-2 rounded bg-slate-100 p-2 text-xs">
                                <div className="font-semibold text-slate-700">
                                  Debug Info:
                                </div>
                                <pre className="mt-1 overflow-x-auto text-slate-600">
                                  {JSON.stringify(post.raw_data, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className="border-slate-300"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>

                    <span className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                      className="border-slate-300"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {posts.length === 0 && !isLoading && (
              <div className="py-12 text-center text-slate-500">
                <MessageSquare className="mx-auto mb-2 h-10 w-10 text-slate-400" />
                <h3 className="font-medium text-slate-800">No posts found</h3>
                <p className="text-sm">
                  Try adjusting your search criteria or adding more groups.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookGroupsSearch;
