import { sitemapIndexXml } from "@/lib/cms/sitemaps";

/* /sitemap.xml: index of all sitemaps (see src/lib/cms/sitemaps.ts) */
export async function GET() {
  // PREVIEW BRANCH ONLY: no database, no sitemap.
  if (process.env.PREVIEW_NO_DB === "1") return new Response('<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>', { headers: { "content-type": "application/xml; charset=utf-8" } });
  return new Response(await sitemapIndexXml(), { headers: { "content-type": "application/xml; charset=utf-8" } });
}
