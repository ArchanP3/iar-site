import { Pool } from "pg";
import { cmsEnabled, poolConfig } from "./pg";
import { onThisSite, type Country } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Routing table for the proxy: redirects, changed page URLs (aliases) */
/*  and CMS landing pages. Kept in memory and refreshed every 30 s in   */
/*  the background, so normal page requests never wait on the database. */
/*  A failed load keeps the last good table (never an empty one).        */
/* ------------------------------------------------------------------ */

export type Redirect = { id: number; from: string; to: string; code: number; prefix: boolean; expires: number | null };
export type Routes = {
  exact: Map<string, Redirect>;
  prefix: Redirect[];
  alias: Map<string, string>; // public path -> real route
  landing: Set<string>;
  /** Landing pages set to show on the other country site only: path -> that country. */
  elsewhere: Map<string, Country>;
};

const EMPTY: Routes = { exact: new Map(), prefix: [], alias: new Map(), landing: new Set(), elsewhere: new Map() };
const TTL = 30_000;
const g = globalThis as unknown as { __cmsRoutes?: { at: number; routes: Routes; loading?: Promise<void> }; __cmsRoutePool?: Pool };

function db(): Pool {
  if (!g.__cmsRoutePool) g.__cmsRoutePool = new Pool(poolConfig(2, 2_000));
  return g.__cmsRoutePool;
}

async function load(): Promise<Routes> {
  const c = db();
  const [r, a, l] = await Promise.all([
    c.query(`SELECT id, from_path, to_path, code, match, extract(epoch from expires_at) * 1000 AS exp FROM cms.cms_redirects WHERE active`),
    c.query(`SELECT path, public_path FROM cms.cms_page_seo WHERE public_path IS NOT NULL AND public_path <> ''`),
    c.query(`SELECT path, site FROM cms.cms_landing WHERE kind = 'page' AND status = 'published'`),
  ]);
  const out: Routes = { exact: new Map(), prefix: [], alias: new Map(), landing: new Set(), elsewhere: new Map() };
  for (const x of r.rows as { id: number; from_path: string; to_path: string; code: number; match: string; exp: string | null }[]) {
    const red: Redirect = { id: x.id, from: x.from_path, to: x.to_path, code: x.code, prefix: x.match === "prefix", expires: x.exp ? Number(x.exp) : null };
    if (red.prefix) out.prefix.push(red);
    else out.exact.set(red.from, red);
  }
  out.prefix.sort((p, q) => q.from.length - p.from.length);
  for (const x of a.rows as { path: string; public_path: string }[]) out.alias.set(x.public_path, x.path);
  for (const x of l.rows as { path: string; site: string }[]) {
    if (onThisSite(x.site as Country | "both")) out.landing.add(x.path);
    else out.elsewhere.set(x.path, x.site as Country);
  }
  return out;
}

export async function routes(): Promise<Routes> {
  if (!cmsEnabled()) return EMPTY;
  const now = Date.now();
  const cur = g.__cmsRoutes;
  if (cur && now - cur.at < TTL) return cur.routes;
  const refresh = () => {
    if (!g.__cmsRoutes?.loading) {
      const p = load()
        .then((routes) => { g.__cmsRoutes = { at: Date.now(), routes }; })
        // Keep the last good table and try again in 5 s.
        .catch(() => { if (g.__cmsRoutes) g.__cmsRoutes.at = Date.now() - TTL + 5_000; });
      g.__cmsRoutes = { at: cur?.at ?? 0, routes: cur?.routes ?? EMPTY, loading: p };
      p.finally(() => { if (g.__cmsRoutes) g.__cmsRoutes.loading = undefined; });
    }
    return g.__cmsRoutes!.loading!;
  };
  if (cur) {
    refresh(); // serve the old table while the new one loads
    return cur.routes;
  }
  await Promise.race([refresh(), new Promise((r) => setTimeout(r, 1500))]);
  return g.__cmsRoutes?.routes ?? EMPTY;
}

/** Forget the cached table (after a change in the CMS, same server process). */
export function resetRoutes() {
  if (g.__cmsRoutes) g.__cmsRoutes.at = 0;
}

export function countHit(id: number) {
  if (!cmsEnabled()) return Promise.resolve();
  return db().query(`UPDATE cms.cms_redirects SET hits = hits + 1, last_hit = now() WHERE id = $1`, [id]).then(() => undefined).catch(() => undefined);
}

export const landingRoute = (path: string) => `/lp/${encodeURIComponent(path.slice(1))}`;
