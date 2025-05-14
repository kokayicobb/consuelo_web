// src/types/chat.ts (or your chosen path)
import type { QueryExplanation, Config } from "./otf"; // Assuming your otf types are here

export interface ChatMessageData {
  sqlQuery?: string;
 
  explanations?: QueryExplanation[];
  queryResults?: any[];
  columns?: string[];
  chartConfig?: Config | null;
  actionSuggestions?: any | null;
 
  aiThoughts?: string;
  isLoadingChart?: boolean;
  isLoadingActions?: boolean;
  error?: string;
  viewMode?: "table" | "chart" | "actions" | "cards" | "leadGenerator"; // Add leadGenerator as an option
  queryContext?: string; // Add this to store the research query
  userQuery?: string; // You might already have this
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | React.ReactNode; 
  data?: ChatMessageData;
  timestamp: Date;
}