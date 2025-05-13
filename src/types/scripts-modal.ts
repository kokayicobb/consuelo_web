// types/script-modal.d.ts
import type { OtfClient, OtfContactLog, OtfIntroClient } from '@/types/otf';

/**
 * Client data structure to be passed to script generation
 */
export interface ClientScriptData {
  // Use the main client data
  clientInfo?: Partial<OtfClient>;
  // Contact logs for personalization
  contactLogs?: OtfContactLog[];
  // Optional intro client info
  introInfo?: Partial<OtfIntroClient>;
  // Additional client context that might not be in the standard interfaces
  membershipType?: string;
  coach?: string;
  joinDate?: string;
  lastVisit?: string;
  [key: string]: any;
}

/**
 * SuggestedAction interface aligned with ActionSuggestion
 * but with additional fields needed for script generation
 */
export interface SuggestedAction {
  // Type of action (call script, email script, etc)
  type: string;
  // Title of the action (display name)
  title: string;
  // Description of what the action does
  description: string;
  // Priority level (high, medium, low)
  priority: 'high' | 'medium' | 'low';
  // Optional effort level
  effort?: 'easy' | 'medium' | 'hard';
  // Optional script template
  scriptTemplate?: string;
  // Optional payload with additional data
  payload?: {
    clientId?: string;
    contact?: string;
    [key: string]: any;
  };
}

/**
 * Parameters for script generation
 */
export interface ScriptGenerationParams {
  scriptType: 'call' | 'email';
  clientName?: string;
  queryContext?: string;
  contactLogs?: OtfContactLog[];
  clientContext?: {
    membershipType?: string;
    coach?: string;
    joinDate?: string;
    lastVisit?: string;
    [key: string]: any;
  };
}

/**
 * Script modal state
 */
export interface ScriptModalState {
  isOpen: boolean;
  type: 'call' | 'email';
  clientName: string;
  script?: string;
  contactLogs?: OtfContactLog[];
  clientData?: ClientScriptData;
}

/**
 * Contact modal state
 */
export interface ContactModalState {
  type: "email" | "phone";
  contact: string;
  clientName: string;
  clientData?: ClientScriptData;
}