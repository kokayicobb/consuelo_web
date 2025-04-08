// src/lib/db/klaviyo-accounts.ts
import { KlaviyoAccount } from '@/utils/klaviyoApi';
import { createClient } from '@supabase/supabase-js';
import { TokenResponse, parseTokenExpiration } from '../klaviyo/oath-utils';


// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database schema types
export type KlaviyoAccountRow = {
  id: string;
  store_id?: string;
  user_id: string;
  client_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  scopes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Create a new Klaviyo account connection
export const createKlaviyoAccount = async (
  userId: string,
  clientId: string,
  tokenResponse: TokenResponse,
  storeId?: string
): Promise<KlaviyoAccount | null> => {
  const now = new Date();
  const expiresAt = parseTokenExpiration(tokenResponse);

  const account: Omit<KlaviyoAccountRow, 'id' | 'created_at' | 'updated_at'> = {
    user_id: userId,
    store_id: storeId,
    client_id: clientId,
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token,
    token_expires_at: expiresAt.toISOString(),
    scopes: tokenResponse.scope,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('klaviyo_accounts')
    .insert(account)
    .select()
    .single();

  if (error) {
    console.error('Error creating Klaviyo account:', error);
    return null;
  }

  return mapRowToAccount(data);
};

// Update an existing Klaviyo account's tokens
export const updateKlaviyoAccountTokens = async (
  accountId: string,
  tokenResponse: TokenResponse
): Promise<KlaviyoAccount | null> => {
  const expiresAt = parseTokenExpiration(tokenResponse);
  
  const { data, error } = await supabase
    .from('klaviyo_accounts')
    .update({
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      scopes: tokenResponse.scope,
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId)
    .select()
    .single();

  if (error) {
    console.error('Error updating Klaviyo account tokens:', error);
    return null;
  }

  return mapRowToAccount(data);
};

// Deactivate a Klaviyo account (after uninstall)
export const deactivateKlaviyoAccount = async (accountId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('klaviyo_accounts')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId);

  if (error) {
    console.error('Error deactivating Klaviyo account:', error);
    return false;
  }

  return true;
};

// Get Klaviyo account by ID
export const getKlaviyoAccountById = async (accountId: string): Promise<KlaviyoAccount | null> => {
  const { data, error } = await supabase
    .from('klaviyo_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error || !data) {
    console.error('Error fetching Klaviyo account:', error);
    return null;
  }

  return mapRowToAccount(data);
};

// Get Klaviyo account by user ID
export const getKlaviyoAccountByUserId = async (
  userId: string,
  storeId?: string
): Promise<KlaviyoAccount | null> => {
  let query = supabase
    .from('klaviyo_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(1).single();

  if (error || !data) {
    // Not treating as an error if no account found
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching Klaviyo account:', error);
    }
    return null;
  }

  return mapRowToAccount(data);
};

// Utility to map database row to KlaviyoAccount object
const mapRowToAccount = (row: KlaviyoAccountRow): KlaviyoAccount => {
  return {
    type: '', // Add the 'type' property
    attributes: {
			company_name: '',
			contact_email: '',
			public_api_key: '',
			timezone: '',
			currency: '',
			created: '',
			updated: ''
		}, // Add the 'attributes' property
    links: {
			self: ''
		}, // Add the 'links' property
    id: row.id,
    storeId: row.store_id,
    userId: row.user_id,
    clientId: row.client_id,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    tokenExpiresAt: new Date(row.token_expires_at),
    scopes: row.scopes,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};

// SQL script to create the klaviyo_accounts table
// This is for reference, you would set this up in your Supabase dashboard or migrations
/*
CREATE TABLE klaviyo_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  store_id TEXT,
  client_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX klaviyo_accounts_user_id_idx ON klaviyo_accounts(user_id);
CREATE INDEX klaviyo_accounts_store_id_idx ON klaviyo_accounts(store_id);
*/