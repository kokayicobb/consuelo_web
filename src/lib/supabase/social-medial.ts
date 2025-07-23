// lib/supabase/social-media.ts

import { createClerkSupabaseClient } from './client';


// Type definitions based on the database schema
export interface SocialMediaClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  address: string | null;
  linkedin: string | null;
  twitter_handle: string | null;
  facebook_profile: string | null;
  reddit_username: string | null;
  instagram_handle: string | null;
  priority: string | null;
  status: string | null;
  segment: string | null;
  assigned_to: string | null;
  notes: string | null;
  tags: string[] | null;
  last_contact_date: string | null;
  first_contact_date: string | null;
  total_messages_count: number;
  engagement_score: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSocialMediaClientInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  address?: string;
  linkedin?: string;
  twitter_handle?: string;
  facebook_profile?: string;
  reddit_username?: string;
  instagram_handle?: string;
  priority?: string;
  status?: string;
  segment?: string;
  assigned_to?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateSocialMediaClientInput extends Partial<CreateSocialMediaClientInput> {}

// Client CRUD operations
export async function createSocialMediaClient(data: CreateSocialMediaClientInput, supabaseClient: any) {
  const { data: client, error } = await supabaseClient
    .from('social_media_clients')
    .insert({
      ...data,
      status: data.status || 'active',
      priority: data.priority || 'medium',
      engagement_score: 0,
      total_messages_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return client;
}

export async function updateSocialMediaClient(
  clientId: string, 
  updates: UpdateSocialMediaClientInput, 
  supabaseClient: any
) {
  const { data, error } = await supabaseClient
    .from('social_media_clients')
    .update(updates)
    .eq('id', clientId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSocialMediaClient(clientId: string, supabaseClient: any) {
  const { error } = await supabaseClient
    .from('social_media_clients')
    .delete()
    .eq('id', clientId);

  if (error) throw error;
}

export async function getSocialMediaClients(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('social_media_clients')
    .select('*')
    .order('last_contact_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSocialMediaClient(clientId: string, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('social_media_clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) throw error;
  return data;
}

// Message operations
export async function createMessage(messageData: any, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('social_media_messages')
    .insert(messageData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getClientMessages(clientId: string, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('social_media_messages')
    .select('*')
    .eq('client_id', clientId)
    .order('message_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Conversation operations
export async function getClientConversations(clientId: string, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('social_media_conversations')
    .select('*')
    .eq('client_id', clientId)
    .order('last_message_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateConversationStatus(
  conversationId: string, 
  status: string, 
  supabaseClient: any
) {
  const { data, error } = await supabaseClient
    .from('social_media_conversations')
    .update({ status })
    .eq('id', conversationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// AI Insights operations
export async function getClientInsights(clientId: string, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('social_media_ai_insights')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createInsight(insightData: any, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('social_media_ai_insights')
    .insert({
      ...insightData,
      confidence_score: insightData.confidence_score || 0.85,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Activity tracking
export async function createActivity(activityData: any, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('social_media_activities')
    .insert({
      ...activityData,
      activity_date: activityData.activity_date || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getClientActivities(clientId: string, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('social_media_activities')
    .select('*')
    .eq('client_id', clientId)
    .order('activity_date', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

// Export functionality
export function exportSocialMediaClientsToCSV(clients: SocialMediaClient[]) {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Company',
    'Title',
    'Reddit',
    'Twitter',
    'Facebook',
    'LinkedIn',
    'Instagram',
    'Priority',
    'Status',
    'Engagement Score',
    'Total Messages',
    'Last Contact',
    'Tags',
  ];

  const rows = clients.map(client => [
    client.name,
    client.email || '',
    client.phone || '',
    client.company || '',
    client.title || '',
    client.reddit_username || '',
    client.twitter_handle || '',
    client.facebook_profile || '',
    client.linkedin || '',
    client.instagram_handle || '',
    client.priority || '',
    client.status || '',
    client.engagement_score?.toString() || '0',
    client.total_messages_count?.toString() || '0',
    client.last_contact_date ? new Date(client.last_contact_date).toLocaleDateString() : '',
    client.tags?.join('; ') || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `social_media_clients_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Utility functions
export function calculateEngagementScore(
  messageCount: number,
  sentiment: { positive: number; negative: number; neutral: number },
  responseRate: number,
  lastContactDays: number
): number {
  // Base score from message count (0-30 points)
  const messageScore = Math.min(messageCount * 2, 30);
  
  // Sentiment score (0-30 points)
  const sentimentScore = ((sentiment.positive * 3) + (sentiment.neutral * 1) - (sentiment.negative * 2)) / 
    (sentiment.positive + sentiment.neutral + sentiment.negative) * 30;
  
  // Response rate score (0-20 points)
  const responseScore = responseRate * 20;
  
  // Recency score (0-20 points)
  const recencyScore = Math.max(20 - (lastContactDays * 0.5), 0);
  
  return Math.round(messageScore + sentimentScore + responseScore + recencyScore);
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    reddit: 'bg-orange-100 text-orange-700',
    facebook: 'bg-blue-100 text-blue-700',
    twitter: 'bg-sky-100 text-sky-700',
    instagram: 'bg-pink-100 text-pink-700',
    linkedin: 'bg-indigo-100 text-indigo-700',
  };
  
  return colors[platform.toLowerCase()] || 'bg-gray-100 text-gray-700';
}

export function formatSocialHandle(platform: string, handle: string): string {
  if (!handle) return '';
  
  switch (platform.toLowerCase()) {
    case 'reddit':
      return handle.startsWith('u/') ? handle : `u/${handle}`;
    case 'twitter':
      return handle.startsWith('@') ? handle : `@${handle}`;
    case 'instagram':
      return handle.startsWith('@') ? handle : `@${handle}`;
    default:
      return handle;
  }
}