import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hreflang, indexable, onThisSite, SITE_URL } from "@/lib/site";
import { getProductSitemapCount } from "@/lib/catalog";
import { industries } from "@/lib/industries";
import { cmsEnabled, q } from "./db";
import { siteUrls, type SiteUrl } from "./inventory";
import { allPageSeo, normPath } from "./seo";
import { setting } from "./settings";

/* ------------------------------------------------------------------ */
/*  XML sitemaps, rebuilt automatically whenever something changes:     */
/*  /sitemap.xml (index) -> pages, posts, locations, fault codes,       */
/*  images and /parts/sitemap/N.xml. Drafts, noindex pages, redirected  */
/*  URLs and pages that point their canonical elsewhere are left out.   */
/*  With two country sites (.ca/.com), each site lists only its own     */
/*  pages, and pages that exist on both carry hreflang links.           */
/* ------------------------------------------------------------------ */

export const SITEMAPS = ["pages", "posts", "locations", "fault-codes", "images"] as const;
export type SitemapName = (typeof SITEMAPS)[number];
const KEY: Record<SitemapName, "pages" | "posts" | "locations" | "faultCodes" | "images"> = { pages: "pages", posts: "posts", locations: "locations", "fault-codes": "faultCodes", images: "images" };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function redirectedPaths(): Promise<Set<string>> {
  if (!cmsEnabled()) return new Set();
  try {
    return new Set((await q<{ from_path: string }>(`SELECT from_path FROM cms.cms_redirects WHERE active`)).map((r) => r.from_path));
  } catch {
    return new Set();
  }
}

/** The URLs that belong in sitemaps, after CMS overrides. */
export async function indexableUrls(): Promise<(SiteUrl & { loc: string; alternates?: Record<string, string> })[]> {
  const [urls, seo, redirected] = await Promise.all([siteUrls(), allPageSeo(), redirectedPaths()]);
  const out: (SiteUrl & { loc: string; alternates?: Record<string, string> })[] = [];
  for (const u of urls) {
    if (!u.sitemap || !onThisSite(u.country)) continue;
    const o = seo[u.path];
    if (o?.noindex) continue;
    const shown = o?.public_path || u.path;
    if (o?.canonical) {
      const c = normPath(o.canonical.replace(/^https?:\/\/[^/]+/, ""));
      if (c !== shown) continue;
    }
    if (redirected.has(shown)) continue;
    out.push({ ...u, loc: `${SITE_URL}${shown === "/" ? "" : shown}`, alternates: hreflang(shown, u.country) });
  }
  return out;
}

export async function sitemapIndexXml(): Promise<string> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms:seo", "cms:settings", "cms:sitemaps");
  const s = (await setting("site")).sitemaps;
  const files: string[] = [];
  for (const n of SITEMAPS) if (s[KEY[n]]) files.push(`${SITE_URL}/sitemaps/${n}.xml`);
  if (s.parts) {
    const n = await getProductSitemapCount(); // files served by src/app/(catalog)/parts/sitemap.ts
    for (let i = 0; i < n; i++) files.push(`${SITE_URL}/parts/sitemap/${i}.xml`);
  }
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map((f) => `  <sitemap><loc>${esc(f)}</loc><lastmod>${now}</lastmod></sitemap>`).join("\n")}\n</sitemapindex>\n`;
}

export async function sitemapXml(name: SitemapName): Promise<string | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms:seo", "cms:posts", "cms:landing", "cms:redirects", "cms:settings", "cms:media", "cms:sitemaps");
  const s = (await setting("site")).sitemaps;
  if (!s[KEY[name]]) return null;
  if (name === "images") return imagesXml();
  const want = name === "fault-codes" ? "faultCodes" : name;
  const rows = (await indexableUrls()).filter((u) => u.sitemap === want);
  const body = rows
    .map((u) => `  <url><loc>${esc(u.loc)}</loc>${altLinks(u.alternates)}${u.lastModified ? `<lastmod>${u.lastModified.toISOString()}</lastmod>` : ""}<changefreq>${u.group === "blog" ? "weekly" : "monthly"}</changefreq><priority>${u.priority.toFixed(1)}</priority></url>`)
    .join("\n");
  const ns = rows.some((u) => u.alternates) ? ` xmlns:xhtml="http://www.w3.org/1999/xhtml"` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${ns}>\n${body}\n</urlset>\n`;
}

