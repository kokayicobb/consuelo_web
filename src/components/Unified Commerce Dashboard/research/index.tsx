"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  MessageSquare,
  ArrowRightCircle,
  Settings,
  Search,
  RefreshCw,
  X,
  Facebook,
  Instagram,
  Globe,
  CheckCircle,
  UserPlus,
  ArrowUpRight,
  Mail,
  Save,
  ChevronUp,
} from "lucide-react";
import MicrosoftTeamsSVG from "@/components/ui/Logos/microsoft-teams";
import {
  processRedditDataForLeads,
  generateSalesScript,
  generateKeyTalkingPoints,
} from "@/components/Unified Commerce Dashboard/lib/actions/prompt_actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define Lead type matching UI and PotentialLead from actions
interface Lead {
  id: string | number; // Allow string for new leads from Reddit, number for existing sample
  platform: string; // Added platform field
  subreddit?: string; // Optional for non-Reddit platforms
  username: string;
  content: string;
  date: string;
  sentiment: string; // Keep as string for flexibility with LLM outputs
  status: "new" | "contacted" | "interested" | "converted" | "not_interested";
  score: number;
  url: string;
  reasoning?: string;
}

interface OrangeSalesAgentProps {
  userQuery?: string;
}

// Main application component
export default function OrangeSalesAgent({ userQuery }: OrangeSalesAgentProps) {
  // State for multi-step form
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isRedditExpanded, setIsRedditExpanded] = useState(false);

  const [formData, setFormData] = useState({
    // Reddit specific settings
    subreddits: [
      { name: "borrow", category: "lending", selected: true },
      { name: "SimpleLoans", category: "lending", selected: true },
      { name: "donationrequest", category: "lending", selected: true },
      { name: "smallbusiness", category: "business", selected: true },
      { name: "entrepreneur", category: "business", selected: true },
      { name: "startups", category: "business", selected: true },
      { name: "business", category: "business", selected: true },
      { name: "Entrepreneur", category: "business", selected: false },
      { name: "EntrepreneurRideAlong", category: "business", selected: false },
      { name: "sweatystartup", category: "business", selected: false },
      { name: "restaurateur", category: "industry", selected: false },
      { name: "retail", category: "industry", selected: false },
      { name: "construction", category: "industry", selected: false },
      { name: "freelance", category: "business", selected: false },
      { name: "consulting", category: "business", selected: false },
    ],
    customSubreddit: "",

    // Facebook specific settings - UPDATE THESE TOO
    facebookGroups: [
      { name: "Small Business Owners Network", selected: true },
      { name: "Entrepreneur Support Group", selected: true },
      { name: "Local Business Funding", selected: false },
      { name: "Startup Funding Community", selected: true },
    ],
    customFacebookGroup: "",

    // Instagram specific settings - UPDATE THESE TOO
    instagramTags: [
      { name: "smallbusiness", selected: true },
      { name: "entrepreneur", selected: true },
      { name: "businessfunding", selected: false },
    ],
    customInstagramTag: "",

    // UPDATED KEYWORDS FOR BUSINESS FUNDING
    keywords: [
      "funding",
      "loan",
      "capital",
      "cash flow",
      "business loan",
      "working capital",
      "equipment financing",
      "need money",
      "financial help",
      "expand",
      "growth",
      "investment",
      "revenue",
      "startup costs",
      "line of credit",
      "sba loan",
      "business advice",
      "need help",
      "struggling",

      "need loan",
      "borrow money",
      "emergency loan",
      "quick loan",
      "personal loan",
      "cash advance",
      "financial help",
      "need money",
      "loan request",
      "urgent",
      "business loan",
      "expansion",
      "inventory",
      "payroll",
    ],
    customKeyword: "",
    scanFrequency: "daily",
    notificationType: "teams",
    emailAddress: "",
    teamsWebhook: "",

    // UPDATED CONTENT FILTERS FOR BUSINESS CONTEXT
    contentFilter: {
      seekingFunding: true, // Changed from seekingRecommendations
      expansionPlans: true, // Changed from newToArea
      cashFlowIssues: true, // Changed from complaining
      equipmentNeeds: true, // Changed from priceDiscussion
      revenueDiscussion: true, // Changed from weightLossGoals
    },

    // Platform selection
    platforms: {
      reddit: true,
      facebook: true,
      instagram: true,
    },
  });

  // Initialize search term from userQuery if provided
  const [searchTerm, setSearchTerm] = useState("");

  // Sample leads data - updated to match Lead interface with platform field
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 1,
      platform: "reddit",
      subreddit: "smallbusiness",
      username: "cafe_owner_22",
      content:
        "Been running my coffee shop for 3 years, revenue is steady at $45k/month. Looking to open a second location but need about $150k for equipment and buildout. Any advice on business loans?",
      date: "2025-05-10T14:22:00Z",
      sentiment: "seeking_funding",
      status: "new",
      score: 92,
      url: "https://reddit.com/r/smallbusiness/comments/abc123",
    },
    {
      id: 2,
      platform: "facebook",
      username: "maria.restaurant",
      content:
        "Restaurant has been profitable for 2 years, averaging $35k monthly revenue. Want to expand dining room and add catering kitchen. Need about $80k for renovation and equipment.",
      date: "2025-05-12T10:30:00Z",
      sentiment: "expansion_plans",
      status: "new",
      score: 95,
      url: "https://facebook.com/groups/smallbizowners/posts/123456",
    },
    {
      id: 3,
      platform: "reddit",
      subreddit: "entrepreneur",
      username: "construction_pro",
      content:
        "My construction company just landed a $500k contract but I need working capital to cover materials and payroll upfront. Client pays net-60. Cash flow is always tight in this industry.",
      date: "2025-05-11T09:17:00Z",
      sentiment: "cash_flow_issues",
      status: "contacted",
      score: 87,
      url: "https://reddit.com/r/entrepreneur/comments/def456",
    },
  ]);
  const statusColors = {
    new: "bg-blue-500",
    contacted: "bg-yellow-500",
    interested: "bg-teal-500",
    converted: "bg-green-600",
    not_interested: "bg-red-500",
  };

  // Color mapping for badge (can be moved outside)
  const scoreBadgeColors = (score) => {
    if (score >= 80) return "bg-green-500 hover:bg-green-600";
    if (score >= 60) return "bg-yellow-500 text-black hover:bg-yellow-600";
    return "bg-gray-500 hover:bg-gray-600";
  };
  const [filterStatus, setFilterStatus] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);

  // State for script generation modal
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [selectedLeadForScript, setSelectedLeadForScript] =
    useState<Lead | null>(null);
  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedTalkingPoints, setGeneratedTalkingPoints] = useState<
    string[]
  >([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Function to handle form submission (Start Monitoring)
  const handleSubmitConfiguration = async () => {
    console.log("Form submitted for monitoring:", formData);
    setIsProcessing(true);
    try {
      // Only process Reddit data if Reddit platform is selected
      if (formData.platforms.reddit) {
        const newLeads = await processRedditDataForLeads(
          formData.subreddits,
          formData.keywords,
          formData.contentFilter,
          formData.scanFrequency,
        );

        // Add new leads, ensuring no duplicates by ID, and mapping to UI Lead type
        setLeads((prevLeads) => {
          const incomingLeadsMapped: Lead[] = newLeads.map((nl) => ({
            ...nl,
            platform: "reddit", // Ensure platform is set
            id: nl.id.toString(), // Ensure ID is string for consistency if needed
            status: "new" as const, // Cast status
          }));
          const existingLeadIds = new Set(
            prevLeads.map((l) => l.id.toString()),
          );
          const uniqueNewLeads = incomingLeadsMapped.filter(
            (nl) => !existingLeadIds.has(nl.id.toString()),
          );
          return [...uniqueNewLeads, ...prevLeads];
        });
      }

      // TODO: Add similar processing for Facebook and Instagram when those APIs are implemented

      setCurrentStep(4); // Move to leads view
      console.log("Configuration submitted, simulated scan complete.");
    } catch (error) {
      console.error("Error starting monitoring process:", error);
      alert("Failed to start monitoring. Please check console for errors.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle manual scan for new leads
  const handleManualScan = async () => {
    console.log("Manual scan triggered with current config:", formData);
    setIsProcessing(true);
    try {
      // Only process Reddit data if Reddit platform is selected
      if (formData.platforms.reddit) {
        const newLeads = await processRedditDataForLeads(
          formData.subreddits,
          formData.keywords,
          formData.contentFilter,
          formData.scanFrequency,
        );

        // Create a copy of the current leads for comparison
        const prevLeadsCount = leads.length;

        setLeads((prevLeads) => {
          const incomingLeadsMapped: Lead[] = newLeads.map((nl) => ({
            ...nl,
            platform: "reddit", // Ensure platform is set
            id: nl.id.toString(),
            status: "new" as const,
          }));
          const existingLeadIds = new Set(
            prevLeads.map((l) => l.id.toString()),
          );
          const uniqueNewLeads = incomingLeadsMapped.filter(
            (nl) => !existingLeadIds.has(nl.id.toString()),
          );
          return [...uniqueNewLeads, ...prevLeads];
        });

        // TODO: Add similar processing for Facebook and Instagram when those APIs are implemented

        console.log("Manual scan complete, new leads (if any) added.");

        // Check if new leads were added by comparing counts
        setTimeout(() => {
          const newLeadsCount = leads.length - prevLeadsCount;
          if (newLeadsCount > 0) {
            alert(`${newLeadsCount} new potential leads found!`);
          } else {
            alert("Saved"); //Doesnt actually work
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error during manual scan:", error);
      alert("Manual scan failed. Please check console for errors.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle changes in form fields
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle platform toggle
  const handlePlatformToggle = (platform: keyof typeof formData.platforms) => {
    setFormData((prev) => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: !prev.platforms[platform],
      },
    }));
  };

  // Function to handle subreddit checkbox changes
  const handleSubredditChange = (index: number) => {
    const updatedSubreddits = [...formData.subreddits];
    updatedSubreddits[index].selected = !updatedSubreddits[index].selected;
    setFormData((prev) => ({ ...prev, subreddits: updatedSubreddits }));
  };

  // Function to handle Facebook group checkbox changes
  const handleFacebookGroupChange = (index: number) => {
    const updatedGroups = [...formData.facebookGroups];
    updatedGroups[index].selected = !updatedGroups[index].selected;
    setFormData((prev) => ({ ...prev, facebookGroups: updatedGroups }));
  };

  // Function to handle Instagram tag checkbox changes
  const handleInstagramTagChange = (index: number) => {
    const updatedTags = [...formData.instagramTags];
    updatedTags[index].selected = !updatedTags[index].selected;
    setFormData((prev) => ({ ...prev, instagramTags: updatedTags }));
  };

  // Function to add custom subreddit
  const handleAddSubreddit = () => {
    if (formData.customSubreddit.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        subreddits: [
          ...prev.subreddits,
          {
            name: formData.customSubreddit.trim(),
            category: "custom",
            selected: true,
          },
        ],
        customSubreddit: "",
      }));
    }
  };

  // Function to add custom Facebook group
  const handleAddFacebookGroup = () => {
    if (formData.customFacebookGroup.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        facebookGroups: [
          ...prev.facebookGroups,
          { name: formData.customFacebookGroup.trim(), selected: true },
        ],
        customFacebookGroup: "",
      }));
    }
  };

  // Function to add custom Instagram tag
  const handleAddInstagramTag = () => {
    if (formData.customInstagramTag.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        instagramTags: [
          ...prev.instagramTags,
          { name: formData.customInstagramTag.trim(), selected: true },
        ],
        customInstagramTag: "",
      }));
    }
  };

  // Function to add custom keyword
  const handleAddKeyword = () => {
    if (
      formData.customKeyword.trim() !== "" &&
      !formData.keywords.includes(formData.customKeyword.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, formData.customKeyword.trim()],
        customKeyword: "",
      }));
    }
  };

  // Function to remove keyword
  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keywordToRemove),
    }));
  };

  // Function to handle content filter changes
  const handleContentFilterToggle = (
    filterName: keyof typeof formData.contentFilter,
  ) => {
    setFormData((prev) => ({
      ...prev,
      contentFilter: {
        ...prev.contentFilter,
        [filterName]: !prev.contentFilter[filterName],
      },
    }));
  };

  // Function to handle lead status changes
  const handleLeadStatusChange = (
    id: string | number,
    newStatus: Lead["status"],
  ) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id ? { ...lead, status: newStatus } : lead,
      ),
    );
  };

  // Filtered leads based on search term, status filter, and platform filter
  const filteredLeads = leads
    .filter((lead) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        lead.content.toLowerCase().includes(searchTermLower) ||
        lead.username.toLowerCase().includes(searchTermLower) ||
        (lead.subreddit &&
          lead.subreddit.toLowerCase().includes(searchTermLower)) ||
        (lead.reasoning &&
          lead.reasoning.toLowerCase().includes(searchTermLower));

      const matchesStatus =
        filterStatus === "all" || lead.status === filterStatus;
      const matchesPlatform =
        activeTab === "all" || lead.platform === activeTab;

      return matchesSearch && matchesStatus && matchesPlatform;
    })
    .sort((a, b) => b.score - a.score); // Sort by score

  const openScriptModalForLead = async (lead: Lead) => {
    setSelectedLeadForScript(lead);
    setScriptModalOpen(true);
    setIsGeneratingScript(true);
    setGeneratedScript("");
    setGeneratedTalkingPoints([]);

    try {
      // Create context based on platform
      let queryContextForScript = "";
      if (lead.platform === "reddit") {
        queryContextForScript = `User u/${lead.username} posted in r/${lead.subreddit}: "${lead.content}". Sentiment: ${lead.sentiment}. Match score: ${lead.score}%. Reasoning: ${lead.reasoning || "N/A"}`;
      } else if (lead.platform === "facebook") {
        queryContextForScript = `User ${lead.username} posted in Facebook group: "${lead.content}". Sentiment: ${lead.sentiment}. Match score: ${lead.score}%. Reasoning: ${lead.reasoning || "N/A"}`;
      } else if (lead.platform === "instagram") {
        queryContextForScript = `User ${lead.username} posted on Instagram: "${lead.content}". Sentiment: ${lead.sentiment}. Match score: ${lead.score}%. Reasoning: ${lead.reasoning || "N/A"}`;
      }

      const script = await generateSalesScript({
        scriptType: "email", // Or 'call', can be a UI choice
        clientName: lead.username,
        queryContext: queryContextForScript,
        businessName: "Orange Theory Fitness Charlotte",
      });
      setGeneratedScript(script);

      if (script) {
        const points = await generateKeyTalkingPoints(script);
        setGeneratedTalkingPoints(points);
      }
    } catch (error) {
      console.error("Error generating script/talking points:", error);
      setGeneratedScript(
        "Error: Could not generate script. " +
          (error instanceof Error ? error.message : "Please try again."),
      );
      setGeneratedTalkingPoints(["Failed to load talking points."]);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Platform icon component
  const PlatformIcon = ({ platform }: { platform: string }) => {
    switch (platform) {
      case "reddit":
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 p-1 text-xs font-bold text-white">
            r/
          </div>
        );
      case "facebook":
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case "instagram":
        return <Instagram className="h-5 w-5 text-pink-600" />;
      default:
        return <Globe className="h-5 w-5 text-gray-600" />;
    }
  };

  // Step components with iOS-inspired design
  const renderStepOne = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <h2 className="text-xl font-semibold">Select Platforms & Sources</h2>
        <p className="text-sm text-gray-500">
          Choose where to find potential leads
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 p-1 text-xs font-bold text-white">
                r/
              </div>
              <Label htmlFor="reddit-toggle" className="font-medium">
                Reddit
              </Label>
            </div>
            <Switch
              id="reddit-toggle"
              checked={formData.platforms.reddit}
              onCheckedChange={() => handlePlatformToggle("reddit")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              <Label htmlFor="facebook-toggle" className="font-medium">
                Facebook Groups
              </Label>
            </div>
            <Switch
              id="facebook-toggle"
              checked={formData.platforms.facebook}
              onCheckedChange={() => handlePlatformToggle("facebook")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              <Label htmlFor="instagram-toggle" className="font-medium">
                Instagram
              </Label>
            </div>
            <Switch
              id="instagram-toggle"
              checked={formData.platforms.instagram}
              onCheckedChange={() => handlePlatformToggle("instagram")}
            />
          </div>
        </div>

        <Separator />

        {/* Reddit Configuration - Collapsible */}
        {formData.platforms.reddit && (
          <Collapsible
            open={isRedditExpanded}
            onOpenChange={setIsRedditExpanded}
            className="rounded-lg  bg-white px-4 py-3"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 p-1 text-xs font-bold text-white">
                  r/
                </div>
                <span className="font-medium">Reddit Configuration</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${isRedditExpanded ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {["location", "fitness", "custom"].map((category) => {
                const categorySubreddits = formData.subreddits.filter(
                  (sr) => sr.category === category,
                );
                if (
                  category === "custom" &&
                  categorySubreddits.length === 0 &&
                  !formData.customSubreddit
                )
                  return null;
                if (category !== "custom" && categorySubreddits.length === 0)
                  return null;

                return (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium capitalize text-gray-700">
                      {category}-related Subreddits
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.subreddits
                        .map((subreddit, index) => ({
                          ...subreddit,
                          originalIndex: index,
                        }))
                        .filter((sr) => sr.category === category)
                        .map((subreddit) => (
                          <div
                            key={`${subreddit.name}-${subreddit.originalIndex}`}
                            className="flex items-center space-x-2"
                          >
                            <Switch
                              id={`subreddit-${subreddit.originalIndex}`}
                              checked={subreddit.selected}
                              onCheckedChange={() =>
                                handleSubredditChange(subreddit.originalIndex)
                              }
                            />
                            <Label
                              htmlFor={`subreddit-${subreddit.originalIndex}`}
                              className="text-sm"
                            >
                              r/{subreddit.name}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}

              <div className="space-y-2">
                <Label
                  htmlFor="custom-subreddit"
                  className="text-sm font-medium"
                >
                  Add Custom Subreddit
                </Label>
                <div className="flex w-full items-center gap-2">
                  {" "}
                  {/* Changed to 'gap-2' for spacing */}
                  <Input
                    id="custom-subreddit"
                    type="text"
                    name="customSubreddit"
                    value={formData.customSubreddit}
                    onChange={handleChange}
                    placeholder="Enter subreddit name"
                    className="flex-1" // This makes the input grow to fill available space
                  />
                  <Button
                    onClick={handleAddSubreddit}
                    variant="default"
                    size="default"
                    className="text-black-800 whitespace-nowrap bg-transparent shadow-none hover:bg-gray-100" // Ensures button text doesn't wrap
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Facebook Configuration */}
        {formData.platforms.facebook && (
          <div className="space-y-4 rounded-lg bg-white px-4 py-3">
            <div className="flex items-center space-x-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Facebook Groups</span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {formData.facebookGroups.map((group, index) => (
                  <div
                    key={`${group.name}-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <Switch
                      id={`facebook-group-${index}`}
                      checked={group.selected}
                      onCheckedChange={() => handleFacebookGroupChange(index)}
                    />
                    <Label
                      htmlFor={`facebook-group-${index}`}
                      className="bg-white text-sm"
                    >
                      {group.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="custom-facebook-group"
                className="text-sm font-medium"
              >
                Add Custom Group
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="custom-facebook-group"
                  type="text"
                  name="customFacebookGroup"
                  value={formData.customFacebookGroup}
                  onChange={handleChange}
                  placeholder="Enter Facebook group name"
                  className="flex-1 bg-white"
                />
                <Button
                  onClick={handleAddFacebookGroup}
                  variant="default"
                  size="default"
                  className="text-black-800 whitespace-nowrap bg-transparent shadow-none hover:bg-gray-100"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Instagram Configuration */}
        {formData.platforms.instagram && (
          <div className="space-y-4 rounded-lg bg-white px-4 py-3">
            <div className="flex items-center space-x-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              <span className="font-medium">Instagram Hashtags</span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {formData.instagramTags.map((tag, index) => (
                  <div
                    key={`${tag.name}-${index}`}
                    className="flex items-center space-x-2"
                  >
                    <Switch
                      id={`instagram-tag-${index}`}
                      checked={tag.selected}
                      onCheckedChange={() => handleInstagramTagChange(index)}
                    />
                    <Label
                      htmlFor={`instagram-tag-${index}`}
                      className="text-sm"
                    >
                      #{tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full space-y-2">
              <Label
                htmlFor="custom-instagram-tag"
                className="text-sm font-medium"
              >
                Add Custom Hashtag
              </Label>
              <div className="flex w-full items-center gap-4">
                <Input
                  id="custom-instagram-tag"
                  type="text"
                  name="customInstagramTag"
                  value={formData.customInstagramTag}
                  onChange={handleChange}
                  placeholder="Enter hashtag (without #)"
                  className="flex-1 bg-white"
                />
                <Button
                  onClick={handleAddInstagramTag}
                  variant="default"
                  size="default"
                  className="text-black-800 whitespace-nowrap bg-transparent shadow-none hover:bg-gray-100"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-2">
        <Button
          onClick={() => setCurrentStep(2)}
          className="text-black-800 bg-transparent shadow-none hover:bg-gray-100"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderStepTwo = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <h2 className="text-xl font-semibold">Keywords & Content Filters</h2>
        <p className="text-sm text-gray-500">Define what content to look for</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full space-y-2"
          >
            <div className="flex items-center justify-between space-x-4">
              <Label className="text-sm font-medium">
                Keywords to Track ({formData.keywords.length})
              </Label>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-black-800 w-9 bg-transparent p-0 shadow-none hover:bg-gray-100"
                >
                  <ChevronDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              {/* You can add some padding/border to the content area if desired */}
              <div className="mb-3 flex flex-wrap gap-2 rounded-md p-3">
                {formData.keywords.length > 0 ? (
                  formData.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1.5"
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        aria-label={`Remove ${keyword}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No keywords to display.
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex space-x-2">
            <Input
              type="text"
              name="customKeyword"
              value={formData.customKeyword}
              onChange={handleChange}
              placeholder="Add keyword (e.g., loan help)"
              className="flex-1 border border-gray-400 bg-white"
            />
            <Button
              onClick={handleAddKeyword}
              variant="default"
              size="default"
              className="text-black-800 whitespace-nowrap bg-transparent shadow-none hover:bg-gray-100"
            >
              Add
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Content Filters</Label>
          <p className="text-xs text-gray-500">
            Select types of content to prioritize:
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              Object.keys(formData.contentFilter) as Array<
                keyof typeof formData.contentFilter
              >
            ).map((filterKey) => (
              <div
                key={filterKey}
                className="flex items-center justify-between rounded-lg bg-white p-3"
              >
                <Label
                  htmlFor={`filter-${filterKey}`}
                  className="text-sm capitalize"
                >
                  {filterKey.replace(/([A-Z])/g, " $1").toLowerCase()}
                </Label>
                <Switch
                  id={`filter-${filterKey}`}
                  checked={formData.contentFilter[filterKey]}
                  onCheckedChange={() => handleContentFilterToggle(filterKey)}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button
          onClick={() => setCurrentStep(1)}
          variant="outline"
          className="text-black-800 bg-transparent shadow-none hover:bg-gray-100"
        >
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep(3)}
          className="text-black-800 bg-transparent shadow-none hover:bg-gray-100"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderStepThree = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <h2 className="text-xl font-semibold">
          Scanning & Notification Settings
        </h2>
        <p className="text-sm text-gray-500">
          Configure how often to scan and get notified
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="scan-frequency" className="text-sm font-medium">
            Scan Frequency
          </Label>
          <Select
            name="scanFrequency"
            value={formData.scanFrequency}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, scanFrequency: value }))
            }
          >
            <SelectTrigger id="scan-frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily (Recommended)</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="bg-white text-sm font-medium">
            Notification Preferences
          </Label>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-white p-3">
              <div className="flex items-center gap-2">
                <MicrosoftTeamsSVG className="h-5 w-5" />
                <Label htmlFor="teams-notification" className="text-sm">
                  Teams Notifications
                </Label>
              </div>
              <Switch
                id="teams-notification"
                checked={formData.notificationType === "teams"}
                onCheckedChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    notificationType: "teams",
                  }))
                }
              />
            </div>

            {formData.notificationType === "teams" && (
              <div className="space-y-2 pl-4">
                <button
                  id="teams-login"
                  className="flex items-center gap-1 text-blue-600 underline transition-colors hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => {
                    /* Your login with Teams function here */
                  }}
                >
                  Login with Teams
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg bg-white p-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <Label htmlFor="email-notification" className="text-sm">
                  Email Notifications
                </Label>
              </div>
              <Switch
                id="email-notification"
                checked={formData.notificationType === "email"}
                onCheckedChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    notificationType: "email",
                  }))
                }
              />
            </div>

            {formData.notificationType === "email" && (
              <div className="space-y-2 pl-4">
                <Label htmlFor="email-address" className="text-sm">
                  Email Address
                </Label>
                <Input
                  id="email-address"
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg bg-white p-3">
              <Label htmlFor="no-notification" className="text-sm ">
                No Notifications
              </Label>
              <Switch
                id="no-notification"
                checked={formData.notificationType === "none"}
                onCheckedChange={() =>
                  setFormData((prev) => ({ ...prev, notificationType: "none" }))
                }
              />
            </div>
          </div>
        </div>
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full space-y-2" // Adjust width as needed
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-sky-600">
              Configuration Summary
            </h3>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-9 bg-transparent p-0 text-sky-600 shadow-none hover:bg-gray-100"
              >
                {/* You can use ChevronsUpDown or conditionally render ChevronUp/ChevronDown */}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle summary</span>
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            {/* Your original Configuration Summary content goes here */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              {/* Moved the H3 to the trigger section for better visibility when closed */}
              <div className="space-y-1 text-sm text-blue-700">
                <p>
                  <span className="font-medium">Platforms:</span>{" "}
                  {Object.entries(formData.platforms)
                    .filter(([_, enabled]) => enabled)
                    .map(
                      ([platform]) =>
                        platform.charAt(0).toUpperCase() + platform.slice(1),
                    )
                    .join(", ")}
                </p>
                {formData.platforms.reddit && (
                  <p>
                    <span className="font-medium">Reddit:</span>{" "}
                    {formData.subreddits.filter((sr) => sr.selected).length}{" "}
                    subreddits selected
                  </p>
                )}
                {formData.platforms.facebook && (
                  <p>
                    <span className="font-medium">Facebook:</span>{" "}
                    {formData.facebookGroups.filter((g) => g.selected).length}{" "}
                    groups selected
                  </p>
                )}
                {formData.platforms.instagram && (
                  <p>
                    <span className="font-medium">Instagram:</span>{" "}
                    {formData.instagramTags.filter((t) => t.selected).length}{" "}
                    hashtags selected
                  </p>
                )}
                <p>
                  <span className="font-medium">Keywords:</span>{" "}
                  {formData.keywords.length} keywords defined
                </p>
                <p>
                  <span className="font-medium">Scan Frequency:</span>{" "}
                  {formData.scanFrequency.charAt(0).toUpperCase() +
                    formData.scanFrequency.slice(1)}
                </p>
                <p>
                  <span className="font-medium">Notifications:</span>{" "}
                  {formData.notificationType === "none"
                    ? "Manual dashboard check"
                    : `${formData.notificationType.charAt(0).toUpperCase() + formData.notificationType.slice(1)}`}
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button
          onClick={() => setCurrentStep(2)}
          variant="outline"
          className="text-black-800 bg-white shadow-none hover:bg-gray-100"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmitConfiguration}
          disabled={isProcessing}
          className="shawdow-none bg-white text-black hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Start Monitoring{" "}
              <ArrowRightCircle className="text-black-800 border: ml-2 h-4 w-4 border-none bg-white shadow-none hover:bg-gray-100" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
  const renderLeadsDashboard = () => (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <h2 className="text-xl font-semibold">Social Search</h2>
            <p className="text-sm text-gray-500">
              Find and engage with potential leads across platforms
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setCurrentStep(1)}
              variant="outline"
              size="sm"
              className="text-black-800 flex items-center bg-transparent shadow-none hover:bg-gray-100"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
            <Button
              onClick={handleManualScan}
              disabled={isProcessing}
              size="sm"
              className="flex items-center bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
            >
              <Save
                className={`mr-2 h-4 w-4 ${isProcessing ? "animate-spin" : ""}`}
              />
              {isProcessing ? "Saving..." : "Save List"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Search leads by content, username, or platform..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="shawdow-none flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="shawdow-none w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
              <Badge
                variant="outline"
                className="shawdow-none flex h-10 items-center gap-1 px-3"
              >
                <Filter className="shawdow-none h-3.5 w-3.5" />
                {filteredLeads.length} leads
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4 grid grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span>All</span>
          </TabsTrigger>
          <TabsTrigger value="reddit" className="flex items-center gap-1">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 p-0.5 text-[10px] font-bold text-white">
              r/
            </div>
            <span>Reddit</span>
          </TabsTrigger>
          <TabsTrigger value="facebook" className="flex items-center gap-1">
            <Facebook className="h-4 w-4 text-blue-600" />
            <span>Facebook</span>
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex items-center gap-1">
            <Instagram className="h-4 w-4 text-pink-600" />
            <span>Instagram</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-2">
          <ScrollArea className="h-[calc(100vh-280px)] w-full">
            <div className="flex flex-col space-y-4 p-4">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <Card
                    key={lead.id}
                    // 4. Changed `w-80 md:w-96` to `w-full` so each card takes the full width
                    //    of the container. You can adjust this if you want a max-width or
                    //    specific width (e.g., `w-full max-w-md mx-auto` for a centered card with max width).
                    // 5. `flex-shrink-0` is usually for horizontal flex layouts to prevent shrinking.
                    //    It's less critical here but doesn't harm. Can be removed if not needed.
                    className="mx-auto w-full max-w-md shadow-none"
                  >
                    <CardHeader className="flex flex-row items-start justify-between p-3 pb-0">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={lead.platform} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">
                              {lead.username}
                            </span>
                            <div
                              className={`h-2 w-2 rounded-full ${
                                lead.status === "new"
                                  ? "bg-blue-500"
                                  : lead.status === "contacted"
                                    ? "bg-yellow-500"
                                    : lead.status === "interested"
                                      ? "bg-teal-500"
                                      : lead.status === "converted"
                                        ? "bg-green-600"
                                        : "bg-red-500" // not_interested
                              }`}
                            ></div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            {lead.platform === "reddit" && lead.subreddit && (
                              <span>r/{lead.subreddit}</span>
                            )}
                            <span>•</span>
                            <span>
                              {new Date(lead.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          lead.score >= 80
                            ? "bg-green-500 hover:bg-green-600"
                            : lead.score >= 60
                              ? "bg-yellow-500 text-black hover:bg-yellow-600"
                              : "bg-gray-500 hover:bg-gray-600"
                        }`}
                      >
                        {lead.score}% Match
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      <p className="text-sm text-gray-700">{lead.content}</p>
                      {lead.reasoning && (
                        <p className="mt-1 text-xs italic text-gray-500">
                          Reasoning: {lead.reasoning}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 p-3 pt-0 sm:flex-row sm:justify-between">
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-500 hover:text-blue-700"
                      >
                        View Original Post{" "}
                        <ArrowRightCircle className="ml-1 h-3 w-3" />
                      </a>
                      <div className="ml-auto flex gap-2">
                        <Select
                          value={lead.status}
                          onValueChange={(value) =>
                            handleLeadStatusChange(
                              lead.id,
                              value as Lead["status"],
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue placeholder="Set Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="interested">
                              Interested
                            </SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="not_interested">
                              Not Interested
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => openScriptModalForLead(lead)}
                          size="sm"
                          className="h-8 bg-orange-500 text-xs hover:bg-orange-600"
                        >
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Outreach
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="rounded-lg bg-gray-50 py-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No leads found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterStatus !== "all" || activeTab !== "all"
                      ? "Try adjusting your search or filters"
                      : "Configure your search and start monitoring to find leads"}
                  </p>
                  {leads.length === 0 && !isProcessing && (
                    <Button
                      onClick={handleManualScan}
                      className="mt-4 bg-blue-500 hover:bg-blue-600"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Scan for Leads Now
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="reddit" className="mt-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <Card key={lead.id} className="w-full overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between p-3 pb-0">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={lead.platform} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">
                              {lead.username}
                            </span>
                            <div
                              className={`h-2 w-2 rounded-full ${
                                lead.status === "new"
                                  ? "bg-blue-500"
                                  : lead.status === "contacted"
                                    ? "bg-yellow-500"
                                    : lead.status === "interested"
                                      ? "bg-teal-500"
                                      : lead.status === "converted"
                                        ? "bg-green-600"
                                        : "bg-red-500" // not_interested
                              }`}
                            ></div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            {lead.platform === "reddit" && lead.subreddit && (
                              <span>r/{lead.subreddit}</span>
                            )}
                            <span>•</span>
                            <span>
                              {new Date(lead.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          lead.score >= 80
                            ? "bg-green-500 hover:bg-green-600"
                            : lead.score >= 60
                              ? "bg-yellow-500 text-black hover:bg-yellow-600"
                              : "bg-gray-500 hover:bg-gray-600"
                        }`}
                      >
                        {lead.score}% Match
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      <p className="text-sm text-gray-700">{lead.content}</p>
                      {lead.reasoning && (
                        <p className="mt-1 text-xs italic text-gray-500">
                          Reasoning: {lead.reasoning}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 p-3 pt-0 sm:flex-row sm:justify-between">
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-500 hover:text-blue-700"
                      >
                        View Original Post{" "}
                        <ArrowRightCircle className="ml-1 h-3 w-3" />
                      </a>
                      <div className="ml-auto flex gap-2">
                        <Select
                          value={lead.status}
                          onValueChange={(value) =>
                            handleLeadStatusChange(
                              lead.id,
                              value as Lead["status"],
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue placeholder="Set Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="interested">
                              Interested
                            </SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="not_interested">
                              Not Interested
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => openScriptModalForLead(lead)}
                          size="sm"
                          className="h-8 bg-orange-500 text-xs hover:bg-orange-600"
                        >
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Outreach
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="rounded-lg bg-gray-50 py-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No Reddit leads found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Configure Reddit sources and start monitoring"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="facebook" className="mt-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <Card key={lead.id} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between p-3 pb-0">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={lead.platform} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">
                              {lead.username}
                            </span>
                            <div
                              className={`h-2 w-2 rounded-full ${
                                lead.status === "new"
                                  ? "bg-blue-500"
                                  : lead.status === "contacted"
                                    ? "bg-yellow-500"
                                    : lead.status === "interested"
                                      ? "bg-teal-500"
                                      : lead.status === "converted"
                                        ? "bg-green-600"
                                        : "bg-red-500" // not_interested
                              }`}
                            ></div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>
                              {new Date(lead.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          lead.score >= 80
                            ? "bg-green-500 hover:bg-green-600"
                            : lead.score >= 60
                              ? "bg-yellow-500 text-black hover:bg-yellow-600"
                              : "bg-gray-500 hover:bg-gray-600"
                        }`}
                      >
                        {lead.score}% Match
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      <p className="text-sm text-gray-700">{lead.content}</p>
                      {lead.reasoning && (
                        <p className="mt-1 text-xs italic text-gray-500">
                          Reasoning: {lead.reasoning}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 p-3 pt-0 sm:flex-row sm:justify-between">
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-500 hover:text-blue-700"
                      >
                        View Original Post{" "}
                        <ArrowRightCircle className="ml-1 h-3 w-3" />
                      </a>
                      <div className="ml-auto flex gap-2">
                        <Select
                          value={lead.status}
                          onValueChange={(value) =>
                            handleLeadStatusChange(
                              lead.id,
                              value as Lead["status"],
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue placeholder="Set Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="interested">
                              Interested
                            </SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="not_interested">
                              Not Interested
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => openScriptModalForLead(lead)}
                          size="sm"
                          className="h-8 bg-orange-500 text-xs hover:bg-orange-600"
                        >
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Outreach
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="rounded-lg bg-gray-50 py-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No Facebook leads found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Configure Facebook groups and start monitoring"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="instagram" className="mt-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <Card key={lead.id} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between p-3 pb-0">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={lead.platform} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">
                              {lead.username}
                            </span>
                            <div
                              className={`h-2 w-2 rounded-full ${
                                lead.status === "new"
                                  ? "bg-blue-500"
                                  : lead.status === "contacted"
                                    ? "bg-yellow-500"
                                    : lead.status === "interested"
                                      ? "bg-teal-500"
                                      : lead.status === "converted"
                                        ? "bg-green-600"
                                        : "bg-red-500" // not_interested
                              }`}
                            ></div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>
                              {new Date(lead.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          lead.score >= 80
                            ? "bg-green-500 hover:bg-green-600"
                            : lead.score >= 60
                              ? "bg-yellow-500 text-black hover:bg-yellow-600"
                              : "bg-gray-500 hover:bg-gray-600"
                        }`}
                      >
                        {lead.score}% Match
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      <p className="text-sm text-gray-700">{lead.content}</p>
                      {lead.reasoning && (
                        <p className="mt-1 text-xs italic text-gray-500">
                          Reasoning: {lead.reasoning}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 p-3 pt-0 sm:flex-row sm:justify-between">
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-blue-500 hover:text-blue-700"
                      >
                        View Original Post{" "}
                        <ArrowRightCircle className="ml-1 h-3 w-3" />
                      </a>
                      <div className="ml-auto flex gap-2">
                        <Select
                          value={lead.status}
                          onValueChange={(value) =>
                            handleLeadStatusChange(
                              lead.id,
                              value as Lead["status"],
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue placeholder="Set Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="interested">
                              Interested
                            </SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="not_interested">
                              Not Interested
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => openScriptModalForLead(lead)}
                          size="sm"
                          className="h-8 bg-orange-500 text-xs hover:bg-orange-600"
                        >
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Outreach
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="rounded-lg bg-gray-50 py-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No Instagram leads found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Configure Instagram hashtags and start monitoring"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Script Generation Modal */}
      <Dialog open={scriptModalOpen} onOpenChange={setScriptModalOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-start justify-between">
              <span>Outreach Script for {selectedLeadForScript?.username}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto p-4">
            {isGeneratingScript ? (
              <div className="flex h-64 flex-col items-center justify-center">
                <RefreshCw className="h-12 w-12 animate-spin text-orange-500" />
                <p className="mt-4 text-gray-600">
                  Generating script and talking points...
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                      Generated Script
                    </h3>
                    <div
                      className="min-h-[200px] whitespace-pre-line rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        setGeneratedScript(e.currentTarget.innerText)
                      }
                    >
                      {generatedScript}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() =>
                        selectedLeadForScript &&
                        openScriptModalForLead(selectedLeadForScript)
                      }
                      variant="outline"
                      className="flex-1"
                    >
                      Regenerate
                    </Button>
                    <Button
                      className="flex flex-1 items-center justify-center bg-orange-500 hover:bg-orange-600"
                      onClick={() =>
                        alert("Send DM functionality not implemented yet.")
                      }
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Send DM (Simulated)
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                      Key Talking Points
                    </h3>
                    {generatedTalkingPoints.length > 0 ? (
                      <ul className="space-y-2">
                        {generatedTalkingPoints.map((point, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                            <span className="text-sm text-gray-700">
                              {point}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No talking points generated or available.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">
                      Original Post Context
                    </h3>
                    <div className="max-h-48 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                      {selectedLeadForScript && (
                        <>
                          <p className="font-medium">
                            {selectedLeadForScript.platform === "reddit"
                              ? `u/${selectedLeadForScript.username} in r/${selectedLeadForScript.subreddit}`
                              : `${selectedLeadForScript.username} on ${selectedLeadForScript.platform.charAt(0).toUpperCase() + selectedLeadForScript.platform.slice(1)}`}
                          </p>
                          <p className="mt-1">
                            {selectedLeadForScript.content}
                          </p>
                          <div className="mt-2 text-gray-500">
                            Posted:{" "}
                            {new Date(
                              selectedLeadForScript.date,
                            ).toLocaleDateString()}
                          </div>
                          {selectedLeadForScript.reasoning && (
                            <p className="mt-1 italic">
                              AI Reasoning: {selectedLeadForScript.reasoning}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Main app layout with iOS-inspired design
  return (
    <div className="min-h-screen bg-white p-4 font-sans">
      <div className="mx-auto mb-6 max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="flex items-center">
            <div className="rounded-md bg-green-500 p-2 text-xl font-bold text-white">
              CFM
            </div>
            <h1 className="ml-3 text-2xl font-bold text-gray-800">
              Capital Fund Management
            </h1>
            <div className="ml-4 hidden text-gray-500 md:block">
              Social Search
            </div>
          </div>

          {currentStep < 4 && (
            <div className="flex items-center">
              <div className="hidden items-center space-x-1 sm:flex">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${currentStep >= step ? "bg-blue-500" : "bg-gray-300"}`}
                    ></div>
                    {step < 3 && (
                      <div
                        className={`h-1 w-8 transition-colors ${currentStep > step ? "bg-blue-500" : "bg-gray-300"}`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <span className="ml-3 text-sm text-gray-600">
                Step {currentStep} of 3
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        {currentStep === 1 && renderStepOne()}
        {currentStep === 2 && renderStepTwo()}
        {currentStep === 3 && renderStepThree()}
        {currentStep === 4 && renderLeadsDashboard()}
      </div>
    </div>
  );
}
