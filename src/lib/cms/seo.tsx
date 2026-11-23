import "server-only";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { COUNTRY_SITES, hreflang, SITE_COUNTRY, SITE_URL } from "@/lib/site";
import { cmsEnabled, lastGood, q } from "./db";
import RawHtml from "@/components/cms/RawHtml";

/* ------------------------------------------------------------------ */
/*  Page SEO overrides from the CMS, applied on top of the defaults     */
/*  written in each page's code. No database = the defaults, unchanged. */
/* ------------------------------------------------------------------ */

export type PageSeo = {
  path: string; title: string | null; description: string | null; canonical: string | null; noindex: boolean; nofollow: boolean;
  og_title: string | null; og_description: string | null; og_image: string | null; focus_keyword: string | null;
  schema_json: string | null; head_html: string | null; body_html: string | null; public_path: string | null; updated_at: Date; updated_by: string | null;
  /** Canada-only SEO (automiqautomation.ca). Empty = the normal fields above, on .ca too. */
  ca_title?: string | null; ca_description?: string | null; ca_schema_json?: string | null;
};

/* On the .ca site the Canada fields replace the normal ones when filled in. */
const forThisSite = (o: PageSeo | null): PageSeo | null =>
  o && SITE_COUNTRY === "CA"
    ? { ...o, title: o.ca_title || o.title, description: o.ca_description || o.description, schema_json: o.ca_schema_json || o.schema_json }
    : o;

export const normPath = (p: string) => {
  let s = (p || "/").split(/[?#]/)[0].trim();
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/\/{2,}/g, "/");
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return s.toLowerCase();
};

async function pageSeoCached(path: string): Promise<PageSeo | null> {
  "use cache";
  cacheLife("max");
  const p = normPath(path);
  cacheTag("cms:seo", `cms:seo:${p}`);
  if (!cmsEnabled()) return null;
  const rows = await q<PageSeo>(`SELECT * FROM cms.cms_page_seo WHERE path = $1`, [p]);
  return rows[0] ?? null;
}
const pageSeoAny = lastGood(pageSeoCached, null);
/** This page's CMS SEO for the site being shown (.ca uses its Canada fields where set). */
export const pageSeo = async (path: string) => forThisSite(await pageSeoAny(path));

/** Every override at once (sitemaps and the audit use this). */
async function allPageSeoCached(): Promise<Record<string, Pick<PageSeo, "noindex" | "canonical" | "public_path">>> {
  "use cache";
  cacheLife("max");
  cacheTag("cms:seo");
  if (!cmsEnabled()) return {};
  const rows = await q<PageSeo>(`SELECT path, noindex, canonical, public_path FROM cms.cms_page_seo WHERE noindex OR canonical IS NOT NULL OR public_path IS NOT NULL`);
  return Object.fromEntries(rows.map((r) => [r.path, { noindex: r.noindex, canonical: r.canonical, public_path: r.public_path }]));
}
export const allPageSeo = lastGood(allPageSeoCached, {});

/* A canonical typed as a full address on either country site (.ca or .com) points at the copy on
   whichever site is showing the page; addresses on other websites are kept as typed. */
const ownHosts = new Set(Object.values(COUNTRY_SITES).map((u) => new URL(u).host.replace(/^www\./, "")));
const abs = (u: string) => {
  if (!/^https?:\/\//.test(u)) return `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;
  try {
    const url = new URL(u);
    if (ownHosts.has(url.host.replace(/^www\./, ""))) return `${SITE_URL}${url.pathname === "/" ? "" : url.pathname}${url.search}`;
  } catch {}
  return u;
};

function merge(path: string, base: Metadata, o: PageSeo | null): Metadata {
  const p = normPath(path);
  const out: Metadata = { ...base };
  const baseCanonical = base.alternates?.canonical;
  const shown = o?.public_path || p;
  const canonical = o?.canonical ? abs(o.canonical) : o?.public_path ? `${SITE_URL}${o.public_path}` : (baseCanonical ?? `${SITE_URL}${shown === "/" ? "" : shown}`);
  out.alternates = { ...base.alternates, canonical, languages: languagesFor(shown, base, o, canonical) };
  if (!o) return out;
  if (o.title) out.title = { absolute: o.title };
  if (o.description) out.description = o.description;
  if (o.noindex || o.nofollow) out.robots = { index: !o.noindex, follow: !o.nofollow };
  const ogTitle = o.og_title || o.title;
  const ogDesc = o.og_description || o.description;
  if (ogTitle || ogDesc || o.og_image) {
    out.openGraph = {
      ...(base.openGraph ?? {}),
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(ogDesc ? { description: ogDesc } : {}),
      ...(o.og_image ? { images: [{ url: abs(o.og_image) }] } : {}),
    };
    out.twitter = { ...(base.twitter ?? {}), ...(ogTitle ? { title: ogTitle } : {}), ...(ogDesc ? { description: ogDesc } : {}), ...(o.og_image ? { images: [abs(o.og_image)] } : {}) };
  }
  return out;
}

/* hreflang <link> tags (.ca <-> .com + x-default) in the page head, using the same rules as the
   sitemaps: only for indexable pages whose canonical is the page itself on this site, built from
   that canonical (so a CMS public path is used). A page that is on one country site only (city
   pages, CMS "Show on" pages) passes `languages: {}` to get none. */
function languagesFor(shown: string, base: Metadata, o: PageSeo | null, canonical: unknown) {
  const robots = base.robots;
  if (o?.noindex || (typeof robots === "string" && /\bnoindex\b/.test(robots)) || (robots && typeof robots === "object" && robots.index === false)) return undefined;
  const c = typeof canonical === "string" ? canonical : canonical instanceof URL ? canonical.href : null;
  if (!c) return undefined;
  // Relative, or a full address on this site. A canonical on any other website means no hreflang.
  if (/^https?:\/\//.test(c) && !c.startsWith(`${SITE_URL}/`) && c !== SITE_URL) return undefined;
  const own = c.replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0] || "/";
  if (normPath(own) !== shown) return undefined;
  if (base.alternates && "languages" in base.alternates) return base.alternates.languages;
  return hreflang(own);
}

/** Use inside generateMetadata: return withSeo("/about", { title, description }). */
export async function withSeo(path: string, base: Metadata): Promise<Metadata> {
  return merge(path, base, await pageSeo(path));
}

/** For pages that had `export const metadata`: export const generateMetadata = seo("/about", {...}). */
export function seo(path: string, base: Metadata) {
  return async function generateMetadata(): Promise<Metadata> {
    return withSeo(path, base);
  };
}

/** Custom JSON-LD and page scripts added in the CMS for this page. Renders nothing otherwise. */
export async function PageExtras({ path }: { path: string }) {
  const o = await pageSeo(path);
  if (!o || (!o.schema_json && !o.head_html && !o.body_html)) return null;
  const ld = safeJson(o.schema_json);
  return (
    <>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />}
      {o.head_html && <RawHtml html={o.head_html} where="head" id={`page-head:${o.path}`} />}
      {o.body_html && <RawHtml html={o.body_html} where="body" id={`page-body:${o.path}`} />}
    </>
  );
}

/* Valid JSON only, and never able to close the <script> tag early. */
export function safeJson(s: string | null | undefined): string | null {
  if (!s?.trim()) return null;
  try {
    return JSON.stringify(JSON.parse(s)).replace(/</g, "\\u003c");
  } catch {
    return null;
  }
}
