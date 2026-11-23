import "server-only";
import { createSign } from "node:crypto";
import { cacheLife, cacheTag } from "next/cache";
import { readSetting } from "./settings";

/* ------------------------------------------------------------------ */
/*  Google Search Console + Google Analytics 4 + PageSpeed, read with   */
/*  a free Google Cloud service account (no paid service).              */
/*  Server setting: GOOGLE_SERVICE_ACCOUNT_JSON = the key file's text.  */
/*  Then add the service account's email as a user in Search Console    */
/*  and in GA4 (Viewer is enough). Site and property are set in the CMS.*/
/* ------------------------------------------------------------------ */

type Key = { client_email: string; private_key: string };

function key(): Key | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const k = JSON.parse(raw) as Key;
    return k.client_email && k.private_key ? { ...k, private_key: k.private_key.replace(/\\n/g, "\n") } : null;
  } catch {
    return null;
  }
}

export const serviceAccountEmail = () => key()?.client_email ?? null;

const g = globalThis as unknown as { __gTok?: { token: string; exp: number } };

async function token(): Promise<string | null> {
  const k = key();
  if (!k) return null;
  if (g.__gTok && g.__gTok.exp > Date.now() + 60_000) return g.__gTok.token;
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: k.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(k.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google sign-in failed (${res.status}). Check the service account key.`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  g.__gTok = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return j.access_token;
}

const day = (d: Date) => d.toISOString().slice(0, 10);
export function range(days: number, offset = 0) {
  const end = new Date(Date.now() - (2 + offset) * 86400_000); // GSC data lags ~2 days
  const start = new Date(end.getTime() - (days - 1) * 86400_000);
  return { startDate: day(start), endDate: day(end) };
}

export type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

async function gsc(site: string, body: object): Promise<GscRow[]> {
  const t = await token();
  if (!t) return [];
  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${t}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(res.status === 403 ? "Search Console says no access. Add the service account email as a user on this property." : `Search Console error ${res.status}`);
  return ((await res.json()) as { rows?: GscRow[] }).rows ?? [];
}

export type SearchData = {
  configured: boolean; error?: string;
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  prev: { clicks: number; impressions: number; ctr: number; position: number };
  daily: { date: string; clicks: number; impressions: number }[];
  queries: GscRow[]; pages: GscRow[]; opportunities: GscRow[];
};

const sum = (rows: GscRow[]) => {
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const position = impressions ? rows.reduce((s, r) => s + r.position * r.impressions, 0) / impressions : 0;
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position };
};

export async function searchData(days: number): Promise<SearchData> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms:google");
  const empty: SearchData = { configured: false, totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 }, prev: { clicks: 0, impressions: 0, ctr: 0, position: 0 }, daily: [], queries: [], pages: [], opportunities: [] };
  const cfg = await readSetting("google").catch(() => ({ gscSite: "", ga4Property: "" }));
  if (!key() || !cfg.gscSite) return empty;
  try {
    const cur = range(days), prev = range(days, days);
    const [daily, prevDaily, queries, pages] = await Promise.all([
      gsc(cfg.gscSite, { ...cur, dimensions: ["date"], rowLimit: 500 }),
      gsc(cfg.gscSite, { ...prev, dimensions: ["date"], rowLimit: 500 }),
      gsc(cfg.gscSite, { ...cur, dimensions: ["query"], rowLimit: 250 }),
      gsc(cfg.gscSite, { ...cur, dimensions: ["page"], rowLimit: 50 }),
    ]);
    return {
      configured: true,
      totals: sum(daily), prev: sum(prevDaily),
      daily: daily.map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
      queries: queries.slice(0, 25), pages: pages.slice(0, 15),
      opportunities: queries.filter((r) => r.position >= 8 && r.position <= 25 && r.impressions >= 20).sort((a, b) => b.impressions - a.impressions).slice(0, 10),
    };
  } catch (e) {
    return { ...empty, configured: true, error: (e as Error).message };
  }
}

export async function ga4Leads(days: number): Promise<{ configured: boolean; sessions?: number; users?: number; error?: string; channels?: { name: string; sessions: number }[] }> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms:google");
  const cfg = await readSetting("google").catch(() => ({ gscSite: "", ga4Property: "" }));
  if (!key() || !cfg.ga4Property) return { configured: false };
  try {
    const t = await token();
    const prop = cfg.ga4Property.replace(/\D/g, "");
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${prop}:runReport`, {
      method: "POST",
      headers: { authorization: `Bearer ${t}`, "content-type": "application/json" },
      body: JSON.stringify({ dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }], dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }, { name: "totalUsers" }] }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(res.status === 403 ? "GA4 says no access. Add the service account email as a Viewer on the property." : `GA4 error ${res.status}`);
    const j = (await res.json()) as { rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[] };
    const rows = j.rows ?? [];
    const channels = rows.map((r) => ({ name: r.dimensionValues[0].value, sessions: Number(r.metricValues[0].value) })).sort((a, b) => b.sessions - a.sessions);
    return { configured: true, channels, sessions: channels.reduce((s, c) => s + c.sessions, 0), users: rows.reduce((s, r) => s + Number(r.metricValues[1].value), 0) };
  } catch (e) {
    return { configured: true, error: (e as Error).message };
  }
}

export type Vitals = { ok: boolean; lcp?: number; inp?: number; cls?: number; score?: number; error?: string; field?: boolean };

/** Core Web Vitals from Google PageSpeed Insights (free). Uses real-user data when Google has it. */
export async function vitals(url: string): Promise<Vitals> {
  "use cache";
  cacheLife("days");
  cacheTag("cms:google");
  try {
    const k = process.env.PAGESPEED_API_KEY ? `&key=${process.env.PAGESPEED_API_KEY}` : "";
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${k}`, { cache: "no-store", signal: AbortSignal.timeout(45_000) });
    if (!res.ok) return { ok: false, error: `PageSpeed error ${res.status}` };
    const j = (await res.json()) as {
      loadingExperience?: { metrics?: Record<string, { percentile: number }> };
      lighthouseResult?: { categories?: { performance?: { score: number } }; audits?: Record<string, { numericValue?: number }> };
    };
    const m = j.loadingExperience?.metrics;
    const a = j.lighthouseResult?.audits;
    const score = Math.round((j.lighthouseResult?.categories?.performance?.score ?? 0) * 100);
    if (m?.LARGEST_CONTENTFUL_PAINT_MS) {
      return { ok: true, field: true, score, lcp: m.LARGEST_CONTENTFUL_PAINT_MS.percentile / 1000, inp: m.INTERACTION_TO_NEXT_PAINT?.percentile, cls: (m.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile ?? 0) / 100 };
    }
    return { ok: true, field: false, score, lcp: (a?.["largest-contentful-paint"]?.numericValue ?? 0) / 1000, cls: a?.["cumulative-layout-shift"]?.numericValue, inp: a?.["total-blocking-time"]?.numericValue };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
