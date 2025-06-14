// types/apollo.ts
export interface ApolloSearchParams {
  jobTitle?: string;
  industry?: string;
  location?: string;
  companySize?: string;
  experienceLevel?: string;
}

export interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email?: string;
  phone?: string;
  title: string;
  linkedin_url?: string;
  organization_id?: string;
  organization?: {
    id: string;
    name: string;
    website_url?: string;
    linkedin_url?: string;
  };
  employment_history?: EmploymentHistory[];
  location?: string; // Added location to contact
}

export interface EmploymentHistory {
  id: string;
  title: string;
  organization_name: string;
  start_date: string;
  end_date?: string;
  current: boolean;
}

// Updated to include summary
export interface ApolloSearchResponse {
  people: ApolloContact[];
  pagination?: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
  summary?: ApolloSearchSummary; // Added summary property
}

// New interface for search summary
export interface ApolloSearchSummary {
  returned: number;
  totalAvailable?: number;
  currentPage?: number;
  totalPages?: number;
  pagesFetched?: number;
  maxResults?: number;
  withEmail: number;
  withPhone: number;
}

export interface ApolloApiError {
  error: string;
  message: string;
}