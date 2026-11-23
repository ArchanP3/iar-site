import { SITEMAPS, sitemapXml, type SitemapName } from "@/lib/cms/sitemaps";

/* /sitemaps/pages.xml, posts.xml, locations.xml, fault-codes.xml, images.xml */
export function generateStaticParams() {
  return SITEMAPS.map((n) => ({ name: `${n}.xml` }));
}

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  if (process.env.PREVIEW_NO_DB === "1") return new Response("Not available in preview", { status: 404 }); // PREVIEW BRANCH ONLY
  const n = (await params).name.replace(/\.xml$/, "") as SitemapName;
  const xml = SITEMAPS.includes(n) ? await sitemapXml(n) : null;
  if (!xml) return new Response("Not found", { status: 404 });
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
