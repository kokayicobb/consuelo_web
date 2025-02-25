// lib/getAccessTokenFromDB.js
import { supabase } from './src/lib/supabaseClient';

export async function getAccessTokenFromDB(shop) {
  const { data, error } = await supabase
    .from('shop_tokens')
    .select('access_token')
    .eq('shop', shop)
    .single();

  if (error) {
    console.error('Error fetching token from Supabase:', error);
    return null;
  }
  return data?.access_token;
}