/** <xhtml:link> hreflang tags (.ca <-> .com) for a page on both country sites. */
const altLinks = (alt?: Record<string, string>) =>
  alt ? Object.entries(alt).map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${esc(href)}"/>`).join("") : "";

async function imagesXml(): Promise<string> {
  const pages = await indexableUrls();
  const byLoc = new Map<string, [string, string][]>();
  const add = (loc: string, src: string, title: string) => {
    if (!src) return;
    const abs = /^https?:\/\//.test(src) ? src : `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
    const l = byLoc.get(loc) ?? [];
    if (!l.some((x) => x[0] === abs) && l.length < 50) l.push([abs, title]);
    byLoc.set(loc, l);
  };
  // Images found on each page by the last site scan
  if (cmsEnabled()) {
    try {
      const crawled = await q<{ path: string; image_list: [string, string][] }>(`SELECT path, image_list FROM cms.cms_crawl WHERE status = 200`);
      const locOf = new Map(pages.map((p) => [p.path, p.loc]));
      for (const c of crawled) {
        const loc = locOf.get(c.path);
        if (loc) c.image_list.filter(([src]) => !/\.svg($|\?)/.test(src) && !/logo|icon/i.test(src)).forEach(([src, alt]) => add(loc, src, alt));
      }
      const media = await q<{ filename: string; alt: string; caption: string }>(`SELECT filename, alt, caption FROM cms.cms_media ORDER BY id DESC LIMIT 1000`);
      media.forEach((m) => add(`${SITE_URL}/`, `/media/${m.filename}`, m.alt || m.caption));
    } catch {}
  }
  // Always include the industry photos, even before the first scan
  industries.forEach((i) => i.image && add(`${SITE_URL}/industries/${i.slug}`, i.image, `${i.name} equipment repair`));
  const body = [...byLoc.entries()]
    .map(([loc, imgs]) => `  <url><loc>${esc(loc)}</loc>${imgs.map(([src, t]) => `<image:image><image:loc>${esc(src)}</image:loc>${t ? `<image:title>${esc(t)}</image:title>` : ""}</image:image>`).join("")}</url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;
}

/* ------------------------------------------------------------------ */
/*  robots.txt                                                          */
/* ------------------------------------------------------------------ */
export function defaultRobots(): string {
  return ["User-agent: *", "Allow: /", "Disallow: /api/", "Disallow: /search", "Disallow: /admin", "", `Sitemap: ${SITE_URL}/sitemap.xml`, ""].join("\n");
}

export async function robotsTxt(): Promise<string> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms:settings");
  // Not the live site yet: keep every crawler out, whatever the CMS says.
  if (!indexable) return "User-agent: *\nDisallow: /\n";
  const custom = (await setting("robots")).custom?.trim();
  if (!custom) return defaultRobots();
  return /^sitemap:/im.test(custom) ? custom + "\n" : `${custom}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

/** Refuses robots.txt rules that would hide the whole site from Google. */
export function robotsProblem(txt: string): string | null {
  let agentAll = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;
    const [k, ...rest] = line.split(":");
    const v = rest.join(":").trim();
    if (/^user-agent$/i.test(k)) agentAll = v === "*" || /googlebot/i.test(v);
    if (agentAll && /^disallow$/i.test(k) && v === "/") return "This would hide the whole website from Google (Disallow: /). Saving is blocked.";
  }
  return null;
}

/** Is a path blocked by robots.txt rules? (Longest matching rule wins, like Google.) */
export function robotsVerdict(txt: string, path: string): { allowed: boolean; rule: string | null } {
  let inStar = false;
  const rules: [boolean, string][] = [];
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const [k, ...rest] = line.split(":");
    const v = rest.join(":").trim();
    if (/^user-agent$/i.test(k)) inStar = v === "*";
    else if (inStar && /^(allow|disallow)$/i.test(k) && v) rules.push([/^allow$/i.test(k), v]);
  }
  let best: [boolean, string] | null = null;
  for (const r of rules) {
    const re = new RegExp("^" + r[1].replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));
    if (re.test(path) && (!best || r[1].length > best[1].length || (r[1].length === best[1].length && r[0]))) best = r;
  }
  return { allowed: best ? best[0] : true, rule: best ? `${best[0] ? "Allow" : "Disallow"}: ${best[1]}` : null };
}
