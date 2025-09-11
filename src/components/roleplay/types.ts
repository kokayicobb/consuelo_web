// Base roleplay data types based on existing API structure

export interface Scenario {
  id: string;
  title: string;
  description: string;
  llmPrompt: string; // For AI prospect behavior
}

export interface Character {
  id: string;
  name: string;
  role: string; // e.g., "Prospect", "Gatekeeper", "Decision Maker"
  personality: string;
  background: string;
  objections: string[]; // Common objections they might raise
  voice_id?: string; // For ElevenLabs TTS
  scenario_ids: string[]; // Scenarios this character appears in
  created_at: string;
}

export interface ConversationEntry {
  role: 'user' | 'assistant'; // user = sales rep, assistant = AI prospect
  text: string;
  timestamp: string;
  audio_duration?: number; // seconds, if voice was used
}

export interface RoleplaySession {
  id: string;
  session_id: string; // Unique session identifier
  scenario_id: string;
  character_id?: string;
  user_id: string;
  status: 'active' | 'completed' | 'paused' | 'ended';
  start_time: string;
  end_time?: string;
  total_duration?: number; // seconds
  conversation_history: ConversationEntry[];
  voice_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionAnalytics {
  id: string;
  session_id: string;
  scenario_id: string;
  overall_score: number; // 1-10
  communication_score: number;
  objection_handling_score: number;
  rapport_building_score: number;
  closing_technique_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  key_moments: Array<{
    timestamp: string;
    description: string;
    score_impact: number;
  }>;
  objections_encountered: string[];
  objections_handled_well: string[];
  missed_opportunities: string[];
  coaching_recommendations: string[];
  conversation_flow_analysis: string;
  next_steps_suggestions: string[];
  created_at: string;
}

export interface RoleplayTip {
  id: string;
  session_id?: string; // Optional - can be general tips
  category: 'objection_handling' | 'rapport_building' | 'closing' | 'discovery' | 'presentation';
  title: string;
  content: string;
  techniques: string[];
  practice_scenarios: string[];
  related_scenarios: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_featured: boolean;
  created_at: string;
}

export interface VoiceSettings {
  voice_id: string;
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

// API Response Types (matching your existing APIs)

export interface ChatResponse {
  response: string;
  error?: string;
  details?: string;
}

export interface TranscribeResponse {
  text: string;
  language?: string;
  duration?: number;
  message?: string; // For "No speech detected" cases
  error?: string;
  details?: string;
}

export interface TTSResponse {
  audio_base64?: string;
  mime_type?: string;
  voice_id?: string;
  use_browser_tts?: boolean;
  voice_settings?: {
    rate: number;
    pitch: number;
    volume: number;
  };
  text?: string; // For browser TTS fallback
  error?: string;
  details?: string;
}

// Command Palette specific types

export interface RoleplayCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (scenario: Scenario, character?: Character) => void;
  onResumeSession: (session: RoleplaySession) => void;
  currentUser: string;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  voiceEnabled: boolean;
  onVoiceToggle: (enabled: boolean) => void;
}

export type ViewType = 
  | 'main' 
  | 'scenarios' 
  | 'characters' 
  | 'sessions' 
  | 'analytics' 
  | 'tips' 
  | 'recent_tips'
  | 'settings' 
  | 'shortcuts'
  | 'session_detail'
  | 'analytics_detail';

// Mock data for development (matches your existing scenario structure)
export const mockScenarios: Scenario[] = [
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

export const mockCharacters: Character[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    role: 'CEO',
    personality: 'Direct, time-conscious, results-focused',
    background: 'Runs a 50-person tech startup, previously worked at Google',
    objections: ['Too expensive', 'No time for demos', 'Happy with current solution'],
    voice_id: 'jqcCZkN6Knx8BJ5TBdYR',
    scenario_ids: ['1'],
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'Procurement Manager', 
    personality: 'Analytical, thorough, budget-conscious',
    background: 'Manufacturing company, responsible for vendor relationships',
    objections: ['Need to compare options', 'Budget constraints', 'Implementation concerns'],
    scenario_ids: ['2'],
    created_at: new Date().toISOString()
  }
];