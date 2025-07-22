"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  Check,
  Image,
  Palette,
  Settings,
  Wand2,
  Camera,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Hash,
  Target,
  TrendingUp,
  Zap,
  Eye,
  Heart,
  MessageCircle,
  Copy,
  ChevronRight,
  Plus,
  Save,
  History,
  Grid,
  List,
  Filter,
  Search,
  X,
  Edit,
  Trash2,
  Star,
  Clock,
  Users,
  BarChart3,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Drawer } from "vaul";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "../../../../Playground/components/ui/checkbox";
import TryOnStudioContent from "@/components/Dashboard/try-on-studio-content";

interface GeneratedModel {
  id: string;
  imageUrl: string;
  transparentUrl?: string;
  prompt: string;
  modelOptions: any;
  clothingOptions: any;
  backgroundOptions: any;
  brandGuidelines?: string;
  customPrompt?: string;
  createdAt: string;
  status: "generating" | "completed" | "failed";
  socialMediaFormats?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    saves: number;
  };
  tags?: string[];
  campaign?: string;
}

// Marketing-focused presets
const MARKETING_TEMPLATES = [
  {
    id: 1,
    name: "Instagram Lifestyle",
    preview: "/api/placeholder/80/100",
    description: "Perfect for lifestyle brands and fashion influencers",
    options: {
      gender: "female",
      pose: "casual lifestyle",
      ethnicity: "diverse",
    },
    clothing: {
      type: "trendy casual wear",
      color: "instagram-worthy pastels",
      style: "influencer chic",
    },
    background: { setting: "bright natural lifestyle setting", remove: false },
    tags: ["instagram", "lifestyle", "engagement"],
  },
  {
    id: 2,
    name: "Professional LinkedIn",
    preview: "/api/placeholder/80/100",
    description: "Ideal for B2B marketing and corporate content",
    options: {
      gender: "male",
      pose: "confident professional",
      ethnicity: "diverse",
    },
    clothing: {
      type: "business attire",
      color: "corporate blue",
      style: "executive professional",
    },
    background: { setting: "modern office environment", remove: true },
    tags: ["linkedin", "b2b", "professional"],
  },
  {
    id: 3,
    name: "E-commerce Product",
    preview: "/api/placeholder/80/100",
    description: "Clean product shots for online stores",
    options: {
      gender: "female",
      pose: "e-commerce standard",
      ethnicity: "diverse",
    },
    clothing: {
      type: "featured product",
      color: "brand colors",
      style: "clean minimal",
    },
    background: { setting: "pure white e-commerce background", remove: true },
    tags: ["ecommerce", "product", "conversion"],
  },
];

// Marketing-focused options
const SOCIAL_PLATFORMS = [
  {
    value: "instagram",
    label: "Instagram",
    icon: Instagram,
    aspectRatio: "1:1",
  },
  {
    value: "instagram-story",
    label: "Instagram Story",
    icon: Instagram,
    aspectRatio: "9:16",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: Facebook,
    aspectRatio: "1.91:1",
  },
  { value: "twitter", label: "Twitter/X", icon: Twitter, aspectRatio: "16:9" },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    aspectRatio: "1.91:1",
  },
  { value: "tiktok", label: "TikTok", icon: Hash, aspectRatio: "9:16" },
];

const CAMPAIGN_TYPES = [
  { value: "product-launch", label: "Product Launch" },
  { value: "seasonal", label: "Seasonal Campaign" },
  { value: "brand-awareness", label: "Brand Awareness" },
  { value: "user-generated", label: "User Generated Content" },
  { value: "influencer", label: "Influencer Marketing" },
  { value: "sale-promotion", label: "Sale/Promotion" },
];

const MARKETING_STYLES = [
  { value: "authentic", label: "Authentic & Relatable" },
  { value: "aspirational", label: "Aspirational Lifestyle" },
  { value: "minimalist", label: "Clean & Minimalist" },
  { value: "bold", label: "Bold & Eye-catching" },
  { value: "storytelling", label: "Story-driven" },
  { value: "ugc", label: "User-Generated Style" },
];

