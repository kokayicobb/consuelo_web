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
  EyeOff,
  Plus,
  X,
  Facebook,
  Hash,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Remove Badge import as it's not available
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
}

interface GroupSearchParams {
  group_id: string;
  group_name: string;
  keywords: string[];
  sorting_order: 'CHRONOLOGICAL' | 'RANKED';
}

const FacebookGroupsSearch = () => {
  // Form state
  const [groups, setGroups] = useState<Array<{id: string, name: string}>>([
    { id: "", name: "" }
  ]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [sortingOrder, setSortingOrder] = useState<'CHRONOLOGICAL' | 'RANKED'>('CHRONOLOGICAL');
  
  // Results state
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const perPage = 20;
  
  // Reveal state for posts
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [revealedPosts, setRevealedPosts] = useState<Set<string>>(new Set());

  // Add/remove groups
  const addGroup = () => {
    setGroups([...groups, { id: "", name: "" }]);
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const updateGroup = (index: number, field: 'id' | 'name', value: string) => {
    const newGroups = [...groups];
    newGroups[index][field] = value;
    setGroups(newGroups);
  };

  // Add/remove keywords
  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  // Search function
  const searchGroups = async (page: number = 1) => {
    // Validate inputs
    const validGroups = groups.filter(g => g.id && g.name);
    if (validGroups.length === 0) {
      setError("Please add at least one Facebook group ID and name");
      return;
    }
    
    if (keywords.length === 0) {
      setError("Please add at least one keyword to search for");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Note: In a real implementation, you would call your backend API here
      // This is a mock implementation showing the expected flow
      const searchParams = {
        groups: validGroups,
        keywords: keywords,
        sorting_order: sortingOrder,
        page: page,
        per_page: perPage,
      };

      const response = await fetch("/api/facebook/search-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error("Failed to search Facebook groups");
      }

      const data = await response.json();
      
      // Mock data for demonstration
      const mockPosts: FacebookPost[] = validGroups.flatMap(group => 
        keywords.map((keyword, idx) => ({
          id: `${group.id}-${keyword}-${idx}-${page}`,
          text: `Sample post about ${keyword} in ${group.name}. This is a business opportunity related to ${keyword}. Contact us for more information about this exciting venture!`,
          author: {
            name: `Business User ${idx + 1}`,
            profile_url: "#",
            avatar_url: undefined,
          },
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          likes_count: Math.floor(Math.random() * 500),
          comments_count: Math.floor(Math.random() * 100),
          shares_count: Math.floor(Math.random() * 50),
          group: {
            id: group.id,
            name: group.name,
          },
          type: "text",
        }))
      );

      setPosts(mockPosts);
      setCurrentPage(page);
      setTotalPages(5); // Mock pagination
      setTotalResults(mockPosts.length * 5);
      
      if (page === 1) {
        setExpandedPosts(new Set());
        setRevealedPosts(new Set());
      }
    } catch (err: any) {
      setError(err.message || "Failed to search Facebook groups");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchGroups(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      searchGroups(newPage);
      document.querySelector('.results-container')?.scrollTo(0, 0);
    }
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleReveal = (postId: string) => {
    setRevealedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const exportPosts = () => {
    if (posts.length === 0) return;

    const csvData = posts.map(post => ({
      "Group Name": post.group.name,
      "Author": post.author.name,
      "Post Text": revealedPosts.has(post.id) ? post.text : "Hidden - Click Reveal to View",
      "Date": new Date(post.timestamp).toLocaleDateString(),
      "Likes": post.likes_count,
      "Comments": post.comments_count,
      "Shares": post.shares_count,
      "Profile URL": revealedPosts.has(post.id) ? post.author.profile_url : "Hidden",
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(","),
      ...csvData.map(row =>
        headers
          .map(header => `"${row[header as keyof typeof row] || ""}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facebook_groups_${keywords.join("-")}_page_${currentPage}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffHours < 168) {
      return `${Math.floor(diffHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Fixed Header and Search Controls */}
      <div className="flex-shrink-0 space-y-4 bg-white p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Facebook className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Facebook Groups Business Scraper</h1>
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
                    onChange={(e) => updateGroup(index, 'id', e.target.value)}
                    className="flex-1 border-slate-300"
                  />
                  <Input
                    placeholder="Group Name"
                    value={group.name}
                    onChange={(e) => updateGroup(index, 'name', e.target.value)}
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
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
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
                onValueChange={(v) => setSortingOrder(v as 'CHRONOLOGICAL' | 'RANKED')}
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
            <Alert className="border-slate-200 bg-white">
              <Info className="h-4 w-4 text-slate-600" />
              <AlertDescription className="text-slate-700">
                Found {totalResults} posts matching your keywords across {groups.filter(g => g.id).length} groups
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            {posts.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Search Results</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportPosts}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Page
                  </Button>
                </div>

                <div className="grid gap-4">
                  {posts.map((post) => {
                    const isExpanded = expandedPosts.has(post.id);
                    const isRevealed = revealedPosts.has(post.id);
                    
                    return (
                      <Card key={post.id} className="border-slate-200 bg-white">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Post Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                  {post.author.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-900">
                                    {post.author.name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Users className="h-3 w-3" />
                                    <span>{post.group.name}</span>
                                    <span>•</span>
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTimestamp(post.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleReveal(post.id)}
                                className="border-slate-300"
                              >
                                {isRevealed ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Reveal
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Post Content */}
                            <div className="text-sm text-slate-700">
                              {isRevealed ? (
                                <p className={`${!isExpanded ? 'line-clamp-3' : ''}`}>
                                  {post.text}
                                </p>
                              ) : (
                                <p className="italic text-slate-500">
                                  Click "Reveal" to view post content and contact information
                                </p>
                              )}
                              
                              {isRevealed && post.text.length > 150 && (
                                <button
                                  onClick={() => togglePostExpansion(post.id)}
                                  className="mt-1 text-xs font-medium text-blue-600 hover:underline"
                                >
                                  {isExpanded ? 'Show less' : 'Show more'}
                                </button>
                              )}
                            </div>

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
                              
                              {isRevealed && post.author.profile_url && (
                                <a
                                  href={post.author.profile_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-auto flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  View Profile
                                </a>
                              )}
                            </div>
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
                <p className="text-sm">Try adjusting your search criteria or adding more groups.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookGroupsSearch;