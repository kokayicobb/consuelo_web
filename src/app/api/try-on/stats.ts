// api/try-on/stats.ts
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Interface for usage log entry
interface UsageLog {
  id?: string;
  api_key: string;
  endpoint: string;
  timestamp: string;
  success: boolean;
  request_details?: any;
}

/**
 * Log an API usage event
 * @param apiKey The API key used
 * @param endpoint The endpoint accessed
 * @param success Whether the request was successful
 * @param details Optional details about the request
 */
export async function logApiUsage(
  apiKey: string, 
  endpoint: string, 
  success: boolean,
  details?: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from('usage_logs')
      .insert({
        api_key: apiKey,
        endpoint,
        timestamp: new Date().toISOString(),
        success,
        request_details: details
      });
    
    if (error) {
      console.error('Error logging API usage:', error);
    }
  } catch (error) {
    console.error('Exception logging API usage:', error);
  }
}

/**
 * Get usage statistics for an API key
 * @param apiKey The API key to get statistics for
 * @param startDate Optional start date for the period
 * @param endDate Optional end date for the period
 * @returns Usage statistics
 */
export async function getApiKeyStats(
  apiKey: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    let query = supabase
      .from('usage_logs')
      .select('*')
      .eq('api_key', apiKey);
    
    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString());
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting API key stats:', error);
      return null;
    }
    
    // Calculate statistics
    const totalRequests = data.length;
    const successfulRequests = data.filter(log => log.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    
    // Group by endpoint
    const endpointStats = data.reduce((acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by day
    const dailyStats = data.reduce((acc, log) => {
      const day = log.timestamp.split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      endpointStats,
      dailyStats
    };
  } catch (error) {
    console.error('Exception getting API key stats:', error);
    return null;
  }
}

/**
 * Get overall usage statistics
 * @param startDate Optional start date for the period
 * @param endDate Optional end date for the period
 * @returns Overall usage statistics
 */
export async function getOverallStats(
  startDate?: Date,
  endDate?: Date
) {
  try {
    let query = supabase
      .from('usage_logs')
      .select('*');
    
    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString());
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting overall stats:', error);
      return null;
    }
    
    // Get unique API keys
    const uniqueApiKeys = new Set(data.map(log => log.api_key)).size;
    
    // Calculate statistics
    const totalRequests = data.length;
    const successfulRequests = data.filter(log => log.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    
    // Group by endpoint
    const endpointStats = data.reduce((acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by day
    const dailyStats = data.reduce((acc, log) => {
      const day = log.timestamp.split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by API key
    const apiKeyStats = data.reduce((acc, log) => {
      acc[log.api_key] = (acc[log.api_key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      uniqueApiKeys,
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      endpointStats,
      dailyStats,
      apiKeyStats
    };
  } catch (error) {
    console.error('Exception getting overall stats:', error);
    return null;
  }
}