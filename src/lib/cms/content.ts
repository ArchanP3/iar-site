import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { cmsEnabled, lastGood, q } from "./db";
import type { SiteChoice } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Blog posts and landing pages written in the CMS (cached reads).     */
/* ------------------------------------------------------------------ */

export type CmsPost = {
  id: number; slug: string; title: string; excerpt: string; body: string; cover: string | null; cover_alt: string | null;
  category: string; tags: string[]; author_name: string; author_role: string; author_bio: string; status: string;
  publish_at: Date | null; seo_title: string | null; seo_description: string | null; faq: [string, string][]; related: [string, string][];
  created_at: Date; updated_at: Date; updated_by: string | null;
  /** Which country site shows it: both, CA (.ca only) or US (.com only). */
  site: SiteChoice;
};

export type Block =
  | { type: "hero"; eyebrow?: string; heading: string; text?: string; primary?: { label: string; href: string }; secondary?: { label: string; href: string }; tone?: "navy" | "light" }
  | { type: "text"; heading?: string; body: string }
  | { type: "services"; heading?: string; items: string[] }
  | { type: "brands"; heading?: string; items: string[] }
  | { type: "steps"; heading?: string; items: { t: string; d: string }[] }
  | { type: "trust"; items: { t: string; d: string }[] }
  | { type: "faq"; heading?: string; items: [string, string][] }
  | { type: "imageText"; heading: string; body: string; image: string; alt: string; side?: "left" | "right" }
  | { type: "cta"; heading: string; text?: string; primary: { label: string; href: string }; secondary?: { label: string; href: string } }
  | { type: "parts"; heading?: string; query: string };

export type CmsLanding = {
  id: number; path: string; name: string; kind: "page" | "template"; blocks: Block[]; vars: Record<string, string>; template_id: number | null;
  status: string; seo_title: string | null; seo_description: string | null; in_sitemap: string; updated_at: Date;
  /** Which country site shows it: both, CA (.ca only) or US (.com only). */
  site: SiteChoice;
};

const LIVE = `status = 'published' OR (status = 'scheduled' AND publish_at <= now())`;

async function publishedPostsCached(): Promise<CmsPost[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms:posts");
  if (!cmsEnabled()) return [];
  return await q<CmsPost>(`SELECT * FROM cms.cms_posts WHERE ${LIVE} ORDER BY COALESCE(publish_at, created_at) DESC`);
}
export const publishedPosts = lastGood(publishedPostsCached, []);

async function postBySlugCached(slug: string): Promise<CmsPost | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms:posts", `cms:post:${slug}`);
  if (!cmsEnabled() || !/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  return (await q<CmsPost>(`SELECT * FROM cms.cms_posts WHERE slug = $1 AND (${LIVE})`, [slug]))[0] ?? null;
}
export const postBySlug = lastGood(postBySlugCached, null);

async function publishedLandingCached(): Promise<Pick<CmsLanding, "path" | "updated_at" | "in_sitemap" | "name" | "site">[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms:landing");
  if (!cmsEnabled()) return [];
  return await q(`SELECT path, updated_at, in_sitemap, name, site FROM cms.cms_landing WHERE kind = 'page' AND status = 'published' ORDER BY path`);
}
export const publishedLanding = lastGood(publishedLandingCached, []);

async function landingByPathCached(path: string): Promise<CmsLanding | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms:landing", `cms:landing:${path}`);
  if (!cmsEnabled()) return null;
  return (await q<CmsLanding>(`SELECT * FROM cms.cms_landing WHERE path = $1 AND kind = 'page' AND status = 'published'`, [path]))[0] ?? null;
}
export const landingByPath = lastGood(landingByPathCached, null);

async function landingTemplateCached(id: number): Promise<CmsLanding | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("cms:landing", `cms:template:${id}`);
  if (!cmsEnabled()) return null;
  return (await q<CmsLanding>(`SELECT * FROM cms.cms_landing WHERE id = $1 AND kind = 'template'`, [id]))[0] ?? null;
}
export const landingTemplate = lastGood(landingTemplateCached, null);

export const readMinutes = (md: string) => Math.max(1, Math.round(md.split(/\s+/).filter(Boolean).length / 200));
