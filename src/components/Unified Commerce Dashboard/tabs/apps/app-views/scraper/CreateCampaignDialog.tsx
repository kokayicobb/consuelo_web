"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { CreateCampaignRequest, PlatformType, CampaignFrequency } from "@/types/lead-scraper"

const PLATFORM_OPTIONS: { value: PlatformType; label: string; description: string }[] = [
  { value: "reddit", label: "Reddit", description: "Scrape posts and comments from subreddits" },
  { value: "linkedin", label: "LinkedIn", description: "Extract company pages and executive profiles" },
  { value: "website", label: "Company Websites", description: "Crawl websites for contact information" },
  { value: "hackernews", label: "Hacker News", description: "Find tech discussions and startups" },
  { value: "indiehackers", label: "IndieHackers", description: "Discover bootstrapped founders" },
  { value: "producthunt", label: "Product Hunt", description: "Find new product launches" },
  { value: "twitter", label: "Twitter/X", description: "Monitor company mentions and threads" },
]

interface CreateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCampaignRequest) => void
}

export function CreateCampaignDialog({ open, onOpenChange, onSubmit }: CreateCampaignDialogProps) {
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    name: "",
    description: "",
    platforms: [],
    keywords: [],
    targetCriteria: {
      // negative_keywords: [],
      job_titles: [],
      industries: [],
      company_sizes: [],
      locations: [],
    },
    frequency: "once",
    schedule: {},
    // filters: {},
    // leadScoringRules: {},
    platformConfigs: {},
  })

  const [keywordInput, setKeywordInput] = useState("")
  const [negativeKeywordInput, setNegativeKeywordInput] = useState("")
  const [jobTitleInput, setJobTitleInput] = useState("")
  const [industryInput, setIndustryInput] = useState("")
  const [locationInput, setLocationInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create platform configs for selected platforms
    const platformConfigs: Record<string, any> = {}
    formData.platforms.forEach((platform) => {
      platformConfigs[platform] = getPlatformDefaultConfig(platform)
    })

    onSubmit({
      ...formData,
      platformConfigs,
    })
  }

  const getPlatformDefaultConfig = (platform: PlatformType) => {
    switch (platform) {
      case "reddit":
        return { subreddits: ["entrepreneur", "startups", "SaaS"] }
      case "linkedin":
        return { search_terms: formData.keywords }
      case "website":
        return { urls: [] }
      case "twitter":
        return { search_terms: formData.keywords }
      default:
        return {}
    }
  }

  const addKeyword = (type: "keywords") => {
    if (keywordInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()],
      }))
      setKeywordInput("")
    }
  }

  const addTargetCriteria = (
    type: "negative_keywords" | "job_titles" | "industries" | "company_sizes" | "locations"
  ) => {
    const inputMap = {
      negative_keywords: negativeKeywordInput,
      job_titles: jobTitleInput,
      industries: industryInput,
      company_sizes: "", // You might want to add this input
      locations: locationInput,
    }

    const setterMap = {
      negative_keywords: setNegativeKeywordInput,
      job_titles: setJobTitleInput,
      industries: setIndustryInput,
      company_sizes: () => {}, // Add setter if needed
      locations: setLocationInput,
    }

    const input = inputMap[type]
    const setter = setterMap[type]

    if (input && input.trim()) {
      setFormData((prev) => ({
        ...prev,
        targetCriteria: {
          ...prev.targetCriteria,
          [type]: [...(prev.targetCriteria?.[type] || []), input.trim()],
        },
      }))
      setter("")
    }
  }

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords?.filter((_, i) => i !== index) || [],
    }))
  }

  const removeTargetCriteria = (
    type: "negative_keywords" | "job_titles" | "industries" | "company_sizes" | "locations",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      targetCriteria: {
        ...prev.targetCriteria,
        [type]: prev.targetCriteria?.[type]?.filter((_, i) => i !== index) || [],
      },
    }))
  }

  const togglePlatform = (platform: PlatformType) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Scraping Campaign</DialogTitle>
          <DialogDescription>
            Set up a new lead scraping campaign to automatically find potential customers across multiple platforms
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., SaaS Founders Campaign"
                required
              />
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: CampaignFrequency) => setFormData((prev) => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Run Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this campaign will search for..."
              rows={3}
            />
          </div>

          {/* Platform Selection */}
          <div>
            <Label>Platforms to Scrape *</Label>
            <div className="grid gap-3 md:grid-cols-2 mt-2">
              {PLATFORM_OPTIONS.map((platform) => (
                <Card
                  key={platform.value}
                  className={`cursor-pointer transition-colors ${
                    formData.platforms.includes(platform.value) ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => togglePlatform(platform.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          formData.platforms.includes(platform.value)
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.platforms.includes(platform.value) && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{platform.label}</h4>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <Label>Keywords</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Add keyword..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword("keywords"))}
              />
              <Button type="button" onClick={() => addKeyword("keywords")}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.keywords?.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeKeyword(index)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Negative Keywords */}
          <div>
            <Label>Negative Keywords</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={negativeKeywordInput}
                onChange={(e) => setNegativeKeywordInput(e.target.value)}
                placeholder="Add negative keyword..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTargetCriteria("negative_keywords"))}
              />
              <Button type="button" onClick={() => addTargetCriteria("negative_keywords")}>
                Add
              </Button>
            </div>
            {/* <div className="flex flex-wrap gap-2 mt-2">
              {formData.targetCriteria?.negative_keywords?.map((keyword, index) => (
                <Badge key={index} variant="destructive" className="flex items-center gap-1">
                  {keyword}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTargetCriteria("negative_keywords", index)} />
                </Badge>
              ))}
            </div> */}
          </div>

          {/* Target Criteria */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Target Job Titles</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                  placeholder="e.g., CEO, Founder"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTargetCriteria("job_titles"))}
                />
                <Button type="button" onClick={() => addTargetCriteria("job_titles")}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.targetCriteria?.job_titles?.map((title, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {title}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTargetCriteria("job_titles", index)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Target Industries</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  placeholder="e.g., Technology, SaaS"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTargetCriteria("industries"))}
                />
                <Button type="button" onClick={() => addTargetCriteria("industries")}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.targetCriteria?.industries?.map((industry, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {industry}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTargetCriteria("industries", index)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Target Locations</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="e.g., San Francisco, New York"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTargetCriteria("locations"))}
              />
              <Button type="button" onClick={() => addTargetCriteria("locations")}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.targetCriteria?.locations?.map((location, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {location}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTargetCriteria("locations", index)} />
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || formData.platforms.length === 0}>
              Create Campaign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}