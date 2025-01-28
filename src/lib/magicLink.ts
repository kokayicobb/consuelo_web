import { supabase } from "./supabaseHelper";

export const sendMagicLink = async (email: string): Promise<boolean> => {
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    console.log("Error sending magic link:", error?.message);
    return false;
  }

  return true;
}