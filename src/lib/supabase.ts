import { createClient } from "@supabase/supabase-js";

/**
 * Public, cookie-less client using the publishable (anon) key. Safe inside
 * "use cache" scopes because it carries no per-user state. RLS limits it to
 * catalog reads and quote inserts.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
