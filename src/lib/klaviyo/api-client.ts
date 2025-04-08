// src/lib/klaviyo/api-client.ts
import withKlaviyoAuth from './api-middleware';
import { KlaviyoAccount } from './oath-utils';

export class KlaviyoApiClient {
  private account: KlaviyoAccount;
  private baseUrl = 'https://a.klaviyo.com/api';
  private apiVersion = '2023-10-15'; // Update this as needed

  constructor(account: KlaviyoAccount) {
    this.account = account;
  }

  // Helper method to make API requests with authorization
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return withKlaviyoAuth(this.account, async (accessToken) => {
      const url = `${this.baseUrl}${endpoint}`;
      
      const defaultOptions: RequestInit = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'revision': this.apiVersion,
          ...options.headers,
        },
      };
      
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        let errorMessage = `Klaviyo API error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = `${errorMessage} - ${JSON.stringify(errorData)}`;
        } catch (e) {
          // Ignore JSON parsing errors for error responses
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data as T;
    });
  }

  // Example method to get metrics
  async getMetrics(params: { filter?: string; page?: number } = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.filter) {
      queryParams.append('filter', params.filter);
    }
    
    if (params.page) {
      queryParams.append('page[size]', '50'); // Default page size
      queryParams.append('page[number]', params.page.toString());
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/metrics/${queryString}`);
  }

  // Method to get a specific metric
  async getMetric(metricId: string) {
    return this.request(`/metrics/${metricId}/`);
  }

  // Method to query metric aggregates
  async queryMetricAggregates(payload: any) {
    return this.request(`/metric-aggregates/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  // Method to get events
  async getEvents(params: { filter?: string; include?: string; page_cursor?: string } = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.filter) {
      queryParams.append('filter', params.filter);
    }
    
    if (params.include) {
      queryParams.append('include', params.include);
    }
    
    if (params.page_cursor) {
      queryParams.append('page[cursor]', params.page_cursor);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/events/${queryString}`);
  }

  // Method to create events
  async createEvent(eventData: any) {
    return this.request('/events/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
  }

  // Method to get profiles
  async getProfiles(params: { filter?: string; include?: string; page_cursor?: string } = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.filter) {
      queryParams.append('filter', params.filter);
    }
    
    if (params.include) {
      queryParams.append('include', params.include);
    }
    
    if (params.page_cursor) {
      queryParams.append('page[cursor]', params.page_cursor);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/profiles/${queryString}`);
  }

  // Method to get a specific profile
  async getProfile(profileId: string, params: { include?: string } = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.include) {
      queryParams.append('include', params.include);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/profiles/${profileId}/${queryString}`);
  }

  // Method to create or update a profile
  async createOrUpdateProfile(profileData: any) {
    return this.request('/profiles/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
  }

  // Method to get lists
  async getLists(params: { filter?: string; page?: number } = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.filter) {
      queryParams.append('filter', params.filter);
    }
    
    if (params.page) {
      queryParams.append('page[size]', '50'); // Default page size
      queryParams.append('page[number]', params.page.toString());
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/lists/${queryString}`);
  }

  // Method to get a specific list
  async getList(listId: string) {
    return this.request(`/lists/${listId}/`);
  }

  // Method to get list members
  async getListMembers(listId: string, params: { page_cursor?: string } = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page_cursor) {
      queryParams.append('page[cursor]', params.page_cursor);
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request(`/lists/${listId}/profiles/${queryString}`);
  }

  // Method to add a profile to a list
  async addProfileToList(listId: string, profileId: string) {
    return this.request(`/profiles/${profileId}/relationships/lists/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [
          {
            type: 'list',
            id: listId,
          },
        ],
      }),
    });
  }

  // Method to remove a profile from a list
  async removeProfileFromList(listId: string, profileId: string) {
    return this.request(`/profiles/${profileId}/relationships/lists/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [
          {
            type: 'list',
            id: listId,
          },
        ],
      }),
    });
  }

  // Add more methods for other Klaviyo API endpoints as needed
}

// Factory function to create a Klaviyo API client
export function createKlaviyoClient(account: KlaviyoAccount): KlaviyoApiClient {
  return new KlaviyoApiClient(account);
}