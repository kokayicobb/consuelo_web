"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Settings } from "lucide-react";

interface Voice {
  voice_id: string;
  name: string;
  description?: string;
  category?: string;
  labels?: Record<string, string>;
  preview_url?: string;
}

interface PresetScenario {
  id: string;
  title: string;
  description: string;
  llmPrompt: string;
}

interface SettingsProps {
  scenario: string;
  setScenario: (scenario: string) => void;
  availableVoices: Voice[];
  selectedVoiceId: string;
  setSelectedVoiceId: (voiceId: string) => void;
  isLoadingVoices: boolean;
}

const presetScenarios: PresetScenario[] = [
  {
    id: "cold-call-crm",
    title: "Cold Call - CRM Software",
    description: "Selling CRM software to a busy business owner",
    llmPrompt: "You are a busy business owner who has been cold-called about CRM software. You run a mid-sized marketing agency with 25 employees and are currently using a mix of spreadsheets and basic tools to manage client relationships. You're skeptical of sales calls and initially resistant, but you do have real pain points around client data organization, follow-up tracking, and team collaboration. You tend to be direct, ask tough questions about ROI, and want to see concrete examples of how this would solve your specific problems. Start the conversation with mild irritation at being interrupted during your busy day."
  },
  {
    id: "enterprise-saas",
    title: "Enterprise SaaS Demo",
    description: "Evaluating enterprise software solution",
    llmPrompt: "You are a VP of Operations at a Fortune 500 company evaluating a new enterprise SaaS solution. You have a committee decision-making process, strict security requirements, and need to see detailed integration capabilities. You're professional but cautious, ask about compliance, scalability, and implementation timelines. You have experience with similar tools and will compare features. You're looking for a solution that can handle 10,000+ users across multiple departments. Start by expressing interest but mention you need to understand the technical specifications and security protocols."
  },
  {
    id: "budget-conscious-startup",
    title: "Startup on a Budget",
    description: "Cost-sensitive startup founder",
    llmPrompt: "You are a startup founder with limited budget who has shown interest in a business solution. You're bootstrapped with a team of 8 people and every dollar counts. You're interested in the solution but very price-sensitive and need to justify every expense to your co-founder. You ask detailed questions about pricing, what's included in different tiers, and whether there are startup discounts. You're also concerned about switching costs and want to know about free trials or money-back guarantees. Start the conversation by mentioning you're interested but need to understand the costs clearly."
  },
  {
    id: "competitor-comparison",
    title: "Comparing Competitors",
    description: "Prospect already using a competitor",
    llmPrompt: "You are currently using a competitor's solution and are reasonably satisfied but open to hearing about alternatives. You've been using your current tool for 2 years and have invested time in training your team. You're not actively looking to switch but will listen if there are compelling reasons. You ask direct comparison questions, want to know about migration support, and are concerned about disrupting current workflows. You mention specific features you like about your current solution and challenge the salesperson to show clear advantages. Start by mentioning you're already using [competitor name] and asking why you should consider switching."
  },
  {
    id: "decision-maker-busy",
    title: "Busy Executive",
    description: "Time-pressed C-level executive",
    llmPrompt: "You are a C-level executive (CEO/CFO/COO) who is extremely time-conscious and gets straight to the point. You have only 10 minutes for this call and need to see immediate value. You think in terms of ROI, business impact, and strategic advantages. You don't want to hear about features - you want to know how this solves business problems and drives results. You ask tough questions about measurable outcomes and expect concrete examples and case studies. You may mention that you'll need to involve other stakeholders if you see value. Start by mentioning you have limited time and need to understand the business impact quickly."
  },
  {
    id: "technical-buyer",
    title: "Technical Evaluation",
    description: "IT/Technical decision maker",
    llmPrompt: "You are a CTO or IT Director evaluating a technical solution. You're focused on integration capabilities, API availability, security features, scalability, and technical architecture. You ask detailed technical questions about data handling, backup procedures, compliance certifications, and integration with existing systems. You're less concerned with sales pitches and more interested in technical specifications, implementation requirements, and ongoing support. You need to present technical details to your team and want documentation. Start by asking about the technical architecture and integration capabilities."
  }
];

export default function RoleplaySettings({
  scenario,
  setScenario,
  availableVoices,
  selectedVoiceId,
  setSelectedVoiceId,
  isLoadingVoices,
}: SettingsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scenarioType, setScenarioType] = useState<"preset" | "custom">(
    scenario && !presetScenarios.find(p => p.llmPrompt === scenario) ? "custom" : "preset"
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    const preset = presetScenarios.find(p => p.llmPrompt === scenario);
    return preset ? preset.id : presetScenarios[0].id;
  });
  const [customScenario, setCustomScenario] = useState(
    scenario && !presetScenarios.find(p => p.llmPrompt === scenario) ? scenario : ""
  );

  // Update scenario when preset selection changes
  useEffect(() => {
    if (scenarioType === "preset") {
      const selectedPreset = presetScenarios.find(p => p.id === selectedPresetId);
      if (selectedPreset) {
        setScenario(selectedPreset.llmPrompt);
      }
    } else {
      setScenario(customScenario);
    }
  }, [scenarioType, selectedPresetId, customScenario, setScenario]);

  const handleSaveSettings = () => {
    if (scenarioType === "preset") {
      const selectedPreset = presetScenarios.find(p => p.id === selectedPresetId);
      if (selectedPreset) {
        setScenario(selectedPreset.llmPrompt);
      }
    } else {
      setScenario(customScenario);
    }
    setIsModalOpen(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white/80 backdrop-blur-sm"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="mx-auto w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Roleplay Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Scenario Setup */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Sales Scenario</Label>
            
            <RadioGroup
              value={scenarioType}
              onValueChange={(value) => setScenarioType(value as "preset" | "custom")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="preset" id="preset" />
                <Label htmlFor="preset">Choose from presets</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Create custom scenario</Label>
              </div>
            </RadioGroup>

            {scenarioType === "preset" ? (
              <div className="space-y-3">
                <Label htmlFor="preset-select">Select Scenario</Label>
                <Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a scenario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {presetScenarios.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{preset.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {preset.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Show selected preset description */}
                {selectedPresetId && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">
                      {presetScenarios.find(p => p.id === selectedPresetId)?.description}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="custom-scenario">
                  Describe your custom sales scenario
                </Label>
                <Textarea
                  id="custom-scenario"
                  placeholder="e.g., Cold calling a potential client who needs CRM software. They're busy and skeptical about sales calls..."
                  value={customScenario}
                  onChange={(e) => setCustomScenario(e.target.value)}
                  rows={4}
                  className="w-full mt-2"
                />
              </div>
            )}
          </div>

          {/* Voice Selection */}
          <div className="space-y-3">
            <Label htmlFor="voice" className="text-base font-semibold">AI Prospect Voice</Label>
            <Select
              value={selectedVoiceId}
              onValueChange={setSelectedVoiceId}
              disabled={isLoadingVoices}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingVoices
                      ? "Loading voices..."
                      : "Select a voice"
                  }
                >
                  {selectedVoiceId && availableVoices.find(v => v.voice_id === selectedVoiceId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableVoices.map((voice) => (
                  <SelectItem
                    key={voice.voice_id}
                    value={voice.voice_id}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{voice.name}</span>
                      {voice.description && (
                        <span className="text-xs text-muted-foreground">
                          {voice.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSaveSettings}
            className="w-full"
            disabled={
              (scenarioType === "custom" && !customScenario.trim()) ||
              !selectedVoiceId
            }
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}