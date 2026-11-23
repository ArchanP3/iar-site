import type { MetadataRoute } from "next";
import { getProductSitemapChunk, getProductSitemapCount } from "@/lib/catalog";
import { absoluteUrl, hreflang } from "@/lib/site";

// /parts/sitemap/{id}.xml — up to 20,000 products per file (SITEMAP_CHUNK), chunked by id range.
// The number of files is fixed at build time; redeploy after large imports.
export async function generateSitemaps() {
  const count = await getProductSitemapCount();
  return Array.from({ length: count }, (_, id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const chunk = Number(await props.id);
  const rows = await getProductSitemapChunk(chunk);
  // Parts are the same on .ca and .com: hreflang links once the two country sites are live.
  return rows.map((r) => {
    const alt = hreflang(`/parts/${r.slug}`);
    return { url: absoluteUrl(`/parts/${r.slug}`), lastModified: r.updated_at, ...(alt ? { alternates: { languages: alt } } : {}) };
  });
}
