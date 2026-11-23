import { sitemapIndexXml } from "@/lib/cms/sitemaps";

/* /sitemap.xml: index of all sitemaps (see src/lib/cms/sitemaps.ts) */
export async function GET() {
  return new Response(await sitemapIndexXml(), { headers: { "content-type": "application/xml; charset=utf-8" } });
}
