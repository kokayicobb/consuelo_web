// src/lib/klaviyo/api-service.ts
import { supabaseClient } from '@/lib/supabase/client';

// Types for Klaviyo API responses
export type KlaviyoMetric = {
  id: string;
  attributes: {
    name: string;
    created: string;
    updated: string;
    integration: {
      id: string;
      name: string;
      category: string;
    };
  };
};

export type KlaviyoList = {
  id: string;
  attributes: {
    name: string;
    created: string;
    updated: string;
    opt_in_process: string;
    list_type: string;
  };
};

export type KlaviyoProfile = {
  id: string;
  attributes: {
    email: string;
    phone_number: string;
    external_id: string;
    first_name: string;
    last_name: string;
    organization: string;
    title: string;
    image: string;
    created: string;
    updated: string;
    last_event_date: string;
    location: {
      address1: string;
      address2: string;
      city: string;
      country: string;
      region: string;
      zip: string;
      timezone: string;
    };
    properties: Record<string, any>;
  };
};

export type KlaviyoCampaign = {
  id: string;
  attributes: {
    name: string;
    status: string;
    archived: boolean;
    created: string;
    updated: string;
    send_time: string;
    sent_at: string;
    campaign_type: string;
    message_type: string;
  };
};

// Main API class for Klaviyo interactions
export class KlaviyoAPI {
  private accessToken: string;
  private integrationId: string;
  private readonly BASE_URL = 'https://a.klaviyo.com/api';
  private readonly API_REVISION = '2023-10-15';
  
  constructor(accessToken: string, integrationId: string) {
    this.accessToken = accessToken;
    this.integrationId = integrationId;
  }
  
