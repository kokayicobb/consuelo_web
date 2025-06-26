import { ApolloSearchParams, ApolloSearchResponse, ApolloContact } from '../../types/apollo';
// lib/apollo-client.ts
export class ApolloClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/apollo') {
    this.baseUrl = baseUrl;
  }

  // Original single-page search
  async searchContacts(params: ApolloSearchParams): Promise<ApolloSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search contacts');
    }

    return response.json();
  }

  // NEW: Multi-page search for more results
  async searchContactsMultiple(
    params: ApolloSearchParams, 
    maxResults: number = 200
  ): Promise<ApolloSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search-multiple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        maxResults: maxResults
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search contacts');
    }

    return response.json();
  }

  async enrichContact(email: string): Promise<ApolloContact> {
    const response = await fetch(`${this.baseUrl}/enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to enrich contact');
    }

    return response.json();
  }
}