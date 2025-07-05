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
  Hash,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  MessageSquare,
  ArrowUp,
  User,
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

// Reddit logo component
const RedditLogo = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#FF4500">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221a1.334 1.334 0 0 0-2.224-.502c-1.098-.71-2.612-1.158-4.282-1.214l.731-3.445 2.385.507a.952.952 0 1 0 .095-.451l-2.664-.567a.233.233 0 0 0-.273.177l-.813 3.836c-1.705.046-3.237.495-4.35 1.214a1.333 1.333 0 1 0-1.469 2.157c-.018.147-.027.297-.027.449 0 2.281 2.656 4.13 5.932 4.13s5.932-1.849 5.932-4.13a2.29 2.29 0 0 0-.027-.449 1.332 1.332 0 0 0 .754-1.712zM8.444 13.069a.951.951 0 1 1 0-1.902.951.951 0 0 1 0 1.902zm6.601-.316c-.722.722-2.103.778-2.508.778s-1.787-.056-2.508-.778a.268.268 0 0 1 0-.379.268.268 0 0 1 .379 0c.454.454 1.442.615 2.129.615s1.675-.161 2.129-.615a.268.268 0 0 1 .379 0 .269.269 0 0 1 0 .379zm-.498-1.685a.951.951 0 1 1 0 1.902.951.951 0 0 1 0-1.902z"/>
  </svg>
);

// Types
interface RedditPost {
  id: string;
  title: string;
  text: string;
  author: {
    name: string;
    profile_url: string;
    avatar_url?: string;
    karma?: number;
  };
  subreddit: {
    name: string;
    url: string;
  };
  timestamp: string;
  score: number;
  num_comments: number;
  permalink: string;
  url?: string;
  is_self: boolean;
  thumbnail?: string;
  preview?: {
    images: Array<{
      source: { url: string };
    }>;
  };
}

