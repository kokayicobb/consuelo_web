import { supabase } from "./supabaseHelper";

import type { Session } from "./supabaseHelper";

export const getUserSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.log("Error fetching session:", error.message);
    return null;
  }

  if (data.session) {
    return data.session;
  } 

  return null;
}