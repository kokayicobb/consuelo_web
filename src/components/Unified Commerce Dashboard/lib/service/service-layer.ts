// src/components/Unified Commerce Dashboard/lib/service/service-layer.ts
import { supabase } from '@/lib/supabase/client';

export interface KPIData {
  name: string;
  value: number;
  period: string;
  department?: string;
  change?: number; // percentage change from previous period
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  [key: string]: any;
}

export interface KPIResponse {
  success: boolean;
  data: ChartData[];
  summary?: {
    total?: number;
    average?: number;
    trend?: 'up' | 'down' | 'stable';
    change?: number;
  };
  error?: string;
}

export class KPIService {
  
  // Get revenue data for charts
  static async getRevenueData(period: 'daily' | 'weekly' | 'monthly' = 'monthly', limit = 12): Promise<KPIResponse> {
    try {
      if (period === 'daily') {
        // Get daily sales data for last 30 days
        const { data, error } = await supabase
          .from('sales_data')
          .select('date, revenue')
          .order('date', { ascending: true })
          .limit(limit);

        if (error) throw error;

        const chartData = data?.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: parseFloat(item.revenue),
          date: item.date
        })) || [];

        return {
          success: true,
          data: chartData,
          summary: this.calculateSummary(chartData)
        };
      } else {
        // Get monthly KPI data
        const { data, error } = await supabase
          .from('business_kpis')
          .select('*')
          .eq('metric_name', 'Monthly Revenue')
          .order('period_start', { ascending: true })
          .limit(limit);

        if (error) throw error;

        const chartData = data?.map(item => ({
          name: new Date(item.period_start).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          value: parseFloat(item.value),
          date: item.period_start
        })) || [];

        return {
          success: true,
          data: chartData,
          summary: this.calculateSummary(chartData)
        };
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch revenue data'
      };
    }
  }

  // Get leads data
  static async getLeadsData(period: 'daily' | 'weekly' | 'monthly' = 'monthly', limit = 12): Promise<KPIResponse> {
    try {
      if (period === 'daily') {
        const { data, error } = await supabase
          .from('sales_data')
          .select('date, leads_generated, leads_converted')
          .order('date', { ascending: true })
          .limit(limit);

        if (error) throw error;

        const chartData = data?.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          generated: item.leads_generated,
          converted: item.leads_converted,
          value: item.leads_generated,
          date: item.date
        })) || [];

        return {
          success: true,
          data: chartData,
          summary: this.calculateSummary(chartData)
        };
      } else {
        const { data, error } = await supabase
          .from('business_kpis')
          .select('*')
          .eq('metric_name', 'Monthly Leads')
          .order('period_start', { ascending: true })
          .limit(limit);

        if (error) throw error;

        const chartData = data?.map(item => ({
          name: new Date(item.period_start).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          value: parseFloat(item.value),
          date: item.period_start
        })) || [];

        return {
          success: true,
          data: chartData,
          summary: this.calculateSummary(chartData)
        };
      }
    } catch (error) {
      console.error('Error fetching leads data:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch leads data'
      };
    }
  }

  // Get conversion rate data
  static async getConversionData(period: 'daily' | 'weekly' | 'monthly' = 'monthly', limit = 12): Promise<KPIResponse> {
    try {
      if (period === 'daily') {
        const { data, error } = await supabase
          .from('sales_data')
          .select('date, leads_generated, leads_converted')
          .order('date', { ascending: true })
          .limit(limit);

        if (error) throw error;

        const chartData = data?.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: item.leads_generated > 0 ? (item.leads_converted / item.leads_generated) * 100 : 0,
          date: item.date
        })) || [];

        return {
          success: true,
          data: chartData,
          summary: this.calculateSummary(chartData)
        };
      } else {
        const { data, error } = await supabase
          .from('business_kpis')
          .select('*')
          .eq('metric_name', 'Lead Conversion Rate')
          .order('period_start', { ascending: true })
          .limit(limit);

        if (error) throw error;

        const chartData = data?.map(item => ({
          name: new Date(item.period_start).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          value: parseFloat(item.value),
          date: item.period_start
        })) || [];

        return {
          success: true,
          data: chartData,
          summary: this.calculateSummary(chartData)
        };
      }
    } catch (error) {
      console.error('Error fetching conversion data:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch conversion data'
      };
    }
  }

  // Get customer metrics
  static async getCustomerData(metric: 'new_customers' | 'total_active_customers' | 'customer_satisfaction_score' = 'new_customers', limit = 30): Promise<KPIResponse> {
    try {
      const { data, error } = await supabase
        .from('customer_metrics')
        .select(`date, ${metric}`)
        .order('date', { ascending: true })
        .limit(limit);

      if (error) throw error;

      const chartData = data?.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseFloat(item[metric]),
        date: item.date
      })) || [];

      return {
        success: true,
        data: chartData,
        summary: this.calculateSummary(chartData)
      };
    } catch (error) {
      console.error('Error fetching customer data:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch customer data'
      };
    }
  }

  // Get sales performance by rep
  static async getSalesRepPerformance(): Promise<KPIResponse> {
    try {
      const { data, error } = await supabase
        .from('sales_data')
        .select('sales_rep, revenue, deals_closed')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Last 30 days

      if (error) throw error;

      // Group by sales rep
      const repPerformance = data?.reduce((acc: any, item) => {
        const rep = item.sales_rep;
        if (!acc[rep]) {
          acc[rep] = { name: rep, revenue: 0, deals: 0 };
        }
        acc[rep].revenue += parseFloat(item.revenue);
        acc[rep].deals += item.deals_closed;
        return acc;
      }, {}) || {};

      const chartData = Object.values(repPerformance).map((rep: any) => ({
        name: rep.name,
        value: rep.revenue,
        deals: rep.deals
      }));

      return {
        success: true,
        data: chartData,
        summary: this.calculateSummary(chartData)
      };
    } catch (error) {
      console.error('Error fetching sales rep performance:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch sales rep performance'
      };
    }
  }

  // Calculate summary statistics
  private static calculateSummary(data: ChartData[]) {
    if (!data || data.length === 0) return undefined;

    const values = data.map(d => d.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    
    // Calculate trend (compare last value to first value)
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > 5) {
      trend = change > 0 ? 'up' : 'down';
    }

    return {
      total,
      average,
      trend,
      change: Math.round(change * 100) / 100
    };
  }

  // Main method to get KPI data based on AI request
  static async getKPIData(type: string, period: string = 'monthly', limit: number = 12): Promise<KPIResponse> {
    const normalizedType = type.toLowerCase();
    const normalizedPeriod = period.toLowerCase() as 'daily' | 'weekly' | 'monthly';

    switch (normalizedType) {
      case 'revenue':
      case 'sales':
      case 'income':
        return this.getRevenueData(normalizedPeriod, limit);
      
      case 'leads':
      case 'lead generation':
      case 'prospects':
        return this.getLeadsData(normalizedPeriod, limit);
      
      case 'conversion':
      case 'conversion rate':
      case 'close rate':
        return this.getConversionData(normalizedPeriod, limit);
      
      case 'customers':
      case 'new customers':
        return this.getCustomerData('new_customers', limit);
      
      case 'satisfaction':
      case 'customer satisfaction':
        return this.getCustomerData('customer_satisfaction_score', limit);
      
      case 'sales rep':
      case 'sales team':
      case 'rep performance':
        return this.getSalesRepPerformance();
      
      default:
        // Default to revenue if unknown type
        return this.getRevenueData(normalizedPeriod, limit);
    }
  }
}