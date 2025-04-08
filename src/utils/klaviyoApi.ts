// utils/klaviyoApi.ts
import axios, { AxiosRequestConfig } from 'axios';

interface KlaviyoApiParams {
  [key: string]: string | number | boolean | string[];
}

export interface KlaviyoMetric {
  type: string;
  id: string;
  attributes: {
    name: string;
    created: string;
    updated: string;
    integration: {
      object: string;
      id: string;
      name: string;
      category: string;
    };
  };
  links: {
    self: string;
  };
}

export interface KlaviyoProfile {
  type: string;
  id: string;
  attributes: {
    email?: string;
    phone_number?: string;
    external_id?: string;
    first_name?: string;
    last_name?: string;
    organization?: string;
    title?: string;
    location?: {
      address1?: string;
      address2?: string;
      city?: string;
      country?: string;
      region?: string;
      zip?: string;
      timezone?: string;
    };
    properties?: Record<string, any>;
    created: string;
    updated: string;
  };
  links: {
    self: string;
  };
}

export interface KlaviyoAccount {
  type: string;
  id: string;
  storeId: string;
  userId: string;
  clientId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  scopes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  attributes: {
    company_name: string;
    contact_email: string;
    public_api_key: string;
    timezone: string;
    currency: string;
    created: string;
    updated: string;
  };
  links: {
    self: string;
  };
}

export interface KlaviyoApiResponse<T> {
  data: T[];
  links?: {
    self?: string;
    next?: string;
    prev?: string;
  };
}

export interface KlaviyoApiSingleResponse<T> {
  data: T;
}

export class KlaviyoAPI {
  private privateApiKey: string;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(privateApiKey: string) {
    this.privateApiKey = privateApiKey;
    this.baseUrl = 'https://a.klaviyo.com/api';
    this.headers = {
      'accept': 'application/vnd.api+json',
      'revision': '2025-01-15',
      'Authorization': `Klaviyo-API-Key ${this.privateApiKey}`
    };
  }

  async makeRequest<T>(
    method: string, 
    endpoint: string, 
    params: KlaviyoApiParams = {}, 
    data: any = null
  ): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        method,
        url: `${this.baseUrl}/${endpoint}`,
        headers: this.headers,
        params,
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await axios(config);
      return response.data as T;
    } catch (error) {
      console.error('Klaviyo API Error:', error);
      throw error;
    }
  }

  // 1. Accounts API methods
  async getAccounts(fields: string[] = []): Promise<KlaviyoApiResponse<KlaviyoAccount>> {
    const params: KlaviyoApiParams = {};
    if (fields.length > 0) {
      params['fields[account]'] = fields;
    }
    
    return this.makeRequest<KlaviyoApiResponse<KlaviyoAccount>>('GET', 'accounts', params);
  }

  async getAccount(accountId: string, fields: string[] = []): Promise<KlaviyoApiSingleResponse<KlaviyoAccount>> {
    const params: KlaviyoApiParams = {};
    if (fields.length > 0) {
      params['fields[account]'] = fields;
    }
    
    return this.makeRequest<KlaviyoApiSingleResponse<KlaviyoAccount>>('GET', `accounts/${accountId}`, params);
  }

  // 2. Metrics API methods
  async getMetrics(params: KlaviyoApiParams = {}): Promise<KlaviyoApiResponse<KlaviyoMetric>> {
    return this.makeRequest<KlaviyoApiResponse<KlaviyoMetric>>('GET', 'metrics', params);
  }

  async getMetric(metricId: string, params: KlaviyoApiParams = {}): Promise<KlaviyoApiSingleResponse<KlaviyoMetric>> {
    return this.makeRequest<KlaviyoApiSingleResponse<KlaviyoMetric>>('GET', `metrics/${metricId}`, params);
  }

  async queryMetricAggregates(params: KlaviyoApiParams = {}): Promise<any> {
    return this.makeRequest<any>('GET', 'metric-aggregates', params);
  }

  // 3. Profiles API methods
  async getProfiles(params: KlaviyoApiParams = {}): Promise<KlaviyoApiResponse<KlaviyoProfile>> {
    return this.makeRequest<KlaviyoApiResponse<KlaviyoProfile>>('GET', 'profiles', params);
  }

  async getProfile(profileId: string, params: KlaviyoApiParams = {}): Promise<KlaviyoApiSingleResponse<KlaviyoProfile>> {
    return this.makeRequest<KlaviyoApiSingleResponse<KlaviyoProfile>>('GET', `profiles/${profileId}`, params);
  }

  async searchProfiles(params: KlaviyoApiParams = {}): Promise<KlaviyoApiResponse<KlaviyoProfile>> {
    return this.makeRequest<KlaviyoApiResponse<KlaviyoProfile>>('GET', 'profiles/search', params);
  }
}

export default KlaviyoAPI;