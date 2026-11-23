import "server-only";
import { posts, postUrl } from "@/lib/blog";
import { areas, areaUrl } from "@/lib/serviceAreas";
import { allServices } from "@/lib/services";
import { brands, brandUrl } from "@/lib/brands";
import { getCategories, getManufacturers } from "@/lib/catalog";
import { industries, industryUrl } from "@/lib/industries";
import { families, familyUrl, codeUrl, hasGuide } from "@/lib/faultCodes";
import { publishedLanding, publishedPosts } from "./content";
import type { Country } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Every public page of the website, grouped. Used by the sitemaps,    */
/*  the Pages screen and the SEO audit. Part pages are listed in their  */
/*  own sitemaps and the Parts Catalog screen.                          */
/* ------------------------------------------------------------------ */

export type Group = "main" | "services" | "brands" | "industries" | "cities" | "faultCodes" | "shop" | "blog" | "landing" | "legal" | "system";
export const groupLabel: Record<Group, string> = {
  main: "Main", services: "Services", brands: "Brands", industries: "Industries", cities: "Cities", faultCodes: "Fault codes",
  shop: "Shop", blog: "Blog", landing: "Landing", legal: "Legal", system: "System",
};
export type SiteUrl = { path: string; group: Group; priority: number; sitemap: "pages" | "posts" | "locations" | "faultCodes" | null; lastModified?: Date;
  /** Set for pages that exist on one country's site only (.ca or .com). */
  country?: Country };

const MAIN: [string, number][] = [
  ["/", 1], ["/services", 0.9], ["/brands", 0.9], ["/request-repair", 0.9], ["/request-pickup", 0.8], ["/request-quote", 0.8], ["/request-cable", 0.7],
  ["/industries", 0.8], ["/about", 0.6], ["/contact", 0.6], ["/international", 0.7], ["/on-site-service", 0.8], ["/sell-surplus", 0.6],
  ["/resources", 0.7], ["/resources/downtime-calculator", 0.7], ["/resources/repair-or-replace", 0.7], ["/resources/part-checker", 0.6],
  ["/resources/faqs", 0.6], ["/resources/glossary", 0.6], ["/resources/shipping", 0.6], ["/site-map", 0.3],
];

export async function siteUrls(): Promise<SiteUrl[]> {
  const out: SiteUrl[] = [];
  const add = (path: string, group: Group, priority: number, sitemap: SiteUrl["sitemap"], lastModified?: Date, country?: Country) => out.push({ path, group, priority, sitemap, lastModified, country });
  MAIN.forEach(([p, pr]) => add(p, "main", pr, "pages"));
  add("/fault-codes", "faultCodes", 0.8, "faultCodes");
  families.forEach((f) => add(familyUrl(f), "faultCodes", 0.6, "faultCodes"));
  families.forEach((f) => f.codes.filter(hasGuide).forEach((c) => add(codeUrl(f, c), "faultCodes", 0.5, "faultCodes")));
  allServices.filter((s) => s.answer).forEach((s) => add(`/services/${s.slug}`, "services", 0.8, "pages"));
  brands.forEach((b) => add(brandUrl(b.slug), "brands", 0.7, "pages"));
  industries.forEach((i) => add(industryUrl(i.slug), "industries", 0.7, "pages"));
  add("/service-areas", "cities", 0.7, "locations");
  areas.forEach((a) => add(areaUrl(a.slug), "cities", 0.6, "locations", undefined, a.country));
  add("/shop", "shop", 0.9, "pages");
  add("/shop/brands", "shop", 0.8, "pages");
  // Only catalog facets: other category and brand listings are noindex keyword matches.
  const [cats, makers] = await Promise.all([getCategories(), getManufacturers()]);
  cats.forEach((c) => add(`/shop/${c.slug}`, "shop", 0.7, "pages"));
  makers.forEach((m) => add(`/shop/brands/${m.slug}`, "shop", 0.6, "pages"));
  add("/resources/blog", "blog", 0.7, "posts");
  const dbPosts = await publishedPosts();
  const codeSlugs = new Set(posts.map((p) => p.slug));
  posts.forEach((p) => add(postUrl(p.slug), "blog", 0.6, "posts", new Date(p.date)));
  const only = (s: string | undefined) => (s === "CA" || s === "US" ? s : undefined); // CMS "Show on" setting
  dbPosts.filter((p) => !codeSlugs.has(p.slug)).forEach((p) => add(postUrl(p.slug), "blog", 0.6, "posts", new Date(p.updated_at), only(p.site)));
  (await publishedLanding()).forEach((l) => add(l.path, "landing", 0.7, l.in_sitemap === "locations" ? "locations" : "pages", new Date(l.updated_at), only(l.site)));
  [["/warranty", 0.5], ["/terms", 0.3], ["/privacy", 0.3]].forEach(([p, pr]) => add(p as string, "legal", pr as number, "pages"));
  ["/cart", "/checkout"].forEach((p) => add(p, "system", 0, null));
  return out;
}
