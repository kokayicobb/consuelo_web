import { createClientComponentClient, Session as SupabaseSession } from "@supabase/auth-helpers-nextjs";

export const supabase = createClientComponentClient();
export type Session = SupabaseSession;
