import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export type ApiUsageRecord = {
  keyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  ipAddress?: string;
  userAgent?: string;
};

export type UsageStats = {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  requestsByEndpoint: Record<string, number>;
  requestsByDay: Record<string, number>;
};

/**
 * Log API usage to the database
 */
export async function logApiUsage(usage: ApiUsageRecord): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('api_usage')
      .insert({
        key_id: usage.keyId,
        endpoint: usage.endpoint,
        method: usage.method,
        status_code: usage.statusCode,
        response_time_ms: usage.responseTimeMs,
        ip_address: usage.ipAddress,
        user_agent: usage.userAgent
      });

    return !error;
  } catch (error) {
    console.error('Error logging API usage:', error);
    return false;
  }
}

/**
 * Get usage statistics for a specific API key
 */
export async function getKeyUsageStats(keyId: string, days = 30): Promise<UsageStats | null> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('api_usage')
    .select('*')
    .eq('key_id', keyId)
    .gte('timestamp', startDate.toISOString());
  
  if (error || !data || data.length === 0) {
    return null;
  }
  
  // Calculate stats
  const totalRequests = data.length;
  const successfulRequests = data.filter(r => r.status_code >= 200 && r.status_code < 300).length;
  const totalResponseTime = data.reduce((sum, r) => sum + r.response_time_ms, 0);
  
  // Requests by endpoint
  const requestsByEndpoint = data.reduce((acc, r) => {
    const endpoint = r.endpoint;
    acc[endpoint] = (acc[endpoint] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Requests by day
  const requestsByDay = data.reduce((acc, r) => {
    const day = new Date(r.timestamp).toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalRequests,
    averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
    successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
    requestsByEndpoint,
    requestsByDay
  };
}

/**
 * Get overall API usage statistics
 */
export async function getOverallUsageStats(days = 30): Promise<UsageStats | null> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('api_usage')
    .select('*')
    .gte('timestamp', startDate.toISOString());
  
  if (error || !data || data.length === 0) {
    return null;
  }
  
  // Calculate stats (same logic as above)
  const totalRequests = data.length;
  const successfulRequests = data.filter(r => r.status_code >= 200 && r.status_code < 300).length;
  const totalResponseTime = data.reduce((sum, r) => sum + r.response_time_ms, 0);
  
  const requestsByEndpoint = data.reduce((acc, r) => {
    const endpoint = r.endpoint;
    acc[endpoint] = (acc[endpoint] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const requestsByDay = data.reduce((acc, r) => {
    const day = new Date(r.timestamp).toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalRequests,
    averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
    successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
    requestsByEndpoint,
    requestsByDay
  };
}

/**
 * Get usage data for all keys
 */
export async function getAllKeysUsage(days = 30): Promise<Record<string, number>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('api_usage')
    .select('key_id, id')
    .gte('timestamp', startDate.toISOString());
  
  if (error || !data) {
    return {};
  }
  
  // Count requests by key
  return data.reduce((acc, r) => {
    acc[r.key_id] = (acc[r.key_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}