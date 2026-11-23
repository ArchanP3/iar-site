import "server-only";
import { Pool, type QueryResultRow } from "pg";
import { cmsEnabled, poolConfig } from "./pg";

/* ------------------------------------------------------------------ */
/*  CMS database: the private `cms` schema in Supabase, reached as the  */
/*  cms_app login (supabase/migrations/20261028120000_cms_schema.sql).  */
/*  DATABASE_URL turns the CMS on. Without it the website runs exactly  */
/*  as before, using the defaults written in the code. Tables are made  */
/*  by migrations, never by the app.                                    */
/* ------------------------------------------------------------------ */

export { cmsEnabled };

/** Plain-English reason the CMS can't use the database, or null when all is fine. */
export async function dbProblem(): Promise<string | null> {
  const raw = (process.env.DATABASE_URL ?? "").trim();
  if (!raw) return "The CMS database is not connected yet. Add DATABASE_URL on the server to turn the CMS on.";
  if (!cmsEnabled()) return "The CMS is off on preview deploys, or DATABASE_URL isn't a database address (it should start with postgres://).";
  try {
    await pool().query("SELECT 1 FROM cms.cms_settings LIMIT 1");
    return null;
  } catch (e) {
    const m = (e as Error).message || "";
    if (/password authentication|authentication failed/i.test(m)) return "The database rejected the username or password in DATABASE_URL.";
    if (/certificate|self.signed|SSL/i.test(m)) return "The database certificate could not be verified. Add Supabase's CA certificate as DATABASE_CA_CERT.";
    if (/does not exist|permission denied/i.test(m)) return "The CMS tables are missing or the login can't reach them. Run the Supabase migrations and use the cms_app login.";
    if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|timeout/i.test(m)) return "Can't reach the database in DATABASE_URL. Check the address and your internet connection.";
    return "Can't open the CMS database: " + m.slice(0, 160);
  }
}

const g = globalThis as unknown as { __cmsPool?: Pool; __cmsUrl?: string };

function pool(): Pool {
  const url = (process.env.DATABASE_URL ?? "").trim();
  if (!cmsEnabled()) throw new Error("CMS database is off.");
  if (g.__cmsPool && g.__cmsUrl !== url) {
    g.__cmsPool.end().catch(() => {});
    g.__cmsPool = undefined;
  }
  if (!g.__cmsPool) {
    g.__cmsUrl = url;
    g.__cmsPool = new Pool(poolConfig(Number(process.env.CMS_POOL_MAX ?? 5), 8_000));
  }
  return g.__cmsPool;
}

export async function q<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query<T>(sql, params);
  return res.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(sql: string, params: unknown[] = []): Promise<T | null> {
  return (await q<T>(sql, params))[0] ?? null;
}

/** Wraps a cached loader so a database error is never cached: the website keeps
    serving the last good value (or the code default) and tries again next time. */
export function lastGood<A extends unknown[], R>(load: (...args: A) => Promise<R>, fallback: R): (...args: A) => Promise<R> {
  const seen = new Map<string, R>();
  return async (...args: A) => {
    const key = JSON.stringify(args);
    try {
      const v = await load(...args);
      seen.set(key, v);
      return v;
    } catch {
      return seen.has(key) ? seen.get(key)! : fallback;
    }
  };
}