  private async request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const url = `${this.BASE_URL}/${endpoint}`;
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      'revision': this.API_REVISION,
    };
    
    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If we can't parse the error JSON, just use the default message
      }
      
      const error = new Error(errorMessage);
      throw error;
    }
    
    return await response.json();
  }
  
  // Fetch all metrics
  async getMetrics(): Promise<{ data: KlaviyoMetric[] }> {
    return this.request<{ data: KlaviyoMetric[] }>('metrics/');
  }
  
  // Fetch all lists
  async getLists(): Promise<{ data: KlaviyoList[] }> {
    return this.request<{ data: KlaviyoList[] }>('lists/');
  }
  
  // Fetch profiles (paginated)
  async getProfiles(page?: number, pageSize: number = 50): Promise<{ data: KlaviyoProfile[] }> {
    const endpoint = page 
      ? `profiles/?page[size]=${pageSize}&page[number]=${page}` 
      : `profiles/?page[size]=${pageSize}`;
    return this.request<{ data: KlaviyoProfile[] }>(endpoint);
  }
  
  // Fetch campaigns
  async getCampaigns(): Promise<{ data: KlaviyoCampaign[] }> {
    return this.request<{ data: KlaviyoCampaign[] }>('campaigns/');
  }
  
  // Sync all data types and update the database
  async syncAllData(): Promise<void> {
    try {
      // Start sync - updates status to 'syncing'
      await this.updateIntegrationStatus('syncing');
      
      // Sync each data type in parallel
      await Promise.all([
        this.syncMetrics(),
        this.syncLists(),
        this.syncProfiles(),
        this.syncCampaigns(),
      ]);
      
      // Update the integration status to 'connected' when done
      await this.updateIntegrationStatus('connected', null);
    } catch (error) {
      console.error('Error syncing all data:', error);
      // Update the integration status to 'needs_attention' on error
      await this.updateIntegrationStatus('needs_attention', (error as Error).message);
      throw error;
    }
  }
  
  // Sync metrics data
  private async syncMetrics(): Promise<void> {
    try {
      const response = await this.getMetrics();
      const metrics = response.data;
      
      // Get metric names as data points
      const dataPoints = metrics.map(metric => metric.attributes.name);
      
      // Update the sync data in the database
      await supabaseClient.from('klaviyo_sync_data').upsert({
        integration_id: this.integrationId,
        data_type: 'metrics',
        status: 'synced',
        last_synced: new Date().toISOString(),
        record_count: metrics.length,
        data_points: dataPoints,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'integration_id,data_type',
      });
    } catch (error) {
      console.error('Error syncing metrics:', error);
      
      // Update the sync data with failure status
      await supabaseClient.from('klaviyo_sync_data').upsert({
        integration_id: this.integrationId,
        data_type: 'metrics',
        status: 'failed',
        last_synced: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'integration_id,data_type',
      });
      
      throw error;
    }
  }
  
  // Sync lists data
  private async syncLists(): Promise<void> {
    try {
      const response = await this.getLists();
      const lists = response.data;
      
      // Get list names as data points
      const dataPoints = lists.map(list => list.attributes.name);
      
      // Update the sync data in the database
      await supabaseClient.from('klaviyo_sync_data').upsert({
        integration_id: this.integrationId,
        data_type: 'lists',
        status: 'synced',
        last_synced: new Date().toISOString(),
        record_count: lists.length,
        data_points: dataPoints,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'integration_id,data_type',
      });
    } catch (error) {
      console.error('Error syncing lists:', error);
      
      // Update the sync data with failure status
      await supabaseClient.from('klaviyo_sync_data').upsert({
        integration_id: this.integrationId,
        data_type: 'lists',
        status: 'failed',
        last_synced: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'integration_id,data_type',
      });
      
      throw error;
    }
  }
  
  // Sync profiles data (just the first page for demo purposes)
  private async syncProfiles(): Promise<void> {
    try {
      const response = await this.getProfiles(1, 100);
      const profiles = response.data;
      
      // Use emails as data points (limit for privacy)
      const dataPoints = profiles.slice(0, 5).map(
        profile => profile.attributes.email || 'anonymous'
      );
      
      // Update the sync data in the database
      await supabaseClient.from('klaviyo_sync_data').upsert({
        integration_id: this.integrationId,
        data_type: 'profiles',
        status: 'synced',
        last_synced: new Date().toISOString(),
        record_count: profiles.length,
        data_points: dataPoints,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'integration_id,data_type',
      });
    } catch (error) {
      console.error('Error syncing profiles:', error);
      
      // Update the sync data with failure status
      await supabaseClient.from('klaviyo_sync_data').upsert({
        integration_id: this.integrationId,
        data_type: 'profiles',
        status: 'failed',
        last_synced: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'integration_id,data_type',
      });
      
      throw error;
    }
  }
  
  // Sync campaigns data
  private async syncCampaigns(): Promise<void> {
    try {
      const response = await this.getCampaigns();
      const campaigns = response.data;
      
      // Get campaign names as data points
      const dataPoints = campaigns.map(campaign => campaign.attributes.name);
      
      // Update the sync data in the database
      await supabaseClient.from('klaviyo_sync_data').upsert({
        integration_id: this.integrationId,
        data_type: 'campaigns',
        status: 'synced',
        last_synced: new Date().toISOString(),
        record_count: campaigns.length,
        data_points: dataPoints,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'integration_id,data_type',
      });
    } catch (error) {
      console.error('Error syncing campaigns:', error);
      
      // Update the sync data with failure status
      await supabaseClient.from('klaviyo_sync_data').upsert({
        integration_id: this.integrationId,
        data_type: 'campaigns',
        status: 'failed',
        last_synced: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'integration_id,data_type',
      });
      
      throw error;
    }
  }
  
  // Update the integration status
  private async updateIntegrationStatus(
    status: 'connected' | 'disconnected' | 'needs_attention' | 'syncing', 
    errorMessage: string | null = null
  ): Promise<void> {
    const updateData: any = {
      status,
      last_sync: new Date().toISOString(),
    };
    
    if (errorMessage !== undefined) {
      updateData.error_message = errorMessage;
    }
    
    const { error } = await supabaseClient
      .from('klaviyo_integrations')
      .update(updateData)
      .eq('id', this.integrationId);
    
    if (error) {
      console.error('Error updating integration status:', error);
      throw error;
    }
  }
}