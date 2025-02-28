import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  active: boolean;
  createdAt: string;
  lastUsed?: string;
  userId?: string;
};

/**
 * Generate a new API key with prefix and secret
 */
function generateApiKey(): { prefix: string; secret: string; hash: string } {
  // Generate a random key
  const key = randomBytes(32).toString('hex');
  // Use first 8 characters as prefix for identification
  const prefix = key.slice(0, 8);
  // Rest of the key is the secret
  const secret = key.slice(8);
  // Hash the full key for storage
  const hash = createHash('sha256').update(key).digest('hex');
  
  return { prefix, secret, hash };
}

/**
 * Create a new API key in the database
 */
export async function createApiKey(name: string, userId?: string): Promise<{ name: string; key: string } | null> {
  const { prefix, secret, hash } = generateApiKey();
  const fullKey = `${prefix}.${secret}`;
  
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      name,
      key_prefix: prefix,
      key_hash: hash,
      user_id: userId || null,
    })
    .select('id')
    .single();
  
  if (error || !data) {
    console.error('Error creating API key:', error);
    return null;
  }
  
  // Return the full key - this is the only time it will be available in plaintext
  return { name, key: fullKey };
}

/**
 * List all API keys (optionally including inactive ones)
 */
export async function listApiKeys(includeInactive = false): Promise<ApiKey[]> {
  let query = supabase
    .from('api_keys')
    .select('id, name, key_prefix, active, created_at, last_used, user_id');
  
  if (!includeInactive) {
    query = query.eq('active', true);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error listing API keys:', error);
    return [];
  }
  
  return (data || []).map(key => ({
    id: key.id,
    name: key.name,
    prefix: key.key_prefix,
    active: key.active,
    createdAt: key.created_at,
    lastUsed: key.last_used,
    userId: key.user_id,
  }));
}

/**
 * Deactivate an API key
 */
export async function deactivateApiKey(keyId: string): Promise<boolean> {
  const { error } = await supabase
    .from('api_keys')
    .update({ active: false })
    .eq('id', keyId);
  
  return !error;
}
/**
 * Get the key ID from an API key string
 */
export async function getKeyIdFromKey(key: string): Promise<string | null> {
  if (!key || !key.includes('.')) return null;
  
  const parts = key.split('.');
  const prefix = parts[0];
  const secret = parts.slice(1).join('.');
  
  // Recreate the hash to compare
  const fullKey = `${prefix}${secret}`;
  const hash = createHash('sha256').update(fullKey).digest('hex');
  
  // Look up the key in the database
  const { data, error } = await supabase
    .from('api_keys')
    .select('id')
    .eq('key_prefix', prefix)
    .eq('key_hash', hash)
    .single();
  
  if (error || !data) return null;
  
  return data.id;
}
/**
 * Verify an API key is valid
 */
export async function verifyApiKey(key: string): Promise<boolean> {
  if (!key || !key.includes('.')) return false;
  
  const parts = key.split('.');
  const prefix = parts[0];
  const secret = parts.slice(1).join('.');
  
  // Recreate the hash to compare
  const fullKey = `${prefix}${secret}`;
  const hash = createHash('sha256').update(fullKey).digest('hex');
  
  // Look up the key in the database
  const { data, error } = await supabase
    .from('api_keys')
    .select('id')
    .eq('key_prefix', prefix)
    .eq('key_hash', hash)
    .eq('active', true)
    .single();
  
  if (error || !data) return false;
  
  // Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ last_used: new Date().toISOString() })
    .eq('id', data.id);
  
  return true;
}
