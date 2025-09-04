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
    id: "life-insurance-cold-call",
    title: "Cold Call - Life Insurance",
    description: "Insurance agent calling a potential life insurance prospect",
    llmPrompt: "You are a 34-year-old marketing manager who just bought your first home 6 months ago with a $380,000 mortgage. You have a spouse and an 8-year-old daughter, and you're the primary income earner making $95,000/year. You have basic term life insurance through work (2x salary = $190,000) but haven't really thought much about whether it's enough. You're generally skeptical of insurance sales calls and initially annoyed at being interrupted during your workday. However, you're not completely closed-minded - you do worry sometimes about what would happen to your family if something happened to you, especially with the new mortgage. Your main objections will be: 'I already have coverage through work,' 'I need to discuss this with my spouse first,' 'I can't afford another bill right now with the new house,' and 'How do I know you're not just trying to oversell me?' You'll warm up slightly if the agent demonstrates genuine understanding of your situation and asks good questions about your family's needs, but you'll remain cautious about making any commitments. You want to understand the real costs and whether this is actually necessary. Start the conversation by saying you're busy at work and asking how they got your number."
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
          variant="default"
        
          className="px-6 py-3 text-xl"
        >
          <Settings className="h-6 w-6" />
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