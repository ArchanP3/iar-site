export const site = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "AutomIQ Automation & Drive Services",
  // Until a custom domain is set, fall back to Vercel's production URL.
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  ).replace(/\/$/, ""),
  description:
    "Industrial automation parts and repair — servo drives, motors, PLCs, HMIs, power supplies and more. Mississauga, Ontario. Serving Canada & USA.",
  showRatings: process.env.NEXT_PUBLIC_SHOW_RATINGS === "true",
};

/** Vercel preview deploys: no CMS database, no tracking tags, no indexing. */
export const isPreview = Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production";

/** On Vercel, allow crawling only in production with a real domain set, so
    previews and the bare *.vercel.app URL stay out of search results. */
export const indexable = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" && !!process.env.NEXT_PUBLIC_SITE_URL : true;

/** Origin without a trailing slash, e.g. for building absolute URLs inline. */
export const SITE_URL = site.url;

/* ------------------------------------------------------------------ */
/*  Two country sites from one codebase and one database:              */
/*    automiqautomation.ca  -> NEXT_PUBLIC_SITE_COUNTRY=CA (Canada)      */
/*    automiqautomation.com -> NEXT_PUBLIC_SITE_COUNTRY=US (USA + rest)  */
/*  Not set = one site for both countries (how it worked before .ca),   */
/*  so nothing changes until the variable is set in Vercel.             */
/*  Shared pages (parts, services, brands...) exist on both domains and */
/*  are linked with hreflang in the sitemaps; city pages live only on   */
/*  their own country's domain (the other domain 301s to it).           */
/* ------------------------------------------------------------------ */
export type Country = "CA" | "US";
const envCountry = process.env.NEXT_PUBLIC_SITE_COUNTRY?.trim().toUpperCase();
export const SITE_COUNTRY: Country | null = envCountry === "CA" || envCountry === "US" ? envCountry : null;

const otherOf = (c: Country): Country => (c === "CA" ? "US" : "CA");
const origin = (v: string | undefined, fallback: string) => (v || fallback).replace(/\/$/, "");
/** Home address of each country site (this site's own entry is always SITE_URL). */
export const COUNTRY_SITES: Record<Country, string> = {
  CA: SITE_COUNTRY === "CA" ? SITE_URL : origin(process.env.NEXT_PUBLIC_CA_SITE_URL, "https://automiqautomation.ca"),
  US: SITE_COUNTRY === "US" ? SITE_URL : origin(process.env.NEXT_PUBLIC_US_SITE_URL, "https://automiqautomation.com"),
};
/** The other country's site, or null while there is only one site. */
export const PARTNER_URL = SITE_COUNTRY ? COUNTRY_SITES[otherOf(SITE_COUNTRY)] : null;

/** Language tag for <html lang> and Open Graph (plain "en" until the two sites are split). */
export const LOCALE = SITE_COUNTRY === "US" ? "en-US" : SITE_COUNTRY === "CA" ? "en-CA" : "en";

/** CMS "Show on" setting for landing pages and blog posts. */
export type SiteChoice = "both" | Country;
export const SITE_CHOICES: [SiteChoice, string][] = [["both", "Both sites (.ca and .com)"], ["CA", "Canada only (automiqautomation.ca)"], ["US", "USA only (automiqautomation.com)"]];
export const siteChoice = (v: unknown): SiteChoice => (v === "CA" || v === "US" ? v : "both");

/** Does a page meant for this country (or "both"/unset) belong on this site? */
export const onThisSite = (c?: Country | "both" | null) => !SITE_COUNTRY || !c || c === "both" || c === SITE_COUNTRY;

/** Link to a page that may live on the other country's site: a path here, a full address there. */
export const hrefFor = (path: string, c?: Country | "both" | null) => (onThisSite(c) ? path : `${COUNTRY_SITES[c as Country]}${path}`);

/** Full address of a page, on whichever country site it lives. */
export const absoluteFor = (path: string, c?: Country | "both" | null) => `${onThisSite(c) ? SITE_URL : COUNTRY_SITES[c as Country]}${path}`;

/** hreflang alternates for a page that exists on both sites (sitemaps only). Country-only pages
    and the single-site setup get none. x-default = .com, the site for visitors outside Canada. */
export function hreflang(path: string, c?: Country | "both" | null): Record<string, string> | undefined {
  if (!SITE_COUNTRY || (c && c !== "both")) return undefined;
  const p = path === "/" ? "" : path;
  return { "en-CA": COUNTRY_SITES.CA + p, "en-US": COUNTRY_SITES.US + p, "x-default": COUNTRY_SITES.US + p };
}

export const PAGE_SIZE = 24;
/** Part ids per parts sitemap file. Google allows 50,000 URLs, but with the .ca/.com hreflang
    links a 50,000 file is over Vercel's 20 MB page limit, so files hold 20,000 ids. */
export const SITEMAP_CHUNK = 20_000;

export function absoluteUrl(path: string) {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/* Where share images (WhatsApp, LinkedIn, Google previews) are loaded from. */
export const SHARE_URL = SITE_URL;

/* Share picture for a page: service photos (.webp) have a JPG copy in /public/og, because some apps
   (WhatsApp on older phones) don't show WebP previews. Anything else is used as is. */
export const shareImage = (src?: string) => {
  if (!src) return `${SHARE_URL}/opengraph-image.png`;
  if (/^https?:\/\//.test(src)) return src;
  const m = src.match(/^\/services\/([\w-]+)\.webp$/);
  return `${SHARE_URL}${m ? `/og/services-${m[1]}.jpg` : src}`;
};
