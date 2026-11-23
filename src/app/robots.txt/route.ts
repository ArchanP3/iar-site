import { robotsTxt } from "@/lib/cms/sitemaps";

/* robots.txt: the default rules, or the version saved in the CMS (Sitemaps & Robots). */
export async function GET() {
  return new Response(await robotsTxt(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
