import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoClient } from "./demoCatalog";

/**
 * Public, cookie-less client using the publishable (anon) key. Safe inside
 * "use cache" scopes because it carries no per-user state. RLS limits it to
 * catalog reads and quote inserts.
 */
// PREVIEW BRANCH ONLY: no database yet, so the shop reads 10 sample listings from ./demoCatalog.
export const supabase: SupabaseClient = process.env.PREVIEW_NO_DB === "1" ? (demoClient as unknown as SupabaseClient) : createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