interface ApiResponse {
  posts: RedditPost[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
  meta?: {
    subreddits_searched: string[];
    keywords_used: string[];
    sort_type: string;
    time_filter: string;
  };
}

const RedditSearch = () => {
  // Form state with examples
  const [subreddits, setSubreddits] = useState<string[]>(['startups', 'business']);
  const [subredditInput, setSubredditInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(['help', 'advice', 'question']);
  const [keywordInput, setKeywordInput] = useState("");
  const [sortType, setSortType] = useState<'relevance' | 'hot' | 'top' | 'new' | 'comments'>('new');
  const [timeFilter, setTimeFilter] = useState<'all' | 'year' | 'month' | 'week' | 'day' | 'hour'>('week');
  
  // Results state
  const [posts, setPosts] = useState<RedditPost[]>([]);
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
  const [fullPostContent, setFullPostContent] = useState<Map<string, string>>(new Map());
  const [loadingFullPost, setLoadingFullPost] = useState<Set<string>>(new Set());

  // --- FORM MANAGEMENT FUNCTIONS ---
  const addSubreddit = () => {
    if (subredditInput.trim()) {
      const cleanSubreddit = subredditInput.trim().replace(/^r\//, '');
      setSubreddits([...subreddits, cleanSubreddit]);
      setSubredditInput("");
    }
  };
  const removeSubreddit = (subreddit: string) => setSubreddits(subreddits.filter(s => s !== subreddit));
  
  const addKeyword = () => {
    if (keywordInput.trim()) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };
  const removeKeyword = (keyword: string) => setKeywords(keywords.filter(k => k !== keyword));

  // --- CORE API & DATA FUNCTIONS ---
  const searchReddit = async (page: number = 1) => {
    if (keywords.length === 0) {
      setError("Please add at least one keyword.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const response = await fetch("/api/reddit/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subreddits,
          keywords,
          sort_type: sortType,
          time_filter: timeFilter,
          page,
          per_page: perPage
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "An unknown error occurred");
      }

      const data: ApiResponse = await response.json();
      setPosts(data.posts);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.total_pages);
      setTotalResults(data.pagination.total_entries);
      
      if (page === 1) {
        setExpandedPosts(new Set());
        setSelectedPosts(new Set());
        setFullPostContent(new Map());
      }
    } catch (err: any) {
      setError(err.message);
      setPosts([]);
      setTotalPages(0);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTION HANDLERS ---
  const handleSearch = () => searchReddit(1);
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      searchReddit(newPage);
      document.querySelector('.results-container')?.scrollTo(0, 0);
    }
  };
  
  const handleMessageSingle = (post: RedditPost) => {
    const messageUrl = `https://www.reddit.com/message/compose/?to=${post.author.name}`;
    window.open(messageUrl, '_blank', 'noopener,noreferrer');
  };

  const handleMessageSelected = () => {
    const messageablePosts = posts.filter(p => selectedPosts.has(p.id));
    if (messageablePosts.length === 0) {
      alert("No posts selected.");
      return;
    }
    
    if (messageablePosts.length > 1) {
      alert(`This will attempt to open ${messageablePosts.length} Reddit message tabs. Please allow pop-ups for this site.`);
    }
    
    messageablePosts.forEach(post => {
      const messageUrl = `https://www.reddit.com/message/compose/?to=${post.author.name}`;
      window.open(messageUrl, '_blank', 'noopener,noreferrer');
    });
  };

  // --- UI & HELPER FUNCTIONS ---
  const togglePostExpansion = async (postId: string, postUrl?: string) => {
    const isCurrentlyExpanded = expandedPosts.has(postId);
    
    if (!isCurrentlyExpanded && postUrl && !fullPostContent.has(postId)) {
      // Fetch full post content
      setLoadingFullPost(prev => new Set(prev).add(postId));
      
      try {
        const response = await fetch('/api/reddit/post-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: postUrl }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            setFullPostContent(prev => new Map(prev).set(postId, data.content));
          }
        }
      } catch (error) {
        console.error('Error fetching full post:', error);
      } finally {
        setLoadingFullPost(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    }
    
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };
  
  const togglePostSelection = (postId: string) => setSelectedPosts(prev => {
    const newSet = new Set(prev);
    if (newSet.has(postId)) newSet.delete(postId);
    else newSet.add(postId);
    return newSet;
  });

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      if (diffHours < 1) return `${Math.floor(diffMs / 60000)}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
      return date.toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  const exportPosts = () => {
    if (posts.length === 0) return;

    const csvData = posts.map((post) => ({
      "Subreddit": post.subreddit.name,
      "Title": post.title,
      "Author": post.author.name,
      "Post Text": post.text,
      "Date": new Date(post.timestamp).toLocaleDateString(),
      "Time": new Date(post.timestamp).toLocaleTimeString(),
      "Score": post.score,
      "Comments": post.num_comments,
      "Author Profile": post.author.profile_url,
      "Post Link": `https://reddit.com${post.permalink}`,
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
    a.download = `reddit_${keywords.join("-")}_page_${currentPage}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatScore = (score: number) => {
    if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
    return score.toString();
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Fixed Header and Search Controls */}
      <div className="flex-shrink-0 space-y-4 bg-white p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RedditLogo />
            <h1 className="text-xl font-bold text-slate-900">
              Reddit Business Scraper
            </h1>
          </div>
        </div>

        {/* Search Form */}
        <Card className="border-slate-200 bg-white shadow-none">
          <CardContent className="space-y-4 p-4">
            {/* Subreddits Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700">Subreddits (Optional)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSubreddit}
                  className="border-slate-300"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Subreddit
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter subreddit name (e.g., entrepreneur)"
                  value={subredditInput}
                  onChange={(e) => setSubredditInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSubreddit()}
                  className="flex-1 border-slate-300"
                />
              </div>

              {subreddits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {subreddits.map((subreddit) => (
                    <div
                      key={subreddit}
                      className="flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1 text-sm text-orange-700"
                    >
                      r/{subreddit}
                      <button
                        onClick={() => removeSubreddit(subreddit)}
                        className="ml-1 hover:text-orange-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {subreddits.length === 0 && (
                <p className="text-xs text-slate-500">Leave empty to search across all of Reddit</p>
              )}
            </div>

            {/* Keywords Section */}
            <div className="space-y-3">
              <Label className="text-slate-700">Search Keywords</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter business keywords (e.g., startup, investor)"
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
                      className="flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1 text-sm text-orange-700"
                    >
                      <Hash className="h-3 w-3" />
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-orange-900"
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
                value={sortType}
                onValueChange={(v) => setSortType(v as typeof sortType)}
              >
                <SelectTrigger className="w-full border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="comments">Most Comments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Range Option */}
            <div className="space-y-2">
              <Label className="text-slate-700">Time Filter</Label>
              <Select
                value={timeFilter}
                onValueChange={(v) => setTimeFilter(v as typeof timeFilter)}
              >
                <SelectTrigger className="w-full border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Past Hour</SelectItem>
                  <SelectItem value="day">Past 24 Hours</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                  <SelectItem value="year">Past Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
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
                Search Reddit
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
                Found {totalResults} posts matching your keywords
                {subreddits.length > 0 && ` in r/${subreddits.join(', r/')}`}
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

                    return (
                      <Card key={post.id} className={`border-slate-200 bg-white transition-all ${isSelected ? 'ring-2 ring-orange-500' : ''}`}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Selection and Actions */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={isSelected} 
                                  onChange={() => togglePostSelection(post.id)} 
                                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                />
                                <span className="text-xs text-slate-500">Select</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleMessageSingle(post)}
                                  className="border-slate-300 text-orange-600 hover:bg-orange-50"
                                >
                                  <MessageCircle className="mr-1 h-3 w-3" /> Message
                                </Button>
                              </div>
                            </div>

                            {/* Post Header */}
                            <div className="space-y-2">
                              <h3 className="font-semibold text-slate-900 leading-tight">
                                <a 
                                  href={`https://reddit.com${post.permalink}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:text-orange-600 hover:underline"
                                >
                                  {post.title}
                                </a>
                              </h3>
                              
                              <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <a 
                                    href={post.subreddit.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="hover:underline"
                                  >
                                    r/{post.subreddit.name}
                                  </a>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <a 
                                    href={post.author.profile_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="hover:underline"
                                  >
                                    u/{post.author.name}
                                  </a>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTimestamp(post.timestamp)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Post Content */}
                            {(post.text || fullPostContent.get(post.id)) && (
                              <div className="text-sm text-slate-700">
                                <p className={`whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
                                  {fullPostContent.get(post.id) || post.text}
                                </p>
                                {(post.text.length > 200 || fullPostContent.has(post.id) || !post.is_self) && (
                                  <button 
                                    onClick={() => togglePostExpansion(post.id, `https://reddit.com${post.permalink}`)} 
                                    disabled={loadingFullPost.has(post.id)}
                                    className="mt-1 text-xs font-medium text-orange-600 hover:underline disabled:opacity-50"
                                  >
                                    {loadingFullPost.has(post.id) ? (
                                      <>
                                        <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                                        Loading...
                                      </>
                                    ) : (
                                      isExpanded ? 'Show less' : 'Show more'
                                    )}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Post Thumbnail/Preview */}
                            {post.preview?.images?.[0] && (
                              <div className="mt-2">
                                <img
                                  src={post.preview.images[0].source.url.replace(/&amp;/g, '&')}
                                  alt="Post preview"
                                  className="h-48 w-full rounded-lg object-cover"
                                />
                              </div>
                            )}

                            {/* Post Stats */}
                            <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <ArrowUp className="h-4 w-4" />
                                <span>{formatScore(post.score)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                <span>{post.num_comments}</span>
                              </div>
                              <a
                                href={`https://reddit.com${post.permalink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto flex items-center gap-1 text-orange-600 hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" /> View Post
                              </a>
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
                <p className="text-sm">
                  Try adjusting your search criteria or using different keywords.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RedditSearch;