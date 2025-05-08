// src/types/chat.ts (or your chosen path)
import type { QueryExplanation, Config } from "./otf"; // Assuming your otf types are here

export interface ChatMessageData {
  sqlQuery?: string;
  explanations?: QueryExplanation[];
  queryResults?: any[];
  columns?: string[];
  chartConfig?: Config | null;
  actionSuggestions?: any | null;
  viewMode?: "table" | "chart" | "actions" | "cards";
  aiThoughts?: string;
  isLoadingChart?: boolean;
  isLoadingActions?: boolean;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | React.ReactNode; 
  data?: ChatMessageData;
  timestamp: Date;
}