import { ApolloSearchParams, ApolloSearchResponse, ApolloContact } from '../../types/apollo';

export class ApolloService {
  private baseUrl = 'https://api.apollo.io/api/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Apollo API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  async searchPeople(params: ApolloSearchParams): Promise<ApolloSearchResponse> {
    const searchPayload = this.buildSearchPayload(params);
    
    return this.makeRequest<ApolloSearchResponse>('/mixed_people/search', {
      method: 'POST',
      body: JSON.stringify(searchPayload),
    });
  }

  async enrichPerson(email: string): Promise<ApolloContact> {
    return this.makeRequest<ApolloContact>('/people/match', {
      method: 'POST',
      body: JSON.stringify({
        email,
        reveal_personal_emails: true,
        reveal_phone_number: true,
      }),
    });
  }

  private buildSearchPayload(params: ApolloSearchParams): any {
    const payload: any = {};

    if (params.jobTitle && params.jobTitle.trim()) {
      payload.person_titles = [params.jobTitle.trim()];
    }

    if (params.location && params.location.trim()) {
      payload.person_locations = [params.location.trim()];
    }

    if (params.industry && params.industry !== 'any') {
      payload.organization_industries = [this.mapIndustry(params.industry)];
    }

    if (params.companySize && params.companySize !== 'any') {
      payload.organization_num_employees_ranges = [params.companySize];
    }

    // Add default pagination
    payload.page = 1;
    payload.per_page = 25;

    return payload;
  }

  private mapIndustry(industry: string): string {
    const industryMap: Record<string, string> = {
      'banking': 'Banking',
      'financial services': 'Financial Services',
      'insurance': 'Insurance',
      'real estate': 'Real Estate',
      'technology': 'Technology',
      'healthcare': 'Healthcare',
    };

    return industryMap[industry.toLowerCase()] || industry;
  }
}