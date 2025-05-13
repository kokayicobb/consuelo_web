// Client record from otf-clients table
export interface OtfClient {
  "Client ID": string;
  "Client": string;
  "Email": string | null;
  "Phone": string | null;
  "Last Visit": string | null;
  "# Visits": number | null;
  "Pricing Option": string | null;
  "Expiration Date": string | null;
  "Staff": string | null;
  "Cross Regional Visit": boolean | null;
  "Visit Type": string | null;
  "Booking Method": string | null;
  "Referral Type": string | null;
  [key: string]: any; 
}

// Contact log from otf-contact-logs table
export interface OtfContactLog {
  "Log Date": string;
  "Client": string;
  "Contact Method": string | null;
  "Contact Log": string | null;
  "Log Type": string | null;
  "Sub Type": string | null;
  "Contact": string | null;
}

// Intro client from otf-intro-clients table
export interface OtfIntroClient {
  "Client ID": string;
  "Client": string;
  "Email": string | null;
  "Phone": string | null;
  "# Visits since First Visit": number | null;
  "First Visit": string | null;
  "Staff": string | null;
  "Pricing Option": string | null;
  "Visit Type": string | null;
  "Visit Location": string | null;
  "Cross-Regional": boolean | null;
  "Booking Method": string | null;
  "Referral Type": string | null;
}

// Sales record from otf-sales table
export interface OtfSale {
  "Client ID": string;
  "Client": string;
  "Sale Date": string | null;
  "Item name": string | null;
  "Total Paid w/ Payment Method": string | null;
  "Sale ID": number | null;
  "Batch #": string | null;
  "Sales Notes": string | null;
  "Location": string | null;
  "Notes": string | null;
  "Item price": string | null;
  "Subtotal": string | null;
  "Discount %": string | null;
  "Discount amount": string | null;
  "Tax": string | null;
  "Item Total": string | null;
  "Payment Method": string | null;
}

// Schedule entry from otf-schedule table
export interface OtfSchedule {
  "Client ID": string;
  "Description": string | null;
  "Start time": string | null;
  "Client": string;
  "Status": string | null;
  "Staff": string | null;
  "Date": string | null;
  "First Visit": boolean | null;
  "Scheduled Online": boolean | null;
  "End time": string | null;
  "Membership": string | null;
  "Staff Alert": string | null;
  "Yellow Alert": string | null;
  "Appointment Notes": string | null;
  "Notes": string | null;
  "Unpaid Appointment": string | null;
  "Birthday": string | null;
}

// Generic result type for query results
export type Result = Record<string, any>;

// Type for SQL query explanations
export type QueryExplanation = {
  section: string;
  explanation: string;
};

// Type for chart configuration
export type Config = {
  description: string;
  takeaway: string;
  type: 'bar' | 'line' | 'area' | 'pie';
  title: string;
  xKey: string;
  yKeys: string[];
  multipleLines?: boolean;
  measurementColumn?: string;
  lineCategories?: string[];
  colors?: Record<string, string>;
  legend?: boolean;
};

// Action suggestions types
export interface ActionSuggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  scriptTemplate?: string;
}

export interface ActionSuggestions {
  actions: ActionSuggestion[];
  summary: string;
}