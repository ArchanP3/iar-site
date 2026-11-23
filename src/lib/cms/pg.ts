import type { PoolConfig } from "pg";
import { isPreview } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Connection settings shared by the CMS pool (db.ts) and the proxy's  */
/*  routing table (routing.ts).                                         */
/*    DATABASE_URL     the cms_app login through the Supabase pooler    */
/*    DATABASE_CA_CERT Supabase's CA certificate (PEM), so the server   */
/*                     certificate is verified                         */
/*  Preview deploys never connect: the CMS is off there.               */
/* ------------------------------------------------------------------ */

const url = () => (process.env.DATABASE_URL ?? "").trim();

/** The CMS is on only in production/local, when DATABASE_URL looks like a real PostgreSQL address. */
export const cmsEnabled = () => !isPreview && /^postgres(ql)?:\/\/[^\s]+@[^\s/]+/.test(url());

const local = (u: string) => /@(localhost|127\.0\.0\.1)[:/]/.test(u);

export function poolConfig(max: number, connectionTimeoutMillis: number): PoolConfig {
  const u = url();
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n").trim();
  return {
    // TLS is set below; an sslmode in the URL would override it, so drop it.
    connectionString: u.replace(/([?&])sslmode=[^&]*&?/i, "$1").replace(/[?&]$/, ""),
    max,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis,
    // Always verify the server certificate (except a database on this machine).
    ssl: local(u) ? undefined : { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
  };
}