export default function ModelGenerationContent() {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
  ]);
  const [campaignType, setCampaignType] = useState("");
  const [marketingStyle, setMarketingStyle] = useState("authentic");

  // Model Options
  const [modelOptions, setModelOptions] = useState({
    gender: "female",
    ethnicity: "diverse",
    age: "25-35",
    expression: "friendly smile",
    pose: "natural lifestyle",
  });

  // Clothing Options
  const [clothingOptions, setClothingOptions] = useState({
    type: "",
    color: "",
    style: "trendy casual",
    brand: "",
    season: "all-season",
  });

  // Background Options
  const [backgroundOptions, setBackgroundOptions] = useState({
    setting: "lifestyle environment",
    mood: "bright and airy",
    remove: false,
  });

  // Marketing Options
  const [marketingOptions, setMarketingOptions] = useState({
    targetAudience: "",
    brandTone: "",
    callToAction: "",
    hashtags: "",
  });

  // Brand Guidelines & Custom Prompt
  const [brandGuidelines, setBrandGuidelines] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Generated Models History
  const [generatedModels, setGeneratedModels] = useState<GeneratedModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<GeneratedModel | null>(
    null,
  );
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Currently generating model
  const [currentGeneration, setCurrentGeneration] = useState<{
    original: string | null;
    transparent: string | null;
  }>({ original: null, transparent: null });

  // Simulate generation progress
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      setGenerationProgress(0);
    }
  }, [isGenerating]);

  // Apply marketing template
  const applyTemplate = (template: (typeof MARKETING_TEMPLATES)[0]) => {
    setModelOptions({
      ...modelOptions,
      ...template.options,
    });

    setClothingOptions({
      ...clothingOptions,
      ...template.clothing,
    });

    setBackgroundOptions({
      ...backgroundOptions,
      ...template.background,
    });

    setSelectedTemplate(template.id);
    toast.success(`Applied "${template.name}" template`);
  };

  // Reset all options
  const resetOptions = () => {
    setModelOptions({
      gender: "female",
      ethnicity: "diverse",
      age: "25-35",
      expression: "friendly smile",
      pose: "natural lifestyle",
    });

    setClothingOptions({
      type: "",
      color: "",
      style: "trendy casual",
      brand: "",
      season: "all-season",
    });

    setBackgroundOptions({
      setting: "lifestyle environment",
      mood: "bright and airy",
      remove: false,
    });

    setMarketingOptions({
      targetAudience: "",
      brandTone: "",
      callToAction: "",
      hashtags: "",
    });

    setBrandGuidelines("");
    setCustomPrompt("");
    setSelectedTemplate(null);
    setSelectedPlatforms(["instagram"]);
    setCampaignType("");
    setMarketingStyle("authentic");
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!clothingOptions.type && !customPrompt) {
      setError("Please specify clothing type or add a custom prompt");
      return;
    }

    setIsGenerating(true);
    setGenerationStep("Creating marketing-ready content...");
    setError("");
    setCurrentGeneration({ original: null, transparent: null });

    try {
      // Create new model entry
      const newModel: GeneratedModel = {
        id: Date.now().toString(),
        imageUrl: "",
        prompt: "",
        modelOptions,
        clothingOptions,
        backgroundOptions,
        brandGuidelines,
        customPrompt,
        createdAt: new Date().toISOString(),
        status: "generating",
        tags: selectedPlatforms,
        campaign: campaignType,
        engagement: {
          likes: 0,
          shares: 0,
          comments: 0,
          saves: 0,
        },
      };

      setGeneratedModels((prev) => [newModel, ...prev]);

      // First API call - Generate the image
      const response = await fetch("/api/generate-fashion-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelOptions,
          clothingOptions,
          backgroundOptions,
          customPrompt,
          brandGuidelines,
          marketingOptions,
          selectedPlatforms,
          campaignType,
          marketingStyle,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setGeneratedModels((prev) =>
          prev.map((m) =>
            m.id === newModel.id ? { ...m, status: "failed" } : m,
          ),
        );
        return;
      }

      // Update with generated image
      if (data.imageUrl) {
        setCurrentGeneration({ original: data.imageUrl, transparent: null });

        // Update model in history
        setGeneratedModels((prev) =>
          prev.map((m) =>
            m.id === newModel.id
              ? {
                  ...m,
                  imageUrl: data.imageUrl,
                  prompt: data.prompt || "",
                  status: "completed",
                }
              : m,
          ),
        );

        // Handle background removal if needed
        if (data.requiresBackgroundRemoval) {
          setGenerationStep("Optimizing for social media...");

          try {
            const imageBase64 = data.imageUrl.split(",")[1];

            const bgResponse = await fetch("/api/remove-background", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                imageBase64,
                modelData: data.modelData,
              }),
            });

            const bgData = await bgResponse.json();

            if (bgData.transparentImageUrl) {
              setCurrentGeneration((prev) => ({
                ...prev,
                transparent: bgData.transparentImageUrl,
              }));

              setGeneratedModels((prev) =>
                prev.map((m) =>
                  m.id === newModel.id
                    ? {
                        ...m,
                        transparentUrl: bgData.transparentImageUrl,
                      }
                    : m,
                ),
              );
            }
          } catch (bgError) {
            console.error("Background removal error:", bgError);
          }
        }

        toast.success("Content generated successfully!");

        // Simulate social media format generation
        setTimeout(() => {
          const formats: any = {};
          selectedPlatforms.forEach((platform) => {
            formats[platform] = data.imageUrl; // In real app, would resize/crop
          });

          setGeneratedModels((prev) =>
            prev.map((m) =>
              m.id === newModel.id
                ? {
                    ...m,
                    socialMediaFormats: formats,
                  }
                : m,
            ),
          );
        }, 1000);
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Download image
  const downloadImage = (imageUrl: string, filename: string) => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy image to clipboard
  const copyImageToClipboard = async (imageUrl: string) => {
    try {
      const blob = await fetch(imageUrl).then((r) => r.blob());
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      toast.success("Image copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy image");
    }
  };

  // Delete model from history
  const deleteModel = (modelId: string) => {
    setGeneratedModels((prev) => prev.filter((m) => m.id !== modelId));
    toast.success("Model deleted");
  };

  // Filter models
  const filteredModels = generatedModels.filter((model) => {
    const matchesSearch =
      !searchQuery ||
      model.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesPlatform =
      filterPlatform === "all" || model.tags?.includes(filterPlatform);

    return matchesSearch && matchesPlatform;
  });

  const renderGenerateTab = () => (
    <div className="flex h-full">
      {/* Left Panel - Generation Options */}
      <div className="w-1/2 overflow-y-auto border-r p-6">
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-2xl font-bold">
              Create Marketing Content
            </h2>
            <p className="text-gray-600">
              Generate AI models optimized for social media engagement
            </p>
          </div>
          {/* Creative Brief */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-400">
                CREATIVE BRIEF (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Brand Guidelines</Label>
                <Textarea
                  placeholder="Describe your brand personality, values, and visual style..."
                  value={brandGuidelines}
                  onChange={(e) => setBrandGuidelines(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label>Custom Prompt</Label>
                <Textarea
                  placeholder="Any specific requirements, props, styling details, or creative ideas..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label>Hashtags & Keywords</Label>
                <Input
                  placeholder="#fashion #style #ootd"
                  value={marketingOptions.hashtags}
                  onChange={(e) =>
                    setMarketingOptions({
                      ...marketingOptions,
                      hashtags: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-400">
                MARKETING TEMPLATES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {MARKETING_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-all ${
                      selectedTemplate === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="h-20 w-16 rounded bg-gray-200" />
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                      <div className="mt-1 flex gap-1">
                        {template.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {selectedTemplate === template.id && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Media Platforms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-400">
                TARGET PLATFORMS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.value);

                  return (
                    <div
                      key={platform.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setSelectedPlatforms((prev) =>
                          isSelected
                            ? prev.filter((p) => p !== platform.value)
                            : [...prev, platform.value],
                        );
                      }}
                    >
                      <Icon
                        className={`h-5 w-5 ${isSelected ? "text-blue-500" : "text-gray-400"}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{platform.label}</p>
                        <p className="text-xs text-gray-500">
                          {platform.aspectRatio}
                        </p>
                      </div>
                      <Checkbox checked={isSelected} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Marketing Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-400">
                MARKETING STRATEGY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Campaign Type</Label>
                <Select value={campaignType} onValueChange={setCampaignType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Content Style</Label>
                <Select
                  value={marketingStyle}
                  onValueChange={setMarketingStyle}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARKETING_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Audience</Label>
                <Input
                  placeholder="e.g., Young professionals, Fashion enthusiasts"
                  value={marketingOptions.targetAudience}
                  onChange={(e) =>
                    setMarketingOptions({
                      ...marketingOptions,
                      targetAudience: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Brand Tone</Label>
                <Input
                  placeholder="e.g., Fun, Professional, Luxury"
                  value={marketingOptions.brandTone}
                  onChange={(e) =>
                    setMarketingOptions({
                      ...marketingOptions,
                      brandTone: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Model Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-400">
                MODEL SPECIFICATIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={modelOptions.gender}
                    onValueChange={(v) =>
                      setModelOptions({ ...modelOptions, gender: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Age Range</Label>
                  <Select
                    value={modelOptions.age}
                    onValueChange={(v) =>
                      setModelOptions({ ...modelOptions, age: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-35">25-35</SelectItem>
                      <SelectItem value="35-45">35-45</SelectItem>
                      <SelectItem value="45+">45+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Expression</Label>
                  <Select
                    value={modelOptions.expression}
                    onValueChange={(v) =>
                      setModelOptions({ ...modelOptions, expression: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly smile">
                        Friendly Smile
                      </SelectItem>
                      <SelectItem value="confident">Confident</SelectItem>
                      <SelectItem value="playful">Playful</SelectItem>
                      <SelectItem value="serious">Serious</SelectItem>
                      <SelectItem value="laughing">Laughing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Pose Style</Label>
                  <Select
                    value={modelOptions.pose}
                    onValueChange={(v) =>
                      setModelOptions({ ...modelOptions, pose: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural lifestyle">
                        Natural Lifestyle
                      </SelectItem>
                      <SelectItem value="action shot">Action Shot</SelectItem>
                      <SelectItem value="product focused">
                        Product Focused
                      </SelectItem>
                      <SelectItem value="editorial">Editorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clothing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-400">
                PRODUCT/CLOTHING
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Product Type</Label>
                <Input
                  placeholder="e.g., Summer dress, Sneakers, Watch"
                  value={clothingOptions.type}
                  onChange={(e) =>
                    setClothingOptions({
                      ...clothingOptions,
                      type: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Color Palette</Label>
                  <Input
                    placeholder="e.g., Pastel pink, Navy blue"
                    value={clothingOptions.color}
                    onChange={(e) =>
                      setClothingOptions({
                        ...clothingOptions,
                        color: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Season</Label>
                  <Select
                    value={clothingOptions.season}
                    onValueChange={(v) =>
                      setClothingOptions({ ...clothingOptions, season: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                      <SelectItem value="all-season">All Season</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Brand Name (Optional)</Label>
                <Input
                  placeholder="Your brand name"
                  value={clothingOptions.brand}
                  onChange={(e) =>
                    setClothingOptions({
                      ...clothingOptions,
                      brand: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Background & Environment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-400">
                SCENE & ENVIRONMENT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Background Setting</Label>
                <Select
                  value={backgroundOptions.setting}
                  onValueChange={(v) =>
                    setBackgroundOptions({ ...backgroundOptions, setting: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lifestyle environment">
                      Lifestyle Environment
                    </SelectItem>
                    <SelectItem value="urban street">Urban Street</SelectItem>
                    <SelectItem value="nature outdoor">
                      Nature/Outdoor
                    </SelectItem>
                    <SelectItem value="home interior">Home Interior</SelectItem>
                    <SelectItem value="studio minimal">
                      Studio Minimal
                    </SelectItem>
                    <SelectItem value="cafe restaurant">
                      Cafe/Restaurant
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mood & Lighting</Label>
                <Select
                  value={backgroundOptions.mood}
                  onValueChange={(v) =>
                    setBackgroundOptions({ ...backgroundOptions, mood: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bright and airy">
                      Bright & Airy
                    </SelectItem>
                    <SelectItem value="golden hour">Golden Hour</SelectItem>
                    <SelectItem value="moody dramatic">
                      Moody & Dramatic
                    </SelectItem>
                    <SelectItem value="soft natural">Soft Natural</SelectItem>
                    <SelectItem value="vibrant colorful">
                      Vibrant & Colorful
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="removeBackground"
                  checked={backgroundOptions.remove}
                  onCheckedChange={(checked) =>
                    setBackgroundOptions({
                      ...backgroundOptions,
                      remove: checked as boolean,
                    })
                  }
                />
                <label htmlFor="removeBackground" className="text-sm">
                  Generate transparent version for flexible use
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Creative Brief
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-400">
                CREATIVE BRIEF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Brand Guidelines</Label>
                <Textarea
                  placeholder="Describe your brand personality, values, and visual style..."
                  value={brandGuidelines}
                  onChange={(e) => setBrandGuidelines(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label>Additional Creative Direction</Label>
                <Textarea
                  placeholder="Any specific requirements, props, styling details, or creative ideas..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label>Hashtags & Keywords</Label>
                <Input
                  placeholder="#fashion #style #ootd"
                  value={marketingOptions.hashtags}
                  onChange={(e) =>
                    setMarketingOptions({
                      ...marketingOptions,
                      hashtags: e.target.value,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card> */}

          {/* Generate Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="h-12 w-full text-base"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {generationStep || "Generating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Marketing Content
                  </>
                )}
              </Button>

              {isGenerating && (
                <Progress value={generationProgress} className="mt-3" />
              )}

              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetOptions}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Options
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("history")}
                  className="flex-1"
                >
                  <History className="mr-2 h-4 w-4" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="relative w-1/2 bg-gray-50 p-6">
        <div className="absolute bottom-6 left-6 right-6 space-y-6">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Live Preview</h3>
            <p className="text-sm text-gray-600">
              Your generated content will appear here
            </p>
          </div>

          {currentGeneration.original || currentGeneration.transparent ? (
            <div className="space-y-6">
              {/* Main Preview */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={
                        currentGeneration.transparent ||
                        currentGeneration.original ||
                        ""
                      }
                      alt="Generated content"
                      className="h-full w-full object-contain"
                    />

                    {/* Platform Preview Badge */}
                    {selectedPlatforms.length > 0 && (
                      <div className="absolute left-4 top-4 flex gap-2">
                        {selectedPlatforms.map((platform) => {
                          const platformInfo = SOCIAL_PLATFORMS.find(
                            (p) => p.value === platform,
                          );
                          if (!platformInfo) return null;
                          const Icon = platformInfo.icon;
                          return (
                            <Badge
                              key={platform}
                              className="bg-white/90 backdrop-blur"
                            >
                              <Icon className="mr-1 h-3 w-3" />
                              {platformInfo.label}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadImage(
                      currentGeneration.transparent ||
                        currentGeneration.original ||
                        "",
                      `marketing-content-${Date.now()}.png`,
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    copyImageToClipboard(
                      currentGeneration.transparent ||
                        currentGeneration.original ||
                        "",
                    )
                  }
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>

              {/* Social Media Formats */}
              {selectedPlatforms.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Platform Optimized Versions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedPlatforms.map((platform) => {
                        const platformInfo = SOCIAL_PLATFORMS.find(
                          (p) => p.value === platform,
                        );
                        if (!platformInfo) return null;
                        const Icon = platformInfo.icon;

                        return (
                          <div key={platform} className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Icon className="h-4 w-4" />
                              <span>{platformInfo.label}</span>
                              <Badge variant="secondary" className="text-xs">
                                {platformInfo.aspectRatio}
                              </Badge>
                            </div>
                            <div className="aspect-square overflow-hidden rounded bg-gray-100">
                              <img
                                src={currentGeneration.original || ""}
                                alt={`${platform} preview`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Engagement Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Predicted Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <Heart className="mx-auto mb-1 h-5 w-5 text-red-500" />
                      <p className="text-2xl font-bold">2.4K</p>
                      <p className="text-xs text-gray-500">Likes</p>
                    </div>
                    <div>
                      <MessageCircle className="mx-auto mb-1 h-5 w-5 text-blue-500" />
                      <p className="text-2xl font-bold">186</p>
                      <p className="text-xs text-gray-500">Comments</p>
                    </div>
                    <div>
                      <Share2 className="mx-auto mb-1 h-5 w-5 text-green-500" />
                      <p className="text-2xl font-bold">94</p>
                      <p className="text-xs text-gray-500">Shares</p>
                    </div>
                    <div>
                      <Save className="mx-auto mb-1 h-5 w-5 text-purple-500" />
                      <p className="text-2xl font-bold">412</p>
                      <p className="text-xs text-gray-500">Saves</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Empty State */
            <Card className="flex h-[600px] items-center justify-center">
              <CardContent className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Camera className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="mb-2 text-lg font-medium">No Content Yet</h4>
                <p className="max-w-sm text-sm text-gray-500">
                  Configure your options and click generate to create
                  marketing-ready content
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="p-6">
      {/* Header with filters */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content History</h2>
          <p className="text-gray-600">
            {filteredModels.length}{" "}
            {filteredModels.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10"
            />
          </div>

          {/* Platform Filter */}
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {SOCIAL_PLATFORMS.map((platform) => (
                <SelectItem key={platform.value} value={platform.value}>
                  {platform.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Grid/List */}
      {filteredModels.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <Card
                key={model.id}
                className="group cursor-pointer overflow-hidden"
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={model.transparentUrl || model.imageUrl}
                    alt="Generated model"
                    className="h-full w-full object-cover"
                  />

                  {/* Status Badge */}
                  {model.status === "generating" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}

                  {model.status === "failed" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModel(model);
                        setIsDetailDrawerOpen(true);
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(
                          model.transparentUrl || model.imageUrl,
                          `model-${model.id}.png`,
                        );
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteModel(model.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Platform Tags */}
                  {model.tags && model.tags.length > 0 && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {model.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} className="bg-white/90 text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {model.tags.length > 2 && (
                        <Badge className="bg-white/90 text-xs">
                          +{model.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="line-clamp-1 text-sm font-medium">
                      {model.clothingOptions.type || "Custom Model"}
                    </h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => copyImageToClipboard(model.imageUrl)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Image
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedModel(model);
                            setIsDetailDrawerOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteModel(model.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {model.campaign && (
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {
                        CAMPAIGN_TYPES.find((c) => c.value === model.campaign)
                          ?.label
                      }
                    </Badge>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(model.createdAt).toLocaleDateString()}
                    </span>
                    {model.engagement && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {model.engagement.likes}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredModels.map((model) => (
              <Card key={model.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      <img
                        src={model.transparentUrl || model.imageUrl}
                        alt="Generated model"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            {model.clothingOptions.type || "Custom Model"}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {model.prompt.slice(0, 100)}...
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedModel(model);
                              setIsDetailDrawerOpen(true);
                            }}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  downloadImage(
                                    model.imageUrl,
                                    `model-${model.id}.png`,
                                  )
                                }
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  copyImageToClipboard(model.imageUrl)
                                }
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Image
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteModel(model.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {model.tags &&
                          model.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}

                        {model.campaign && (
                          <Badge variant="outline" className="text-xs">
                            {
                              CAMPAIGN_TYPES.find(
                                (c) => c.value === model.campaign,
                              )?.label
                            }
                          </Badge>
                        )}

                        <span className="ml-auto text-xs text-gray-500">
                          {new Date(model.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <Card className="flex h-96 items-center justify-center">
          <CardContent className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <History className="h-10 w-10 text-gray-400" />
            </div>
            <h4 className="mb-2 text-lg font-medium">No Content Found</h4>
            <p className="max-w-sm text-sm text-gray-500">
              {searchQuery || filterPlatform !== "all"
                ? "Try adjusting your filters"
                : "Start generating content to build your history"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              Social Media Content Generator
            </h1>
            <Badge variant="secondary">Beta</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col"
      >
        <TabsList className="mx-6 mt-4 w-fit">
          <TabsTrigger value="generate" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="model-swap" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Model Swap
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History ({generatedModels.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="generate" className="m-0 h-full">
            {renderGenerateTab()}
          </TabsContent>

          <TabsContent
            value="model-swap"
            className="m-0 h-full overflow-y-auto"
          >
            <TryOnStudioContent />
          </TabsContent>

          <TabsContent value="history" className="m-0 h-full overflow-y-auto">
            {renderHistoryTab()}
          </TabsContent>

          <TabsContent value="analytics" className="m-0 h-full p-6">
            <div className="py-20 text-center">
              <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium">
                Analytics Coming Soon
              </h3>
              <p className="text-gray-500">
                Track performance and engagement metrics
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Detail Drawer */}
      <Drawer.Root
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-[90vh] flex-col rounded-t-[10px] bg-white">
            <div className="flex-1 overflow-y-auto rounded-t-[10px] bg-white p-4">
              <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300" />

              {selectedModel && (
                <div className="mx-auto max-w-4xl space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Content Details</h2>
                      <p className="text-gray-500">
                        Created{" "}
                        {new Date(selectedModel.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDetailDrawerOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="p-0">
                          <img
                            src={
                              selectedModel.transparentUrl ||
                              selectedModel.imageUrl
                            }
                            alt="Generated content"
                            className="w-full rounded-lg"
                          />
                        </CardContent>
                      </Card>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() =>
                            downloadImage(
                              selectedModel.transparentUrl ||
                                selectedModel.imageUrl,
                              `content-${selectedModel.id}.png`,
                            )
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            copyImageToClipboard(selectedModel.imageUrl)
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Generation Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-xs text-gray-500">
                              Platforms
                            </Label>
                            <div className="mt-1 flex gap-2">
                              {selectedModel.tags?.map((tag) => (
                                <Badge key={tag}>{tag}</Badge>
                              ))}
                            </div>
                          </div>

                          {selectedModel.campaign && (
                            <div>
                              <Label className="text-xs text-gray-500">
                                Campaign
                              </Label>
                              <p className="font-medium">
                                {
                                  CAMPAIGN_TYPES.find(
                                    (c) => c.value === selectedModel.campaign,
                                  )?.label
                                }
                              </p>
                            </div>
                          )}

                          <div>
                            <Label className="text-xs text-gray-500">
                              Model Specs
                            </Label>
                            <p className="text-sm">
                              {selectedModel.modelOptions.gender},{" "}
                              {selectedModel.modelOptions.age},
                              {selectedModel.modelOptions.expression}
                            </p>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">
                              Clothing
                            </Label>
                            <p className="text-sm">
                              {selectedModel.clothingOptions.type} -{" "}
                              {selectedModel.clothingOptions.color}
                            </p>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500">
                              Prompt
                            </Label>
                            <p className="line-clamp-3 text-sm text-gray-600">
                              {selectedModel.prompt}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Engagement Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded bg-gray-50 p-3 text-center">
                              <Heart className="mx-auto mb-1 h-5 w-5 text-red-500" />
                              <p className="text-xl font-bold">2.4K</p>
                              <p className="text-xs text-gray-500">Likes</p>
                            </div>
                            <div className="rounded bg-gray-50 p-3 text-center">
                              <MessageCircle className="mx-auto mb-1 h-5 w-5 text-blue-500" />
                              <p className="text-xl font-bold">186</p>
                              <p className="text-xs text-gray-500">Comments</p>
                            </div>
                            <div className="rounded bg-gray-50 p-3 text-center">
                              <Share2 className="mx-auto mb-1 h-5 w-5 text-green-500" />
                              <p className="text-xl font-bold">94</p>
                              <p className="text-xs text-gray-500">Shares</p>
                            </div>
                            <div className="rounded bg-gray-50 p-3 text-center">
                              <Save className="mx-auto mb-1 h-5 w-5 text-purple-500" />
                              <p className="text-xl font-bold">412</p>
                              <p className="text-xs text-gray-500">Saves</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
