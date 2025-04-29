// src/lib/integrations/integration-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/auth-context';

// Types for Integration data
export type IntegrationStatus = 'connected' | 'disconnected' | 'needs_attention' | 'syncing';

export type SyncData = {
  data_type: string;
  status: 'synced' | 'failed' | 'pending';
  last_synced: string | null;
  record_count: number;
  data_points: string[];
};

export type Integration = {
  id: string;
  integration_name: string;
  integration_category: string;
  description: string;
  status: IntegrationStatus;
  last_sync: string | null;
  error_message: string | null;
  sync_data: SyncData[];
};

type IntegrationsState = {
  integrations: Integration[];
  isLoading: boolean;
  error: Error | null;
};

export type IntegrationsContextType = IntegrationsState & {
  refreshIntegrations: () => Promise<void>;
  triggerSync: (integrationId: string) => Promise<void>;
  disconnectIntegration: (integrationId: string) => Promise<void>;
  getIntegrationById: (id: string) => Integration | undefined;
};

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export const IntegrationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<IntegrationsState>({
    integrations: [],
    isLoading: true,
    error: null,
  });
  
  const { user } = useAuth();
  const initialFetchDone = useRef(false);
  
  // Fetch all integrations for the user
  const fetchIntegrations = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, integrations: [], isLoading: false }));
      return;
    }
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch from the view we created that joins integration data with sync data
      const { data, error } = await supabaseClient
        .from('integration_status_view')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Integration type
      const formattedIntegrations: Integration[] = data ? data.map(item => ({
        id: item.id,
        integration_name: item.integration_name,
        integration_category: item.integration_category,
        description: item.description,
        status: item.status as IntegrationStatus,
        last_sync: item.last_sync,
        error_message: item.error_message,
        sync_data: Array.isArray(item.sync_data) ? item.sync_data : [],
      })) : [];
      
      setState({
        integrations: formattedIntegrations,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [user]);
  
  // Refresh integrations data
  const refreshIntegrations = useCallback(async () => {
    await fetchIntegrations();
  }, [fetchIntegrations]);
  
  // Trigger a sync for a specific integration
  const triggerSync = useCallback(async (integrationId: string) => {
    try {
      // Update the status to syncing in the database
      const { error } = await supabaseClient
        .from('klaviyo_integrations')
        .update({ 
          status: 'syncing',
          last_sync: new Date().toISOString(),
        })
        .eq('id', integrationId);
      
      if (error) throw error;
      
      // Update the local state
      setState(prev => ({
        ...prev,
        integrations: prev.integrations.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'syncing', last_sync: new Date().toISOString() } 
            : integration
        ),
      }));
      
      // Trigger the sync API
      const response = await fetch(`/api/klaviyo/sync?integrationId=${integrationId}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trigger sync');
      }
      
      // Refresh the integrations after the sync is complete
      await fetchIntegrations();
    } catch (error) {
      console.error('Error triggering sync:', error);
      
      // Update the status to needs_attention in case of error
      await supabaseClient
        .from('klaviyo_integrations')
        .update({ 
          status: 'needs_attention',
          error_message: (error as Error).message,
        })
        .eq('id', integrationId);
      
      // Refresh to get the updated state
      await fetchIntegrations();
    }
  }, [fetchIntegrations]);
  
  // Disconnect an integration
  const disconnectIntegration = useCallback(async (integrationId: string) => {
    try {
      // Call the disconnect API
      const response = await fetch(`/api/klaviyo/disconnect?integrationId=${integrationId}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect integration');
      }
      
      // Update the local state
      setState(prev => ({
        ...prev,
        integrations: prev.integrations.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'disconnected', last_sync: null } 
            : integration
        ),
      }));
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      
      // Refresh to get the correct state
      await fetchIntegrations();
    }
  }, [fetchIntegrations]);
  
  // Helper to get integration by ID
  const getIntegrationById = useCallback((id: string) => {
    return state.integrations.find(integration => integration.id === id);
  }, [state.integrations]);
  
  // Initial fetch of integrations
  useEffect(() => {
    // Only fetch on initial mount or when user changes
    if (user && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchIntegrations();
    } else if (!user) {
      setState({
        integrations: [],
        isLoading: false,
        error: null,
      });
      initialFetchDone.current = false;
    }
  }, [user, fetchIntegrations]);
  
  const value = {
    ...state,
    refreshIntegrations,
    triggerSync,
    disconnectIntegration,
    getIntegrationById,
  };
  
  return <IntegrationsContext.Provider value={value}>{children}</IntegrationsContext.Provider>;
};

export const useIntegrations = () => {
  const context = useContext(IntegrationsContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
};