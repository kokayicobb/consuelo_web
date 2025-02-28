// api/try-on/keys.ts
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Interface for API key data
interface ApiKeyData {
  id: string;
  key: string;
  name: string;
  created_at: string;
  usage_count: number;
  active: boolean;
}

/**
 * Validates an API key against the database
 * @param apiKey The API key to validate
 * @returns The key data if valid, null otherwise
 */
export async function validateApiKey(apiKey: string): Promise<ApiKeyData | null> {
  // Log the key being validated (helpful for debugging)
  console.log('Validating API key:', apiKey?.substring(0, 8) + '...');
  
  // DEVELOPMENT BYPASS
  if (apiKey === 'c816f700.0938efb8d12babafb768a79520c724012324d6ca8884ede35e8b5deb') {
    console.log('Using development bypass for hardcoded key');
    return {
      id: 'temp-debug-id',
      key: apiKey,
      name: 'Debug Key',
      created_at: new Date().toISOString(),
      usage_count: 0,
      active: true
    };
  }
  
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey)
      .eq('active', true)
      .single();
    
    if (error || !data) {
      console.error('Error validating API key:', error);
      return null;
    }
    
    return data as ApiKeyData;
  } catch (error) {
    console.error('Exception validating API key:', error);
    return null;
  }
}

/**
 * Increments the usage count for an API key
 * @param apiKey The API key to increment usage for
 */
export async function incrementUsage(apiKey: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ usage_count: supabase.rpc('increment_usage_count') })
      .eq('key', apiKey);
    
    if (error) {
      console.error('Error incrementing usage count:', error);
    }
  } catch (error) {
    console.error('Exception incrementing usage count:', error);
  }
}

/**
 * Create a new API key
 * @param name A friendly name for the API key
 * @returns The newly created API key data
 */
export async function createApiKey(name: string): Promise<ApiKeyData | null> {
  try {
    // Generate a random API key
    const keyBytes = crypto.getRandomValues(new Uint8Array(24));
    const key = Array.from(keyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const apiKey = `tryon-${key}`;
    
    // Insert the new key into the database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        key: apiKey,
        name,
        usage_count: 0,
        active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating API key:', error);
      return null;
    }
    
    return data as ApiKeyData;
  } catch (error) {
    console.error('Exception creating API key:', error);
    return null;
  }
}

/**
 * Deactivate an API key
 * @param apiKey The API key to deactivate
 * @returns True if successful, false otherwise
 */
export async function deactivateApiKey(apiKey: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .update({ active: false })
      .eq('key', apiKey);
    
    if (error) {
      console.error('Error deactivating API key:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception deactivating API key:', error);
    return false;
  }
}

/**
 * List all API keys
 * @param includeInactive Whether to include inactive keys
 * @returns Array of API key data
 */
export async function listApiKeys(includeInactive = false): Promise<ApiKeyData[]> {
  try {
    let query = supabase.from('api_keys').select('*');
    
    if (!includeInactive) {
      query = query.eq('active', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error listing API keys:', error);
      return [];
    }
    
    return data as ApiKeyData[];
  } catch (error) {
    console.error('Exception listing API keys:', error);
    return [];
  }
}